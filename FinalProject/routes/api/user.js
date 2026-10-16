import express from "express";

const router = express.Router();

import debug from "debug";
import {
  GetAllUsers,
  GetUserByEmail,
  GetUserById,
  createUser,
  updateUser,
  deleteUser,
  saveAuditLog,
  findRoleByName,
} from "../../database.js";
import { validBody } from "../../middleware/validBody.js";
import { validId } from "../../middleware/validid.js";
const debugUser = debug("app:UserRouter");

import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isLoggedIn, hasPermission, hasRole } from "@merlin4/express-auth";
import { fetchRoles } from "@merlin4/express-auth";
import { mergePermissions } from "@merlin4/express-auth";

router.use(express.urlencoded({ extended: false }));

const newUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email",
    )
    .required(),
  password: Joi.string().min(6).max(30).required(),
  givenName: Joi.string().min(3).max(20).required(),
  familyName: Joi.string().min(3).max(20).required(),
  role: Joi.array().items(Joi.string().min(3)).unique().optional(),
}).unknown(true);

const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email",
    )
    .optional(),
  givenName: Joi.string().min(3).max(20).optional(),
  familyName: Joi.string().min(3).max(20).optional(),
  fullName: Joi.string().min(3).max(50).optional(),
}).unknown(true);

const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email",
    )
    .required(),
  password: Joi.string().min(6).max(30).required(),
}).unknown(true);

const updatePasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email",
    )
    .optional(),
  currentPassword: Joi.string().min(6).max(30).required(),
  newPassword: Joi.string().min(6).max(30).required(),
}).unknown(true);

async function issueAuthToken(user) {
  const roles = await fetchRoles(user, (role) => findRoleByName(role));

  const permissions = mergePermissions(user, roles);

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      permissions: permissions,
      fullName: `${user.givenName} ${user.familyName}`.trim(),
    },
    process.env.JWT_SECRET,
  );

  return token;
}

async function issueAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/",
  };
  res.cookie("authToken", token, cookieOptions);
}

router.get("", isLoggedIn(), hasPermission("canViewData"), async (req, res) => {
  if (req.auth) {
    debugUser(req.auth.email);
  }

  let match = {};

  let { keywords, roles, sortBy } = req.query;

  debugUser(`Keywords: ${keywords}`);
  debugUser(`Roles: ${roles}`);
  if (keywords) {
    match.$text = { $search: keywords };
  }

  if (roles) {
    match.role = { $eq: roles };
  }

  let sort = { givenName: 1 };

  switch (sortBy) {
    case "givenName":
      sort = { givenName: 1 };
      break;
    case "familyName":
      sort = { familyName: 1 };
      break;
    case "role":
      sort = { role: 1 };
      break;
    default:
      sort = { givenName: 1 };
      break;
  }

  const pipeline = [{ $match: match }, { $sort: sort }];

  // Get All Users
  let users = await GetAllUsers(pipeline);

  res.status(200).json({ users, message: "Users retrieved successfully" });
});

// Users can view their account information
router.get("/me", isLoggedIn(), async (req, res) => {
  debugUser(`User: ${req.auth.email}`);

  // Retrieve the userId from the authenticated request
  const userId = req.auth._id;
  debugUser(`User ID: ${userId}`);

  try {
    // Query the database to fetch user details
    const user = await GetUserById(userId);

    if (user) {
      res.status(200).json({ user, message: "User retrieved successfully" });
    } else {
      res.status(404).json({ message: `User ${userId} not found.` });
    }
  } catch (err) {
    // Send 500 error if database query fails
    res.status(500).json({ message: err.message });
    console.log(error.message);
  }
});

