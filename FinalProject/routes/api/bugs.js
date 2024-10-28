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
  GetComment,
  createComment,
  GetTests,
  CreateTests,
  updateTests,
  deleteTests,
  saveAuditLog,
} from "../../database.js";
import { validBody } from "../../middleware/validBody.js";
import { validId } from "../../middleware/validid.js";
const debugBug = debug("app:BugRouter");

import Joi from "joi";
import { isLoggedIn } from "@merlin4/express-auth";

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

const commentSchema = Joi.object({
  comment: Joi.string().min(3).max(500).required(),
});

const newTestsSchema = Joi.object({
  status: Joi.string().min(3).required(),
  addedBy: Joi.string().required(),
});

const updateTestSchema = Joi.object({
  status: Joi.string().min(3),
  addedBy: Joi.string(),
});

router.get("", isLoggedIn(), async (req, res) => {
  try {
    let bugs = await GetAllBugs();

    // Get bugs by classification, sortBy, maxAge, minAge, pageNumber, pageSize, closed
    const {
      classification,
      sortBy,
      maxAge,
      minAge,
      pageNumber,
      pageSize,
      closed,
    } = req.query;
    if (classification) {
      bugs = bugs.filter((bug) => bug.classification === classification);
      debugBug(`Classification: ${classification}`);
    }
    if (closed) {
      bugs = bugs.filter((bug) => bug.closed === closed);
      debugBug(`Closed: ${closed}`);
    }
    if (maxAge || minAge) {
      bugs = bugs.filter((bug) => {
        if (maxAge) {
          return new Date(bug.createdDate) <= new Date(maxAge);
        }
        if (minAge) {
          return new Date(bug.createdDate) >= new Date(minAge);
        }
      });
    }

    const allowedSorts = [
      "newest",
      "oldest",
      "title",
      "classification",
      "assignedTo",
      "createdBy",
    ];
    if (sortBy && allowedSorts.includes(sortBy)) {
      switch (sortBy) {
        case "oldest":
          bugs = bugs.sort(
            (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
          );
          break;
        case "title":
          bugs = bugs.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "classification":
          bugs = bugs.sort((a, b) =>
            a.classification.localeCompare(b.classification)
          );
          break;
        case "assignedTo":
          bugs = bugs.sort((a, b) =>
            a.assignedToUserId.localeCompare(b.assignedToUserId)
          );
          break;
        case "createdBy":
          bugs = bugs.sort((a, b) => a.createdBy.localeCompare(b.createdBy));
          break;
        case "newest":
          bugs = bugs.sort(
            (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
          );
          break;
        default:
          // Handle unexpected sortBy values if necessary
          break;
      }
    }

    // Pagination

    const page = parseInt(pageNumber) || 1;
    const limit = parseInt(pageSize) || 5;
    const skip = (pageNumber - 1) * pageSize;

    bugs = bugs.slice(skip, skip + pageSize);
    debugBug(`Page: ${page}, Page Size: ${limit}`);

    res.status(200).json(bugs);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get Bug by ID
router.get("/:bugId", isLoggedIn(), validId("bugId"), async (req, res, next) => {
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
router.post("/new", isLoggedIn(), validBody(newBugSchema), async (req, res, next) => {
  const newBug = req.body;
  newBug.createdDate = new Date();
  debugBug(`New bug: ${JSON.stringify(newBug)}`);

  try {
    const dbResult = await createBug(newBug);
    debugBug(`Bug created: ${JSON.stringify(dbResult)}`);
    dbResult.createdOn = new Date();
    dbResult.createdBy = req.auth._id;
    dbResult.classification = "unclassified";
    dbResult.closed = false;

    const log = {
      timestamp : new Date(),
      collection : "bugs",
      operation : "insert",
      target: dbResult._id,
      update: dbResult,
      auth: req.auth,
    }
    await saveAuditLog(log);
    res.status(200).json(`Bug created successfully`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update Bug
router.patch(
  "/:bugId",
  validId("bugId"),
  validBody(updateBugSchema),
  async (req, res) => {
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
  }
);
//Update Bug Classification/Priority
router.patch(
  "/:bugId/classify",
  validId("bugId"), isLoggedIn(),
  validBody(classifyBugSchema),
  async (req, res, next) => {
    const bugId = req.params.bugId;

    const newClassification = req.body;

    try {
      const currentClassification = await GetBugById(bugId);
      currentClassification.classifiedOn = new Date();
      currentClassification.classifiedBy = req.auth._id;
      debugBug(
        `Current Classification: ${JSON.stringify(currentClassification)}`
      );

      for (const key of Object.keys(newClassification)) {
        currentClassification[key] = newClassification[key];
        debugBug(`Key: ${key} Value: ${newClassification[key]}`);
        currentClassification.classifiedOn = new Date();
        currentClassification.lastUpdated = new Date();
      }

      const result = await updateBug(currentClassification);
      debugBug(`Bug updated: ${JSON.stringify(result)}`);
      const log = {
        timestamp : new Date(),
        collection : "bugs",
        operation : "update",
        target: bugId,
        update: result,
        auth: req.auth,
      }
      await saveAuditLog(log);
      res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//update assigned to
router.patch(
  "/:bugId/assign",
  validId("bugId"), isLoggedIn(),
  validBody(assignBugSchema),
  async (req, res, next) => {
    const bugId = req.params.bugId;
    debugBug(`Bug id: ${bugId}`);

    //read from the request body
    const { assignedToUserId } = req.body;

    try {
      // Query the database to get the bug by id
      const bug = await GetBugById(bugId);
      debugBug(`Bug: ${JSON.stringify(bug)}`);
      bug.assignedBy = req.auth._id;

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
      const log = {
        timestamp : new Date(),
        collection : "bugs",
        operation : "update",
        target: bugId,
        update: result,
        auth: req.auth,
      };
      res
        .status(200)
        .json(
          `Bug ${bugId} assigned to ${assignedToUser.givenName} ${assignedToUser.familyName} successfully`
        );
    } catch (err) {
      debugBug(`Error assigning bug: ${err.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//close bug

router.put(
  "/:bugId/close",
  validId("bugId"), isLoggedIn(),
  validBody(closeBugSchema),
  async (req, res, next) => {
    const bugId = req.params.bugId;
    debugBug(`Bug id: ${bugId}`);
    const { closed } = req.body;

    try {
      const bug = await GetBugById(bugId);
        //Set to null if bug is reopened
      if (closed === false) {
        bug.closedOn
        bug.closedBy = null;
      }
      bug.closed = closed;
      bug.closedOn = new Date(); 
      bug.closedBy = req.auth._id;
      bug.lastUpdated = new Date();
      debugBug(`Bug: ${JSON.stringify(bug)}`);

      const result = await closeBug(bug);
      debugBug(`Bug closed: ${JSON.stringify(result)}`);
      const log = {
        timestamp : new Date(),
        collection : "bugs",
        operation : "update",
        target: bugId,
        update: result,
        auth: req.auth,
      }
      await saveAuditLog(log);
      res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Get comments by bug id
router.get("/:bugId/comments", isLoggedIn(), validId("bugId"), async (req, res) => {
  const bugId = req.params.bugId;

  try {
    const bug = await GetBugById(bugId);
    debugBug(`Bug Comments: ${JSON.stringify(bug.comments)}`);
    if (JSON.stringify(bug) === "{}" || bug === null) {
      res.status(404).send("Bug not found");
    } else {
      let detailedComments = [];

      for (let i = 0; i < bug.comments.length; i++) {
        const bugComment = await GetComment(bug.comments[i]);
        debugBug(`Bug Comment: ${JSON.stringify(bugComment)}`);
        detailedComments.push(bugComment);
      }

      res.status(200).json(detailedComments);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get(
  "/:bugId/comments/:commentId",
  isLoggedIn(),
  validId("bugId"),
  validId("commentId"),
  async (req, res) => {
    const bugId = req.params.bugId;
    const commentId = req.params.commentId;

    try {
      // Get the bug by id
      const bug = await GetBugById(bugId);
      debugBug(`Bug Comments: ${JSON.stringify(bug.comments)}`);
      // Check if the bug exists
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        // Get the comment by id
        const bugComment = await GetComment(commentId);
        debugBug(`Bug Comment: ${JSON.stringify(bugComment)}`);
        res.status(200).json(bugComment);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Get Bug Comment by ID
router.post(
  "/:bugId/comments/new",
  isLoggedIn(),
  validId("bugId"),
  validBody(commentSchema),
  async (req, res) => {
    const bugId = req.params.bugId;
    const newComment = req.body;
    debugBug(`Bug id: ${bugId}`);
    debugBug(`New comment: ${newComment}`);

    if (req.auth) {
      debugBug(`User: ${JSON.stringify(req.auth)}`);
    }

    try {
      // Get the bug by id
      const bug = await GetBugById(bugId);
      debugBug(`Bug Comments: ${JSON.stringify(bug.comments)}`);
      // Check if the bug exists
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        // Create the new comment
        const result = await createComment(newComment);
        debugBug(`Comment created: ${JSON.stringify(result)}`);
        // Add the comment id to the bug's comments array
        bug.comments.push(result.insertedId);
        // Update the bug with the new comment
        const updateResult = await updateBug(bug);
        debugBug(`Bug updated: ${JSON.stringify(updateResult)}`);
        res.status(200).json(`Comment added to bug ${bugId}`);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// List tests by Bug ID
router.get("/:bugId/tests", isLoggedIn(), validId("bugId"), async (req, res) => {
  const bugId = req.bugId;
  debugBug(`Bug: ${bugId}`);

  try {
    const bug = await GetBugById(bugId);
    debugBug(`Bug Test Cases: ${JSON.stringify(bug.testCases)}`);

    if (!bug) {
      return res.status(404).send("Bug not found");
    }

    let detailedTestCases = [];

    for (let i = 0; i < bug.testCases.length; i++) {
      const testsList = await GetTests(bug.testCases[i]);
      debugBug(`Tests: ${JSON.stringify(testsList)}`);
      detailedTestCases.push(testsList);
    }
    res.status(200).json(detailedTestCases);
  } catch (err) {
    debugBug(`Error: ${err.message}`);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;

    try {
      const bug = await GetBugById(bugId);
      debugBug(`Bug Test Cases: ${JSON.stringify(bug.testCases)}`);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const testsListById = await GetTests(testsId);
      debugBug(`Tests: ${JSON.stringify(testsListById)}`);
      res.status(200).json(testsListById);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

router.post(
  "/:bugId/tests/new",
  isLoggedIn(),
  validId("bugId"),
  validBody(newTestsSchema),
  async (req, res) => {
    const bugId = req.bugId;
    const newTests = req.body;

    try {
      const bug = await GetBugById(bugId);
      debugBug(`Bug: ${JSON.stringify(bug)}`);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const result = await CreateTests(newTests);
      result.lastUpdated = new Date();
      result.lastUpdatedBy = req.auth._id;
      debugBug(`Tests created: ${JSON.stringify(result)}`);

      bug.testCases.push(result.insertedId);
      const updateResult = await updateBug(bug);
      debugBug(`Bug updated: ${JSON.stringify(updateResult)}`);
      const log = {
        timestamp : new Date(),
        collection : "bugs",
        operation : "update",
        target: bugId,
        update: updateResult,
        auth: req.auth,
      }
      await saveAuditLog(log);
      return res.status(200).json(`Tests added to bug ${bugId}`);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// Update Tests
router.patch(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  validId("bugId"),
  validId("testsId"),
  validBody(updateTestSchema),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;
    const updatedTests = req.body;

    try {
      const bug = await GetBugById(bugId);
      debugBug(`Bug: ${JSON.stringify(bug)}`);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const tests = await GetTests(testsId);
      debugBug(`Tests: ${JSON.stringify(tests)}`);

      if (!tests) {
        return res.status(404).send("Tests not found");
      }

      for (const key of Object.keys(updatedTests)) {
        tests[key] = updatedTests[key];
        debugBug(`Key: ${key} Value: ${updatedTests[key]}`);
      }

      // Save the updated test details back to the database
      const updateResult = await updateTests(tests);
      debugBug(`Tests updated: ${JSON.stringify(updateResult)}`);
      updateResult.lastUpdatedOn = new Date();
      updateResult.lastUpdatedBy = req.auth._id;

      const log = {
        timestamp : new Date(),
        collection : "testCases",
        operation : "update",
        target: testsId,
        update: updateResult,
        auth: req.auth,
      };
      await saveAuditLog(log);
      return res.status(200).json(`Tests updated for bug ${bugId}`);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

router.delete(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;

    try {
      const bug = await GetBugById(bugId);
      debugBug(`Bug: ${JSON.stringify(bug)}`);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const tests = await GetTests(testsId);
      debugBug(`Tests: ${JSON.stringify(tests)}`);

      if (!tests) {
        return res.status(404).send("Tests not found");
      }

      const deleteResult = await deleteTests(testsId);
      debugBug(`Tests deleted: ${JSON.stringify(deleteResult)}`);
      const log = {
        timestamp : new Date(),
        collection : "testCases",
        operation : "delete",
        target: testsId,
        update: deleteResult,
        auth: req.auth,
      };
      await saveAuditLog(log);
      return res.status(200).json(`Tests deleted for bug ${bugId}`);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

export { router as bugRouter };
