import express from 'express';
const router = express.Router();

import debug from 'debug';
import { GetAllBugs, GetBugById, createBug, updateBug, closeBug, updateAssignTo, GetUserById } from '../../database.js';
import { validBody } from '../../middleware/validBody.js';
import { validId } from '../../middleware/validid.js';
const debugBug = debug('app:BugRouter');

import Joi from 'joi';

router.use(express.urlencoded({ extended: false }));

const newBugSchema = Joi.object({
  title: Joi.string().min(6).max(100).required(),
  bugDescription: Joi.string().min(10).max(500).required(),
  stepsToReproduce: Joi.string().min(10).max(500).required(),
});

const updateBugSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  bugDescription: Joi.string().min(10).max(500),
  stepsToReproduce: Joi.string().min(10).max(500),
});

const classifyBugSchema = Joi.object({
  classification: Joi.string().min(3).required(),
});

const assignBugSchema = Joi.object({
  assignedToUserId: Joi.string().required(),
});

const closeBugSchema = Joi.object({
  closed: Joi.boolean().required(),
});

router.get('', async (req, res) => {
  GetAllBugs()
    .then((bugs) => {
      res.status(200).json(bugs);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Get Bug by ID
router.get('/:bugId', validId('bugId'), async (req, res, next) => {
  const bugId = req.bugId;
  try {
    const bug = await GetBugById(bugId);
    debugBug(`Bug: ${JSON.stringify(bug)}`);
    res.status(200).json(bug);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create New Bug
router.post('/new', validBody(newBugSchema), async (req, res, next) => {
  const newBug = req.body;
  debugBug(`New bug: ${newBug}`);
  newBug.createdDate = new Date();

  try {
    const dbResult = await createBug(newBug);
    debugBug(`Bug created: ${JSON.stringify(dbResult)}`);
    res.status(200).json(`Bug created successfully`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update Bug
router.patch('/:bugId', validId('bugId'), validBody(updateBugSchema), async (req, res) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);

  const getBug = await GetBugById(bugId);
  debugBug(`Result from GetBugById: ${JSON.stringify(getBug)}`);

  if (!getBug) {
    return res.status(404).json({ message: `Bug ${bugId} not found` });
  }

  const updatedBug = req.body;
  debugBug(`Updated bug: ${JSON.stringify(updatedBug)}`);

  for (const key of Object.keys(updatedBug)) {
    getBug[key] = updatedBug[key];
    debugBug(`Key: ${key} Value: ${updatedBug[key]}`);
  }
  getBug.lastUpdated = new Date();

  try {
    const result = await updateBug(getBug);
    debugBug(`Bug updated: ${JSON.stringify(result)}`);
    res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
  } catch (err) {
    res.status(500).send(err);
  }
});
//Update Bug Classification/Priority
router.patch('/:bugId/classify', validId('bugId'), validBody(classifyBugSchema), async (req, res, next) => {
  const bugId = req.params.bugId;

  const newClassification = req.body;

  try {
    const currentClassification = await GetBugById(bugId);
    debugBug(`Current Classification: ${JSON.stringify(currentClassification)}`);

    for (const key of Object.keys(newClassification)) {
      currentClassification[key] = newClassification[key];
      debugBug(`Key: ${key} Value: ${newClassification[key]}`);
      currentClassification.classifiedOn = new Date();
      currentClassification.lastUpdated = new Date();
    }

    const result = await updateBug(currentClassification);
    debugBug(`Bug updated: ${JSON.stringify(result)}`);
    res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
  } catch (err) {
    res.status(500).send(err);
  }
});

//update assigned to
router.patch('/:bugId/assign', validId('bugId'), validBody(assignBugSchema), async (req, res, next) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);

  //read from the request body
  const { assignedToUserId } = req.body;

  try {
    // Query the database to get the bug by id
    const bug = await GetBugById(bugId);
    debugBug(`Bug: ${JSON.stringify(bug)}`);

    // Query the database to get the user by id
    const assignedToUser = await GetUserById(assignedToUserId);
    debugBug(`Assigned to user: ${JSON.stringify(assignedToUser)}`);

    // Update the bug's assignment details
    bug.assignedToUserId = assignedToUserId;
    bug.assignedToUserName = `${assignedToUser.givenName} ${assignedToUser.familyName}`;
    bug.assignedOn = new Date();
    bug.lastUpdated = new Date();

    const result = await updateAssignTo(bug);
    debugBug(`Bug updated: ${JSON.stringify(result)}`);
    res
      .status(200)
      .json(`Bug ${bugId} assigned to ${assignedToUser.givenName} ${assignedToUser.familyName} successfully`);
  } catch (err) {
    debugBug(`Error assigning bug: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//close bug

router.put('/:bugId/close', validId('bugId'), validBody(closeBugSchema), async (req, res, next) => {
  const bugId = req.params.bugId;
  debugBug(`Bug id: ${bugId}`);
  const { closed } = req.body;

  try {
    const bug = await GetBugById(bugId);
    bug.closed = closed;
    bug.closedOn = new Date();
    bug.lastUpdated = new Date();
    debugBug(`Bug: ${JSON.stringify(bug)}`);

    const result = await closeBug(bug);
    debugBug(`Bug closed: ${JSON.stringify(result)}`);
    res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
  } catch (err) {
    res.status(500).send(err);
  }
});

export { router as bugRouter };
