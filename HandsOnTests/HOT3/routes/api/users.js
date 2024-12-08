import express from 'express';
const router = express.Router();

import debug from 'debug';
import { validId } from '../../middleware/validid.js';
import { validBody } from '../../middleware/validBody.js';

import { createUser, getUserById, getAllUsers, saveAuditLog, updateUser, getUserByEmail, findRoleByName, deleteUser} from '../../database.js'

const debugUsers = debug('app:users');

import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isLoggedIn, hasRole, fetchRoles, hasPermission} from '@merlin4/express-auth';
import { mergePermissions } from '@merlin4/express-auth';

router.use(express.urlencoded({ extended: false }));

const newUserSchema = Joi.object({
  fullName: Joi.string().min(8).max(30).required(),
  email: Joi.string().pattern(
    /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
    "email"
  ).required(),
  password: Joi.string().min(6).required(),
  givenName: Joi.string().min(3).max(20).required(),
  familyName: Joi.string().min(3).max(20).required(),
  role: Joi.string().optional()
}).unknown(true);

const updateSelfSchema = Joi.object({
  fullName: Joi.string().min(8).max(30),
  email: Joi.string(),
  password: Joi.string().min(6),
  givenName: Joi.string().min(3).max(20).optional(),
  familyName: Joi.string().min(3).max(20).optional(),
  role: Joi.string()
}).unknown(true);

const newLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required()
}).unknown(true);

async function issueAuthToken(user) {
 
  // merge roles into token
  const roles = await fetchRoles(user, role => findRoleByName(role));
  debugUsers(roles);

  const permissions = mergePermissions(user, roles);
  
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role, permissions: permissions},
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
    secure: false,
  };
  res.cookie("authToken", token, cookieOptions);
}


// Get all users
router.get("", async (req, res, next) => {
  try{
  const users = await getAllUsers();

  if (req.auth) {
    debugUsers(req.auth.email);
  }

  res.status(200).json(users)
  debugUsers(`Users route hit!`)
  } catch(err) {
    res.status(500).send(err);
    debugUsers(`Error getting users: ${err.message}`)
  }
});

// Get User by ID
router.get("/:userId",  validId("userId"), async (req,res, next) =>{
  const userId = req.userId;
  debugUsers(`User id: ${userId}`);
  try{
    if (userId) {
    const user = await getUserById(userId);
    res.status(200).json(user);
    } else {
      res.status(404).json(` User ${userId} not found}`)
    }
  }catch(err){
    res.status(500).send(err);
  }
})

// Create a new user
router.post("/register", validBody(newUserSchema), async (req, res, next) => {
  const newUser = req.body;
    try {
    newUser.password = await bcrypt.hash(newUser.password, 10);
    debugUsers(`Hashed password: ${newUser.password}`);

    const user = await createUser(newUser);
    debugUsers(`User created: ${JSON.stringify(user)}`);
    const log = {
      timestamp: new Date(),
      collection: "Users",
      operation: "Insert",
      document: newUser,
    }
    await saveAuditLog(log);
    
    // Issue JWT token
    const token = await issueAuthToken(newUser);

    // Issue Auth Cookie
    await issueAuthCookie(res, token);
    res.status(200).json({message: `New User registered!`, newUser, authToken: token});
    } catch(err) {
    res.status(500).send(err);
  }});

  // Return current user's information
  router.get("/me", isLoggedIn(), async (req, res, next) => {
    if(!req.auth) {
      return res.status(401).json({message: 'You are not authenticated'});
    }

    const userId = req.auth._id;

    try {
      const user = await getUserById(userId);

      if (user) {
        res.status(200).json({message: 'User found', user});
        debugUsers(`User found: ${JSON.stringify(user)}`);
      } else {
        res.status(404).json(`User ${userId} not found`);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }

  });

  // Self-Update user information
  router.put("/me", isLoggedIn(), validBody(updateSelfSchema), async (req, res, next) => {
    if(!req.auth) {
      return res.status(401).json({message: 'You are not authenticated'});
    }

    const userId = req.auth._id;
    const updatedUser = req.body;

    try {
      const user = await getUserById(userId);
      if (user) {
        for (const key of Object.keys(updatedUser)) {
          user[key] = updatedUser[key];
          user.lastUpdatedOn = new Date();
          user.lastUpdatedBy = req.auth._id;
        }

      if (updatedUser.password) {
        user.password = await bcrypt.hash(updatedUser.password, 10);
      }
      
      const jwtToken = await issueAuthToken(user);
      await issueAuthCookie(res, jwtToken);

      const result = await updateUser(userId, user);
      const log = {
        timestamp: new Date(),
        collection: "Users",
        operation: "Update",
        document: user,
      }
      await saveAuditLog(log);
      return res.status(200).json({message: 'User updated', userId});
      } else {
        res.status(404).json(`User ${userId} not found`);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Login
  router.post("/login", validBody(newLoginSchema), async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(200).json({message: 'Invalid email or password'});
      }

      if (user && (await bcrypt.compare(password, user.password))){
        debugUsers(`User email and password match; ${user.email} is now logged in!`);
      }
      
      // Issue JWT token
      const token = await issueAuthToken(user);
      // Issue Auth Cookie
      await issueAuthCookie(res, token);

      res.status(200).json({message: `Welcome back!`, role: user.role, email: user.email, "authToken": token});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.put("/:userId", validId("userId"), async (req, res, next) => {
    const userId = req.userId;
    const updatedUser = req.body;
    debugUsers(`User id: ${userId}`);
    console.log("Update route hit");
    try {
      const user = await getUserById(userId);
      if (user) {
        for (const key of Object.keys(updatedUser)) {
          user[key] = updatedUser[key];
          user.lastUpdatedOn = new Date();
          user.lastUpdatedBy = userId;
        }

        if (updatedUser.password) {
          user.password = await bcrypt.hash(updatedUser.password, 10);
        }
        const result = await updateUser(userId, user);
        const log = {
          timestamp: new Date(),
          collection: "Users",
          operation: "Update",
          document: user,
        }
        await saveAuditLog(log);
        return res.status(200).json({message: 'User updated', userId});
      } else {
        res.status(404).json(`User ${userId} not found`);
      }
    } catch (err) {
      debugUsers(err.message);
      res.status(500).send(err.message);
    }
  });

  router.delete("/:userId", validId("userId"), async (req, res, next) => {
    const userId = req.userId;
    debugUsers(`User id: ${userId}`);
    console.log("Delete route hit");
    try {
      const user = await getUserById(userId);
      if (user) {
        const result = await deleteUser(userId);
        const log = {
          timestamp: new Date(),
          collection: "Users",
          operation: "Delete",
          document: user,
        }
        await saveAuditLog(log);
        return res.status(200).json({message: 'User deleted', userId});
      } else {
        res.status(404).json(`User ${userId} not found`);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  


  export { router as usersRouter };