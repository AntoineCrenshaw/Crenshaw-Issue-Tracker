import express from "express";
const router = express.Router();

import debug from "debug";
import {
  GetAllBugs,
  GetBugById,
  createBug,
  updateBug,
  updateBugClassification,
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
import { hasPermission, isLoggedIn , hasAnyRole} from "@merlin4/express-auth";

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

// List all bugs
router.get("", isLoggedIn(), hasPermission('canViewData'), async (req, res) => {
  try {
    let bugs = await GetAllBugs();
    // debugBug(`Bugs: ${JSON.stringify(bugs)}`);
    console.log(bugs.length);

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
    console.log("Received query parameters:", req.query);
    if (classification) {
      bugs = bugs.filter((bug) => bug.classification === classification);
    }
    if (closed) {
      bugs = bugs.filter((bug) => bug.closed === closed);
    }

    //FIX THIS
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    const maxAgeDays = parseInt(maxAge, 10);
    const minAgeDays = parseInt(minAge, 10);
    const pastMaximumDaysOld = new Date(today);
    pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - maxAgeDays); // Set pastMaximumDaysOld to today minus maxAge
    const pastMinimumDaysOld = new Date(today);
    pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - minAgeDays); // Set pastMinimumDaysOld to today minus minAge

    if (maxAge && minAge) {
      bugs = bugs.filter(
        (bug) =>
          new Date(bug.createdOn) >= pastMinimumDaysOld &&
          new Date(bug.createdOn) <= pastMaximumDaysOld
      );
    } else if (minAge) {
      bugs = bugs.filter(
        (bug) => new Date(bug.createdOn) >= pastMinimumDaysOld
      );
    } else if (maxAge) {
      bugs = bugs.filter(
        (bug) => new Date(bug.createdOn) <= pastMaximumDaysOld
      );
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
      }
    }

    // Pagination
    const page = parseInt(pageNumber) || 1;
    const limit = parseInt(pageSize) || 5;
    const skip = (page - 1) * limit;

    bugs = bugs.slice(skip, skip + limit);
    res.status(200).json(bugs);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get Bug by ID
router.get(
  "/:bugId",
  isLoggedIn(),
  hasPermission('canViewData'),
  validId("bugId"),
  async (req, res, next) => {
    const bugId = req.bugId;
    try {
      const bug = await GetBugById(bugId);
      res.status(200).json(bug);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Create New Bug
router.post(
  "/new",
  isLoggedIn(),
  hasAnyRole(),
  hasPermission('canCreateBug'),
  validBody(newBugSchema),
  async (req, res, next) => {
    const newBug = req.body;

    try {
      newBug.createdDate = new Date();
      newBug.createdOn = new Date();
      newBug.createdBy = req.auth._id;
      newBug.classification = "unclassified";
      newBug.closed = false;
      const dbResult = await createBug(newBug);

      const log = {
        timestamp: new Date(),
        collection: "bugs",
        operation: "insert",
        target: newBug._id,
        update: newBug,
        auth: req.auth,
      };
      await saveAuditLog(log);
      res.status(200).json(`Bug created successfully`);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Update Bug
router.patch(
  "/:bugId",
  hasPermission('canEditAnyBug', 'CanEditMyBug', 'canEditIfAssignedTo'),
  validId("bugId"),
  isLoggedIn(),
  validBody(updateBugSchema),
  async (req, res) => {
    const bugId = req.params.bugId;

    const getBug = await GetBugById(bugId);

    if (!getBug) {
      return res.status(404).json({ message: `Bug ${bugId} not found` });
    }

    const updatedBug = req.body;

    for (const key of Object.keys(updatedBug)) {
      getBug[key] = updatedBug[key];
    }

    try {
      getBug.lastUpdated = new Date();
      getBug.lastUpdatedBy = req.auth._id;
      const result = await updateBug(getBug);
      const log = {
        timestamp: new Date(),
        collection: "bugs",
        operation: "update",
        target: bugId,
        update: udpatedBug,
        auth: req.auth,
      };
      await saveAuditLog(log);
      res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//Update Bug Classification/Priority
router.patch(
  "/:bugId/classify",
  validId("bugId"),
  hasPermission('canClassifyAnyBug'),
  isLoggedIn(),
  validBody(classifyBugSchema),
  async (req, res, next) => {
    const bugId = req.bugId;
    const  newClassification  = req.body;

      const currentBug = await GetBugById(bugId);
      console.log(currentBug);
      
        currentBug.classification = newClassification;
        currentBug.classifiedOn = new Date();
        currentBug.lastUpdated = new Date();
        currentBug.classifiedBy = req.auth._id
        debugBug(`Bug classification updated: ${(currentBug)}`);
       
        const result = await updateBugClassification(newClassification);
        debugBug(`Bug classification updated: ${JSON.stringify(result)}`);
        
      //  debugBug(result);
        const log = {
          timestamp: new Date(),
          collection: "bugs",
          operation: "update",
          target: bugId,
          update: newClassification,
          auth: req.auth,
        };
        console.log(log)
        await saveAuditLog(log);
        return res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
  }
);

//update assigned to
router.patch(
  "/:bugId/assign",
  validId("bugId"),
  hasPermission('canReassignIfAssignedTo'),
  isLoggedIn(),
  validBody(assignBugSchema),
  async (req, res, next) => {
    const bugId = req.params.bugId;

    //read from the request body
    const { assignedToUserId } = req.body;

    try {
      // Query the database to get the bug by id
      const bug = await GetBugById(bugId);

      // Query the database to get the user by id
      const assignedToUser = await GetUserById(assignedToUserId);

      // Update the bug's assignment details
      bug.assignedBy = req.auth._id;
      bug.assignedToUserId = assignedToUserId;
      bug.assignedToUserName = `${assignedToUser.givenName} ${assignedToUser.familyName}`;
      bug.assignedOn = new Date();
      bug.lastUpdated = new Date();

      const result = await updateAssignTo(bug);
      const log = {
        timestamp: new Date(),
        collection: "bugs",
        operation: "update",
        target: bugId,
        update: bug,
        auth: req.auth,
      };
      await saveAuditLog(log);
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
  validId("bugId"),
  hasPermission('canCloseAnyBug'),
  isLoggedIn(),
  validBody(closeBugSchema),
  async (req, res, next) => {
    const bugId = req.params.bugId;
    const { closed } = req.body;

    try {
      const bug = await GetBugById(bugId);
      //Set to null if bug is reopened
      if (closed === false) {
        bug.closed = closed;
        bug.closedOn = "";
        bug.closedBy = "";
      }
      bug.closed = closed;
      bug.closedOn = new Date();
      bug.closedBy = req.auth._id;
      bug.lastUpdated = new Date();

      const result = await closeBug(bug);
      debugBug(`Bug closed: ${JSON.stringify(result)}`);
      const log = {
        timestamp: new Date(),
        collection: "bugs",
        operation: "update",
        target: bugId,
        update: {closed: closed, closedOn: bug.closedOn, closedBy: bug.closedBy},
        auth: req.auth,
      };
      await saveAuditLog(log);
      res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Get comments for specific bug
router.get(
  "/:bugId/comment/list",
  isLoggedIn(),
  hasPermission('canViewData'),
  validId("bugId"),
  async (req, res) => {
    const bugId = req.params.bugId;

    try {
      const bug = await GetBugById(bugId);
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        let detailedComments = [];

        for (let i = 0; i < bug.comments.length; i++) {
          const bugComment = await GetComment(bug.comments[i]);
          detailedComments.push(bugComment);
        }

        res.status(200).json(detailedComments);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Get specific comment for a bug
router.get(
  "/:bugId/comment/:commentId",
  isLoggedIn(),
  validId("bugId"),
  validId("commentId"),
  hasPermission('canViewData'),
  async (req, res) => {
    const bugId = req.params.bugId;
    const commentId = req.params.commentId;

    try {
      // Get the bug by id
      const bug = await GetBugById(bugId);
      // Check if the bug exists
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        // Get the comment by id
        const bugComment = await GetComment(commentId);
        res.status(200).json(bugComment);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Get Bug Comment by ID to Create a Comment
router.post(
  "/:bugId/comment/new",
  isLoggedIn(),
  hasPermission('canAddComment'),
  validId("bugId"),
  validBody(commentSchema),
  async (req, res) => {
    const bugId = req.params.bugId;
    const newComment = req.body;

    if (req.auth) {
      debugBug(`User: ${JSON.stringify(req.auth)}`);
    }

    try {
      // Get the bug by id
      const bug = await GetBugById(bugId);
      // Check if the bug exists
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        // Create the new comment
        const result = await createComment(newComment);
        // Add the comment id to the bug's comments array
        bug.comments.push(result.insertedId);
        // Update the bug with the new comment
        const updateResult = await updateBug(bug);
        res.status(200).json(`Comment added to bug ${bugId}`);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// List tests by Bug ID
router.get(
  "/:bugId/test/list",
  isLoggedIn(),
  validId("bugId"),
  hasPermission('canViewData'),
  async (req, res) => {
    const bugId = req.bugId;
    debugBug(`Bug: ${bugId}`);

    try {
      const bug = await GetBugById(bugId);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      let detailedTestCases = [];

      for (let i = 0; i < bug.testCases.length; i++) {
        const testsList = await GetTests(bug.testCases[i]);
        detailedTestCases.push(testsList);
      }
      res.status(200).json(detailedTestCases);
    } catch (err) {
      debugBug(`Error: ${err.message}`);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Retrieve a specific test case for a bug
router.get(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission('canViewData'),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;

    try {
      const bug = await GetBugById(bugId);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const testsListById = await GetTests(testsId);
      res.status(200).json(testsListById);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Create new test case for a bug
router.post(
  "/:bugId/tests",
  isLoggedIn(),
  hasPermission('canAddTestCase'),
  validId("bugId"),
  validBody(newTestsSchema),
  async (req, res) => {
    const bugId = req.bugId;
    const newTests = req.body;

    try {
      const bug = await GetBugById(bugId);

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
        timestamp: new Date(),
        collection: "bugs",
        operation: "update",
        target: bugId,
        update: updateResult,
        auth: req.auth,
      };
      await saveAuditLog(log);
      return res.status(200).json(`Tests added to bug ${bugId}`);
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

// Update specific test case for a bug
router.patch(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission('canEditTestCase'),
  validId("bugId"),
  validId("testsId"),
  validBody(updateTestSchema),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;
    const updatedTests = req.body;

    try {
      const bug = await GetBugById(bugId);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const tests = await GetTests(testsId);

      if (!tests) {
        return res.status(404).send("Tests not found");
      }

      for (const key of Object.keys(updatedTests)) {
        tests[key] = updatedTests[key];
      }

      // Save the updated test details back to the database
      const updateResult = await updateTests(tests);
      debugBug(`Tests updated: ${JSON.stringify(updateResult)}`);
      updateResult.lastUpdatedOn = new Date();
      updateResult.lastUpdatedBy = req.auth._id;

      const log = {
        timestamp: new Date(),
        collection: "testCases",
        operation: "update",
        target: testsId,
        update: updateTests,
        auth: req.auth,
      };
      await saveAuditLog(log);
      return res.status(200).json(`Tests updated for bug ${bugId}`);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

// Delete specific test case for a bug
router.delete(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission('canDeleteTestCase'),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.params.bugId;
    const testsId = req.params.testsId;

    try {
      const bug = await GetBugById(bugId);

      if (!bug) {
        return res.status(404).send("Bug not found");
      }

      const tests = await GetTests(testsId);

      if (!tests) {
        return res.status(404).send("Tests not found");
      }

      const deleteResult = await deleteTests(testsId);
      debugBug(`Tests deleted: ${JSON.stringify(deleteResult)}`);
      const log = {
        timestamp: new Date(),
        collection: "testCases",
        operation: "delete",
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
