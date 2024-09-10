import express from "express";

const router = express.Router();

import debug from "debug";
const debugUser = debug("app:UserRouter");

router.use(express.urlencoded({ extended: false }));

//FIXME: use this array to store user data in for now
//we will replace this with a database later
const usersArray = [
  { userId: 1, username: "user1", password: "password1" },
  { userId: 2, username: "user2", password: "password2" },
  { userId: 3, username: "user3", password: "password3" },
];

router.get("/list", (req, res) => {
  res.json(usersArray);
});

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const user = usersArray.find((user) => user.userId === parseInt(userId));
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).send("User not found");
  }
});

router.post("/register", (req, res) => {
  const newUser = req.body;

  const searchUser = usersArray.find(user => user.email === newUser.email);

  if (searchUser) {
    res.status(400).send("User already exists");
    return;
  } else {

  newUser.userId = usersArray.length + 1;
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

  usersArray.push(newUser);
  res.status(200).json({message: `User ${newUser.givenName} registered successfully`});
}
});

router.post("/login", (req, res) => {
  const userName = req.body;

  if(!userName.email) {
    res.status(400).send("Email is required");
    return;
  } else if(!userName.password) {
    res.status(400).send("Password is required");
    return;
  }else {
    const user = usersArray.find(user => user.email === userName.email && user.password === userName.password);
    if(user) {
      res.status(200).json({message: `User logged in successfully`});
    } else {
      res.status(401).send("Login failed. Invalid credentials");
    }
  }

});

router.put("/:userId", (req, res) => {
  const userId = req.params.userId;
  debugUser(`User id: ${userId}`);
  const userToUpdate = usersArray.find((user) => user.userId == userId);

  const updatedUser = req.body;

  if(userToUpdate) {
    for(const key in updatedUser){
        userToUpdate[key] = updatedUser[key];
    }

      //save the updated user in the users array
    const index = usersArray.findIndex((user) => user.userId == userId);
    if(index != -1){
      usersArray[index] = userToUpdate;
    }
    res.status(200).json(`User ${userId} updated successfully`);
  }else {
    res.status(404).send("User not found");
  }

});

router.delete("/:userId", (req, res) => {
  const userId = req.params.userId;
  const index = usersArray.findIndex(user => user.userId == userId);
  if (index != -1) {
    usersArray.splice(index, 1);
    res.status(200).json(`User ${userId} deleted successfully`);
  } else {
    res.status(404).send("User not found");
  }
});

export { router as userRouter };
