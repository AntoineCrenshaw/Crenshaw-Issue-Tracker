import express from "express";

const router = express.Router();

import debug from "debug";
import {
  GetAllUsers,
  GetAllUsersByRole,
  GetAllUsersByMaxAge,
  GetAllUsersByMinAge,
  GetAllUsersBySort,
  GetAllUsersByPageSize,
  GetAllUsersByPageNumber,
  GetUserByEmail,
  GetUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
} from "../../database.js";
import { validBody } from "../../middleware/validBody.js";
import { validId } from "../../middleware/validid.js";
const debugUser = debug("app:UserRouter");

import Joi from "joi";

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
  role: Joi.string().min(3).required(),
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

// Get All Users
router.get("", async (req, res) => {
  try {
    const { role, maxAge, minAge, sortBy, pageSize, pageNumber } = req.query;
    let query = {};
    let sort = {};

    if (role) {
      query.role = role;
      const users = await GetAllUsersByRole(role);
      return res.status(200).json(users);
    }

    if (maxAge) {
      query.maxAge = maxAge;
      const users = await GetAllUsersByMaxAge(maxAge);
      return res.status(200).json(users);
    }

    if (minAge) {
      query.minAge = minAge;
      const users = await GetAllUsersByMinAge(minAge);
      return res.status(200).json(users);
    }

    const allowedSorts = [
      "givenName",
      "familyName",
      "role",
      "newest",
      "oldest",
    ];
    if (sortBy && allowedSorts.includes(sortBy)) {
      if (sortBy === "givenName") {
        sort = { givenName: 1, familyName: 1, createdDate: -1 };
      } else if (sortBy === "familyName") {
        sort = { familyName: 1, givenName: 1, createdDate: 1 };
      } else if (sortBy === "role") {
        sort = { role: 1, givenName: 1, createdDate: 1 };
      } else if (sortBy === "newest") {
        sort = { createdDate: -1 };
      } else if (sortBy === "oldest") {
        sort = { createdDate: 1 };
      } else {
        sort = { [sortBy]: 1 };
      }
      const users = await GetAllUsersBySort(sort);
      console.log(users);
      return res.status(200).json(users);
    }

    // validation
    const size = parseInt(pageSize) || 5; // Default to 5 if not provided
    const page = parseInt(pageNumber) || 1; // Default to 1 if not provided

    if (size <= 0) {
      return res.status(400).json({ message: "Page Size must be a number greater than 0" });
    }

    if (page <= 0) {
      return res.status(400).json({ message: "Page Number must be greater than 0" });
    }

    if (pageNumber) {

      // Default pageNumber to 1 and pageSize to 5 if not provided
      const pageNum = parseInt(pageNumber, 10) || 1;
      const size = parseInt(pageSize, 10) || 5;

      query.pageNumber = pageNum;
      query.pageSize = size;

      debugUser(`Page Number: ${query.pageNumber}, Page Size: ${query.pageSize}`);

      // Fetch the paginated users
      const user = await GetAllUsersByPageNumber(query.pageNumber, query.pageSize);
      return res.status(200).json(user);
    }

    const users = await GetAllUsers(query, sort);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get User by ID
router.get("/:userId", validId("userId"), async (req, res, next) => {
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
      const result = await createUser(newUser);
      debugUser(`User created: ${JSON.stringify(result)}`);
      newUser.createdDate = new Date();
      res
        .status(200)
        .json({ message: `New user registered!, ${newUser.givenName}` });
    } catch (error) {
      res.status(500).send(error);
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
    debugUser(`Email: ${JSON.stringify(User)})`)

    // login user
    const currentUser = await loginUser(email, password);
    if (currentUser) {
      res
        .status(200)
        .json({ message: `Welcome back, ${currentUser.givenName}` });
    } else {
      res
        .status(400)
        .send("Invalid login credentials provided. Please try again");
    }
  } catch (err) {
    res.status(500).send(err);
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
