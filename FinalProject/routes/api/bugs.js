import express from "express";
const router = express.Router();

import debug from "debug";
import {
  GetAllBugs,
  GetBugById,
  createBug,
  updateBug,
  closeBug,
  updateAssignTo,
  GetUserById,
} from "../../database.js";
import { validBody } from "../../middleware/validBody.js";
import { validId } from "../../middleware/validid.js";
const debugBug = debug("app:BugRouter");

import Joi from "joi";

router.use(express.urlencoded({ extended: false }));

const newBugSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  bugDescription: Joi.string().min(10).max(500).required(),
  stepsToReproduce: Joi.string().min(10).max(500).required(),
});

const updateBugSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  bugDescription: Joi.string().min(10).max(500),
  stepsToReproduce: Joi.string().min(10).max(500),
});

router.get("", async (req, res) => {
  GetAllBugs()
    .then((bugs) => {
      res.status(200).json(bugs);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Get Bug by ID
router.get("/:bugId", validBody('bugId'), async (req, res, next) => {
  const bugId = req.bugId;
  try {
    const bug = await GetBugById(bugId);
    debugBug(`Bug: ${JSON.stringify(bug)}`);
    if (bug) {
      res.status(200).json(bug);
    } else {
      res.status(404).send(`Bug ${bugId} not found.`);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create New Bug
router.post("/new", async (req, res) => {
  const newBug = req.body;
  debugBug(`New bug: ${JSON.stringify(newBug)}`);

  if (!newBug.bugDescription) {
    res.status(400).send("Bug Description is required");
  }
  if (!newBug.title) {
    res.status(400).send("Title is required");
  }
  if (!newBug.stepsToReproduce) {
    res.status(400).send("Steps to Reproduce is required");
  } else {
    newBug.createdDate = new Date();
  }

  try {
    const dbResult = await createBug(newBug);
    debugBug(`Bug created: ${JSON.stringify(dbResult)}`);
    res.status(200).json(`Bug created successfully`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update Bug
router.patch("/:bugId", async (req, res) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);
  const getBug = await GetBugById(bugId);
  debugBug(`getBug at the start: ${JSON.stringify(getBug)}`);
  const updatedBug = req.body;

  if (!updatedBug.title) {
    updatedBug.title = "";
  }

  if (!updatedBug.bugDescription) {
    updatedBug.bugDescription = "";
  }

  if (!updatedBug.stepsToReproduce) {
    updatedBug.stepsToReproduce = "";
  }
  if (getBug) {
    for (const key of Object.keys(updatedBug)) {
      getBug[key] = updatedBug[key];
      debugBug(`Key: ${key} Value: ${updatedBug[key]}`);
      updatedBug.lastUpdated = new Date("MM-dd-yyyy");
    }
  } else {
    res.status(404).send(`Bug ${bugId} not found`);
  }

  try {
    const result = await updateBug(getBug);
    debugBug(`Bug updated: ${JSON.stringify(result)}`);
    res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
  } catch (err) {
    res.status(500).send(err);
  }
});

//Update Bug Classification/Priority
router.patch("/:bugId/classify", async (req, res) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${JSON.stringify(bugId)}`);

  const newClassification = req.body;

  if (!newClassification.classification) {
    res.status(400).send("Classification is required");
  }

  if (!bugId || bugId.length !== 24) {
    res.status(400).send("Bug ID is required and must be 24 characters");
  }
  
  try{
  const currentClassification = await GetBugById(bugId);
  debugBug(
    `Current Classification: ${JSON.stringify(currentClassification)}`
  );
  if (!currentClassification) {
    res.status(404).send(`Bug ${bugId} not found`);
  }

    for (const key of Object.keys(newClassification)) {
      currentClassification[key] = newClassification[key];
      debugBug(`Key: ${key} Value: ${newClassification[key]}`);
      currentClassification.classifiedOn = new Date();
      currentClassification.lastUpdated = new Date();
    }

  const result = await updateBug(currentClassification);
  debugBug(`Bug updated: ${JSON.stringify(result)}`);
  res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
  }catch (err) {
    res.status(500).send(err);
}});

//update assigned to
router.patch("/:bugId/assign", async(req, res) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);
  
  //read from the request body
  const {assignedToUserId} = req.body;

    //if the bug id is not provided
  if (!bugId) {
    res.status(400).send("Bug ID is required");
  }

//if the user id is not provided
  if (!assignedToUserId) {
    res.status(400).send("User ID is required");
  }

  try {
    const bug = await GetBugById(bugId);
    debugBug(`Bug: ${JSON.stringify(bug)}`);

    if(!bug){
      res.status(404).send(`Bug ${bugId} not found`);
    }

    // Query the database to get the user by id
    const assignedToUser = await GetUserById(assignedToUserId);
    debugBug(`Assigned to user: ${JSON.stringify(assignedToUser)}`);

    if(!assignedToUser){
      res.status(404).json({error: 'User not found'});
      debugBug(`User ${assignedToUserId} not found`);
    }

    // Update the bug's assignment details
    bug.assignedToUserId = assignedToUserId;
    bug.assignedToUserName = `${assignedToUser.givenName} ${assignedToUser.familyName}`;
    bug.assignedOn = new Date();
    bug.lastUpdated = new Date();

    const result = await updateAssignTo(bug);
    debugBug(`Bug updated: ${JSON.stringify(result)}`);
    res.status(200).json(`Bug ${bugId} assigned to ${assignedToUser.givenName} ${assignedToUser.familyName} successfully`);
  }catch (err) {
    debugBug(`Error assigning bug: ${err.message}`);
    res.status(500).json({message: 'Internal Server Error'});
  }
      
});

//close bug

router.put("/:bugId/close", async(req, res) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);
  const {closed} = req.body;

    if (!bugId){
        res.status(400).send("Bug ID is required");
    }

    if (!closed){
        res.status(400).send("Bug Status is required");
    }

    try {
    const bug = await GetBugById(bugId);
  

    if (!bug){
        res.status(404).send(`Bug ${bugId} not found`);
    }
        bug.closed = Boolean(closed);
        bug.closedOn = new Date();
        bug.lastUpdated = new Date();
        debugBug(`Bug: ${JSON.stringify(bug)}`);

        const result = await closeBug(bug);
        debugBug(`Bug closed: ${JSON.stringify(result)}`);    
        res.status(200).json({ message:`Bug ${bugId} closed!`, bugId});
}catch (err) {
    res.status(500).send(err);
}
});

export { router as bugRouter  };