// Create New User
router.post("/register", validBody(newUserSchema), async (req, res, next) => {
  const newUser = req.body;

  const exsistingUser = await GetUserByEmail(newUser.email);

  if (exsistingUser) {
    res.status(200).json({ message: "Email already exists" });
    return;
  } else {
    // save the new user to the DB
    try {
      //Create hashed password
      newUser.password = await bcrypt.hash(newUser.password, 10);
      newUser.createdOn = new Date();
      newUser.role = ["Customer"];
      const result = await createUser(newUser);

      const log = {
        timestamp: new Date(),
        collection: "users",
        operation: "insert",
        target: newUser._id,
        update: JSON.stringify(newUser),
      };
      await saveAuditLog(log);

      // Issue JWT token
      const jwtToken = await issueAuthToken(newUser);

      // Create auth cookie
      await issueAuthCookie(res, jwtToken);
      return res.status(200).json({
        message: `New user registered!`,
        newUser,
        authToken: jwtToken,
      });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
});

//Login User
router.post("/login", validBody(loginUserSchema), async (req, res, next) => {
  // Get user credentials from DB
  const { email, password } = req.body;

  // Check if user exists by checking email
  try {
    const existingUser = await GetUserByEmail(email);
    if (!existingUser) {
      debugUser(`Invalid email`);
      return res.status(401).json({ message: `Invalid email or password` });
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      debugUser(`Invalid password`);
      return res.status(401).json({ message: `Invalid email or password` });
    }

    debugUser(`User email and password verified`);

    // Issue JWT token
    const jwtToken = await issueAuthToken(existingUser);
    await issueAuthCookie(res, jwtToken);

    return res.status(200).json({
      message: `Welcome back!`,
      role: existingUser.role,
      email: existingUser.email,
      token: jwtToken,
    });
  } catch (e) {
    debugUser(e);
    return res.status(500).json({ message: `Error logging in user` });
  }
});

router.post("/logout", isLoggedIn(), async (req, res, next) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logged out successfully" });
});

//Users can update their own account information
router.patch(
  "/me",
  isLoggedIn(),
  validBody(updateUserSchema),
  async (req, res, next) => {
    const userId = req.auth._id;
    const updatedUser = req.body;

    try {
      const user = await GetUserById(userId);
      if (user) {
        for (const key of Object.keys(updatedUser)) {
          user[key] = updatedUser[key];
        }
        user.lastUpdatedOn = new Date();
        user.lastUpdatedBy = req.auth._id;

        const result = await updateUser(user);
        const log = {
          timestamp: new Date(),
          collection: "users",
          operation: "update",
          target: user._id,
          update: updatedUser,
          auth: req.auth,
        };
        await saveAuditLog(log);
        return res.status(200).json({ message: `User  updated!` });
      } else {
        res.status(404).send(`User not found.`);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

// Get User by ID
router.get(
  "/:userId",
  validId("userId"),
  isLoggedIn(),
  hasPermission("canViewData"),
  async (req, res, next) => {
    const userId = req.params.userId;
    try {
      // If user is found, return user details
      const user = await GetUserById(userId);
      console.log(`${userId} returned successfully!`);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: `User not found.` });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

//Admins and TM's can update user information
//If user is updating their own account, issue a new token
router.patch(
  "/:userId",
  isLoggedIn(),
  validBody(updateUserSchema),
  validId("userId"),
  hasPermission("canEditAnyUser"),
  async (req, res, next) => {
    const userId = req.auth._Id;
    const updatedUser = req.body;

    try {
      const user = await GetUserById(userId);
      if (user) {
        for (const key of Object.keys(updatedUser)) {
          user[key] = updatedUser[key];
          user.lastUpdatedOn = new Date();
          user.lastUpdatedBy = req.auth._id;
        }

        // issue a new token if the user is updating their own account
        if (req.auth._id === userId) {
          const jwtToken = await issueAuthToken(user);
          return await issueAuthCookie(res, jwtToken);
        }
        const result = await updateUser(user);
        const log = {
          timestamp: new Date(),
          collection: "users",
          operation: "update",
          target: user._id,
          update: updatedUser,
        };
        await saveAuditLog(log);
        return res.status(200).json({ message: `User updated!` });
      } else {
        res.status(404).json({ message: `User ${userId} not found.` });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

//Delete User
router.delete(
  "/:userId",
  isLoggedIn(),
  validId("userId"),
  hasPermission("canEditAnyUser"),
  async (req, res, next) => {
    const userId = req.params.userId;

    try {
      const userToDelete = await GetUserById(userId);
      debugUser(`User to delete: ${JSON.stringify(userToDelete)}`);

      const result = await deleteUser(userId);
      debugUser(`User deleted: ${JSON.stringify(result)}`);
      const log = {
        timestamp: new Date(),
        collection: "users",
        operation: "delete",
        target: userId,
        update: result,
      };
      await saveAuditLog(log);
      res.status(200).json({ message: `User ${userId} deleted!`, userId });
    } catch (err) {
      res.status(500).send(err);
    }
  },
);

export { router as userRouter };
