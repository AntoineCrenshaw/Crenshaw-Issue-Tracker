import express from "express";

const router = express.Router();

import debug from "debug";
import { GetAllUsers, GetUserByEmail, GetUserById, createUser, loginUser } from "../../database.js";
const debugUser = debug("app:UserRouter");

router.use(express.urlencoded({ extended: false }));

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
    const { userName, currentPassword } = req.body;

    debugUser(`User: ${userName}`);
    debugUser(`Password: ${currentPassword}`);

    // Check if user exists by checking email
    try {
    const User = await GetUserByEmail(userName);
    if (JSON.stringify(User) === '{}' || User === null) {
      res.status(404).send("User not found");
      return;
    }

    if (!userName || !currentPassword) {
      res.status(400).send("Please enter your login credentials");
      return;
    } else {
      // login user
      const currentUser = await loginUser(userName, currentPassword);
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


// Update User
// router.patch("/:userId", (req, res) => {
//   const userId = req.params.userId;
//   debugUser(`User id: ${userId}`);
//   const userToUpdate = usersArray.find((user) => user.userId == userId);

//   const updatedUser = req.body;

//   if(userToUpdate) {
//     for(const key in updatedUser){
//         userToUpdate[key] = updatedUser[key];
//     }

//       //save the updated user in the users array
//     const index = usersArray.findIndex((user) => user.userId == userId);
//     if(index != -1){
//       usersArray[index] = userToUpdate;
//     }
//     res.status(200).json(`User ${userId} updated successfully`);
//     res.status(200).json({message: `User ${userId} updated successfully`});
//     res.status(404).send("User not found");
//   }

// });

// router.delete("/:userId", async (req, res) => {
//   const userId = req.params.userId;
//   debugUser(`User id: ${userId}`);

//   try {
//     const userToDelete = await GetUserById(userId);
//     // if (index != -1) {
//     //   usersArray.splice(index, 1);
//     //   res.status(200).json(`User ${userId} deleted successfully`);
//     //   res.status(200).json({message: `User ${userId} deleted successfully`});
//     //   res.status(404).send("User not found");
//     // }
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

export { router as userRouter, GetUserById, GetUserByEmail, GetAllUsers };
