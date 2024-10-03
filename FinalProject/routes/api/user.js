import express from "express";

const router = express.Router();

import debug from "debug";
import { GetAllUsers, GetUserByEmail, GetUserById, createUser, loginUser, updateUser, deleteUser } from "../../database.js";
const debugUser = debug("app:UserRouter");

import Joi from "joi";

router.use(express.urlencoded({ extended: false }));

const userSchema = Joi.object({
  userId: Joi.number().integer().min(1).required(),
  email: Joi.string().email().pattern(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/, 'email').required(),
  password: Joi.string().min(8).required(),
  givenName: Joi.string().required(),
  familyName: Joi.string().required(),
  role: Joi.string().required(),
});



// Get All Users
router.get('', (req, res) => {
  GetAllUsers().then((users) => {
    res.status(200).json(users);
  }).catch((err) => {
    res.status(500).send(err);
})});

// Get User by ID
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  debugUser(`User id: ${userId}`);
  try {
    const user = await GetUserById(userId);
    debugUser(`User: ${JSON.stringify(user)}`);
    if(JSON.stringify(user) === '{}' || user === null) {
      res.status(404).send("User not found");
    } else {
      res.status(200).json(user);
    }
   } catch (err) {
    res.status(500).send(err);
  }
});

// Create New User
router.post("/register", async (req, res) => {
  const newUser = req.body;
  debugUser(`New user: ${JSON.stringify(newUser)}`);

const validateResult = userSchema.validate(req.body);
console.log(JSON.stringify(validateResult));

if(validateResult.error){
  res.status(400).send(validateResult.error.details[0].message);
}else {
  res.status(200).json({message: "Good Data"});
}

  const searchUser = await GetUserByEmail(newUser.email);

  if (searchUser) {
    res.status(400).send("Email already exists");
    return;
  } else {
    //set created date
    newUser.createdDate = new Date();

    if (!newUser.email) {
      res.status(400).send("Email is required");
      return;
    }

    if (!newUser.password) {
      res.status(400).send("Password is required");
      return;
    }

    if (!newUser.givenName) {
      res.status(400).send("Given name is required");
      return;
    }

    if (!newUser.familyName) {
      res.status(400).send("Family name is required");
      return;
    }

    if (!newUser.role) {
      res.status(400).send("Role is required");
      return;
    }
    

    // save the new user to the DB
    try {
      const result = createUser(newUser);
      debugUser(`User created: ${JSON.stringify(result)}`);
      res.status(200).json({message: `New user registered!, ${newUser.givenName}`});
    } catch (error) {
      res.status(500).send(error);
    }
  }
});


//Login User
router.post("/login", async (req, res) => {
    // Get user credentials from DB
    const { email, password } = req.body;

    debugUser(`Email: ${email}`);
    debugUser(`Password: ${password}`);

    // Check if user exists by checking email
    try {
    const User = await GetUserByEmail(email);
    if (JSON.stringify(User) === '{}' || User === null) {
      res.status(404).send("User not found");
      return;
    }

    if (!email || !password) {
      res.status(400).send("Please enter your login credentials");
      return;
    } else {
      // login user
      const currentUser = await loginUser(email, password);
      if (currentUser) {
        res.status(200).json({ message: `Welcome back, ${currentUser.givenName}` });
      } else {
        res.status(400).send("Invalid login credentials provided. Please try again");
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


//Update User
router.patch("/:userId", async(req, res) => {
  const userId = req.params.userId;
  debugUser(`User id: ${userId}`);
  const user = await GetUserById(userId);
  debugUser(`User: ${JSON.stringify(user)}`);
  const updatedUser = req.body;

  if(user) {
    for(const key of Object.keys(updatedUser)){
        user[key] = updatedUser[key];
        debugUser(`Key: ${key}, Value: ${updatedUser[key]}`);
        updatedUser.lastUpdated = new Date('MM-dd-yyyy');
    }
  }else{
    res.status(404).send(`User ${userId} not found`);
}

try {
  const result = await updateUser(userId, user);
  debugUser(`User updated: ${JSON.stringify(result)}`);
  res.status(200).json({message: `User ${userId} updated!`, userId});
} catch (error) {
  debugUser(`Error updating user: ${error.message}`);
  res.status(500).json({message: 'Internal Server Error'});
}
});

//Delete User
router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  debugUser(`User id: ${userId}`);

  try {
    const userToDelete = await GetUserById(userId);
    debugUser(`User to delete: ${JSON.stringify(userToDelete)}`);
    
    if (JSON.stringify(userToDelete) === '{}' || userToDelete === null) {
      res.status(404).send("User not found");
      return;
    }else{
      const result = await deleteUser(userId);
      debugUser(`User deleted: ${JSON.stringify(result)}`);
      res.status(200).json({message: `User ${userId} deleted!`, userId});
    }
  } catch (err) {
    res.status(500).send(err);
    debugUser(`Error deleting user: ${err.message}`);
  }
});

export { router as userRouter, GetUserById, GetUserByEmail, GetAllUsers, updateUser, createUser, loginUser, deleteUser };
