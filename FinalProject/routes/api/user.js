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
} from "../../database.js";
import { validBody } from "../../middleware/validBody.js";
import { validId } from "../../middleware/validid.js";
const debugUser = debug("app:UserRouter");

import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isLoggedIn } from "@merlin4/express-auth";

router.use(express.urlencoded({ extended: false }));

const newUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email"
    )
    .required(),
  password: Joi.string().min(6).max(30).required(),
  givenName: Joi.string().min(3).max(20).required(),
  familyName: Joi.string().min(3).max(20).required(),
  role: Joi.string().min(3).optional(),
});

const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email"
    ),
  password: Joi.string().min(6).max(30),
  givenName: Joi.string().min(3).max(20),
  familyName: Joi.string().min(3).max(20),
  role: Joi.string().min(3),
});

const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
      "email"
    )
    .required(),
  password: Joi.string().min(6).max(30).required(),
});

async function issueAuthToken(user) {
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
}

async function issueAuthCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    sameSite: "strict",
    secure: true,
  };
  res.cookie("authToken", token, cookieOptions);
}

router.get("", isLoggedIn(), async (req, res) => {
  // Get All Users
  let users = await GetAllUsers();

  if (req.auth) {
    debugUser(req.auth.email);
  }

  // Get users search query
  const { role, maxAge, minAge, sortBy, pageNumber, pageSize } = req.query;
  console.log("Received query parameters:", req.query);

  // Filter users by role
  if (role) {
    users = users.filter((user) => user.role === role);
    debugUser(`Role: ${role}`);
  }

  // Filter users by age of account
  if (maxAge || minAge) {
    users = users.filter((user) => {
      if (maxAge) {
        return new Date(user.createdDate) <= new Date(maxAge);
      }
      if (minAge) {
        return new Date(user.createdDate) >= new Date(minAge);
      }
    });
    debugUser(`Max Age: ${maxAge}, Min Age: ${minAge}`);
  }

  // Sort users by date, role, name, or createdDate
  const allowedSorts = ["newest", "givenName", "familyName", "role", "oldest"];
  if (sortBy && allowedSorts.includes(sortBy)) {
    switch (sortBy) {
      case "newest":
        users = users.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
        break;
      case "oldest":
        users = users.sort(
          (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
        );
        break;
      case "givenName":
        users = users.sort((a, b) => a.givenName.localeCompare(b.givenName));
        break;
      case "familyName":
        users = users.sort((a, b) => a.familyName.localeCompare(b.familyName));
        break;
      case "role":
        users = users.sort((a, b) => a.role.localeCompare(b.role));
        break;
    }
  }

  // Pagination
  const page = parseInt(pageNumber) || 1;
  const limit = parseInt(pageSize) || 5;
  const skip = (page - 1) * limit;

  users = users.slice(skip, skip + limit);
  debugUser(`Page: ${page}, Page Size: ${limit}`);

  res.status(200).json(users);
});

// Get User by ID
router.get("/:userId", isLoggedIn(), validId("userId"), async (req, res, next) => {
  const userId = req.userId;
  debugUser(`User id: ${userId}`);
  try {
    const user = await GetUserById(userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).send(`User ${userId} not found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


// Create New User
router.post("/register", validBody(newUserSchema), async (req, res, next) => {
  const newUser = req.body;
  debugUser(`New user: ${JSON.stringify(newUser)}`);

  const searchUser = await GetUserByEmail(newUser.email);

  if (searchUser) {
    res.status(400).send("Email already exists");
    return;
  } else {
    // save the new user to the DB
    try {
      //Create hashed password
      newUser.password = await bcrypt.hash(newUser.password, 10);
      debugUser(`Hashed password: ${newUser.password}`);

      const result = await createUser(newUser);
      debugUser(`User created: ${JSON.stringify(result)}`);
      newUser.createdOn = new Date();
      newUser.role = "developer";
      debugUser(`New user: ${JSON.stringify(newUser)}`);
      const log = {
        timestamp: new Date(),
        collection: "users",
        operation: "insert",
        target: newUser._id,
        update: JSON.stringify(newUser),
      }
      await saveAuditLog(log);
      
        // Issue JWT token
        const jwtToken = await issueAuthToken(newUser);

        // Create auth cookie
        await issueAuthCookie(res, jwtToken);
        return res
          .status(200)
          .json({
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
    const User = await GetUserByEmail(email);
    debugUser(`User: ${JSON.stringify(User)}`);

    if (!User) {
      res.status(400).send("User does not exist. Please register.");
      return;
    }

    // Check if user exists and password matches
    if (User && (await bcrypt.compare(password, User.password))) {
    debugUser(`User email and password verified`);
    
        // Issue JWT token
        const jwtToken = await issueAuthToken(User);
        await issueAuthCookie(res, jwtToken);

        return res
          .status(200)
          .json({ message: `Welcome back!`, User, authToken: jwtToken });
    }
  } catch (error) {
    debugUser(`Error: ${error.message}`);
    return res.status(500).send(error.message);
  }
});

// Users can view their account information
router.get("/me", isLoggedIn(), validId("userId"), async (req, res) => {
  if (!req.auth) {
    // If user is not authenticated, return 401 error
    return res.status(401).json({ message: 'You are not authenticated' });
  }

  // Retrieve the userId from the authenticated request
  const userId = req.auth._id; 
  
  try {
    // Query the database to fetch user details
    const user = await GetUserById(userId);

    if (user) {
      res.status(200).json(user); 
    } else {
      res.status(404).json({ message: `User ${userId} not found.` });
    }
  } catch (err) {
    // Send 500 error if database query fails
    res.status(500).json({ message: err.message });
  }
});


//Update User
router.patch(
  "/:userId",
  validId("userId"),
  validBody(updateUserSchema),
  async (req, res, next) => {
    const userId = req.userId;

    //New user data
    const updatedUser = req.body;

    //Search for user in DB
    const user = await GetUserById(userId);
    debugUser(`User: ${JSON.stringify(user)}`);

    try {
      for (const key of Object.keys(updatedUser)) {
        user[key] = updatedUser[key];
        debugUser(`Key: ${key}, Value: ${updatedUser[key]}`);
        user.lastUpdated = new Date();
      }

      const result = await updateUser(userId, user);
      debugUser(`User updated: ${JSON.stringify(result)}`);
      res.status(200).json({ message: `User ${userId} updated!`, userId });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//Delete User
router.delete("/:userId", validId("userId"), async (req, res, next) => {
  const userId = req.userId;
  debugUser(`User id: ${userId}`);

  try {
    const userToDelete = await GetUserById(userId);
    debugUser(`User to delete: ${JSON.stringify(userToDelete)}`);

    const result = await deleteUser(userId);
    debugUser(`User deleted: ${JSON.stringify(result)}`);
    res.status(200).json({ message: `User ${userId} deleted!`, userId });
  } catch (err) {
    res.status(500).send(err);
    debugUser(`Error deleting user: ${err.message}`);
  }
});

export { router as userRouter };
