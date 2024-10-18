import express from "express";

const router = express.Router();

import debug from "debug";
import {
  GetAllUsers,
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

router.get("", async (req, res) => {
  // Get All Users
  let users = await GetAllUsers();

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
        users = users.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        break;
      case "oldest":
        users = users.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
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
