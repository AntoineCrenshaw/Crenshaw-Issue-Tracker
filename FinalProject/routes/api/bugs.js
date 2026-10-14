import express from "express";
const router = express.Router();
import moment from "moment";

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
import { hasPermission, isLoggedIn, hasAnyRole } from "@merlin4/express-auth";

router.use(express.urlencoded({ extended: false }));

const newBugSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
  stepsToReproduce: Joi.string().min(1).max(500).required(),
});

const updateBugSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  description: Joi.string().min(1).max(500),
  stepsToReproduce: Joi.string().min(1).max(500),
  assignedToUserName: Joi.string().min(1).max(100),
  closed: Joi.boolean(),
  classification: Joi.string(),
}).unknown(true);

const classifyBugSchema = Joi.object({
  classification: Joi.string().min(3).required(),
});

const assignBugSchema = Joi.object({
  assignedToUserId: Joi.string().required(),
  assignedToUserName: Joi.string(),
});

const closeBugSchema = Joi.object({
  closed: Joi.boolean().required(),
});

const commentSchema = Joi.object({
  comment: Joi.string().min(1).max(500).required(),
});

const newTestsSchema = Joi.object({
  status: Joi.string().min(1).required(),
  addedBy: Joi.string().required(),
});

const updateTestSchema = Joi.object({
  status: Joi.string().min(1),
  addedBy: Joi.string(),
});

// List all bugs
router.get("", isLoggedIn(), hasPermission("canViewData"), async (req, res) => {
  console.log("Body:", req.body);
  try {
    let match = {};

    let { keywords, classification, sortBy, closed, minAge, maxAge } =
      req.query;

    debugBug(`Min Age: ${minAge}`);
    debugBug(`Max Age: ${maxAge}`);

    if (keywords) {
      match.$text = { $search: keywords };
    }

    if (classification) {
      match.classification = { $eq: classification };
    }

    if (closed == "true") {
      match.closed = { $eq: true };
    } else if (closed == "false") {
      match.closed = { $eq: false };
    }

    let sort = { createdOn: 1 };

    switch (sortBy) {
      case "newest":
        sort = { createdOn: -1 };
        break;
      case "oldest":
        sort = { createdOn: 1 };
        break;
      case "title":
        sort = { title: 1, createdOn: -1 };
        break;
      case "classification":
        sort = { classification: 1, createdOn: -1 };
        break;
      case "assignedTo":
        sort = { assignedToUserName: 1, createdOn: -1 };
        break;
      case "createdBy":
        sort = { authorFullName: 1, createdOn: -1 };
        break;
      default:
        sort = { createdOn: 1 };
    }

    const today = new Date(); // Get current date and time
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0); // Remove time from Date

    const parsedMinAge = parseInt(minAge, 10);
    const parsedMaxAge = parseInt(maxAge, 10);

    // Calculate past date based on minAge and maxAge
    const pastMaximumDaysOld = new Date(today);
    pastMaximumDaysOld.setDate(pastMaximumDaysOld.getDate() - parsedMaxAge); // Set pastMaximumDaysOld to today minus maxAge
    const pastMinimumDaysOld = new Date(today);
    pastMinimumDaysOld.setDate(pastMinimumDaysOld.getDate() - parsedMinAge); // Set pastMinimumDaysOld to today minus minAge

    if (parsedMinAge && parsedMaxAge) {
      match.createdOn = { $lte: pastMinimumDaysOld, $gte: pastMaximumDaysOld };
    } else if (parsedMinAge) {
      match.createdOn = { $gte: pastMinimumDaysOld };
    } else if (parsedMaxAge) {
      match.createdOn = { $lte: pastMaximumDaysOld };
    }
    const pipeline = [{ $match: match }, { $sort: sort }];

    let bugs = await GetAllBugs(pipeline);

    res.status(200).json({ bugs, message: "Bugs successfully fetched" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get Bug by ID
router.get(
  "/:bugId",
  isLoggedIn(),
  hasPermission("canViewData"),
  validId("bugId"),
  async (req, res, next) => {
    const bugId = req.bugId;
    try {
      const bug = await GetBugById(bugId);
      if (bug) {
        res.status(200).json(bug);
      } else {
        res.status(404).json({ message: `Bug ${bugId} not found` });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
);

// Create New Bug
router.post(
  "/new",
  isLoggedIn(),
  hasAnyRole(),
  hasPermission("canCreateBug"),
  validBody(newBugSchema),
  async (req, res, next) => {
    const newBug = req.body;

    try {
      newBug.createdOn = new Date();
      moment(newBug.createdOn).toDate();
      newBug.authorID = req.auth._id;
      newBug.authorFullName = `${req.auth.fullName}`;
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
  },
);

// Update Bug
router.patch(
  "/:bugId",
  hasPermission("canEditAnyBug", "CanEditMyBug", "canEditIfAssignedTo"),
  validId("bugId"),
  isLoggedIn(),
  validBody(updateBugSchema),
  async (req, res) => {
    const bugId = req.bugId;
    const updatedBug = req.body
    //try catch
    try {
      const getBug = await GetBugById(bugId);
      console.log(`bug id value returned: ${bugId}`)
      if (!getBug) {
        return res.status(404).json({ message: `Bug ${bugId} not found.`});
      }
        for (const key of Object.keys(updatedBug)) {
          getBug[key] = updatedBug[key];
        }

         if (getBug.closed === true) {
            getBug.closedOn = new Date();
            getBug.closedBy = req.auth._id;
          } else {
            getBug.closed = false;
            getBug.closedOn = "";
            getBug.closedBy = "";
          }
        

           await updateBug(getBug);

          const log = {
            timestamp: new Date(),
            collection: "bugs",
            operation: "update",
            target: bugId,
            update: getBug,
            auth: req.auth,
          };
          await saveAuditLog(log);
          res.status(200).json({ message: `Bug ${bugId} updated!`, bugId });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },);

//Update Bug Classification/Priority
router.patch(
  "/:bugId/classify",
  validId("bugId"),
  hasPermission("canClassifyAnyBug"),
  isLoggedIn(),
  validBody(classifyBugSchema),
  async (req, res, next) => {
    const bugId = req.bugId;
    const newClassification = req.body;

    const currentBug = await GetBugById(bugId);
    console.log(currentBug);

    currentBug.classification = newClassification;
    currentBug.classifiedOn = new Date();
    currentBug.lastUpdated = new Date();
    currentBug.classifiedBy = req.auth._id;
    debugBug(`Bug classification updated: ${currentBug}`);

    const result = await updateBugClassification(newClassification);
    debugBug(`Bug classification updated: ${JSON.stringify(result)}`);

    const log = {
      timestamp: new Date(),
      collection: "bugs",
      operation: "update",
      target: bugId,
      update: newClassification,
      auth: req.auth,
    };
    console.log(log);
    await saveAuditLog(log);
    return res.status(200).json({ message: `Bug ${bugId} classified!`, bugId });
  },
);

//update assigned to
router.patch(
  "/:bugId/assign",
  validId("bugId"),
  hasPermission("canReassignIfAssignedTo"),
  isLoggedIn(),
  validBody(assignBugSchema),
  async (req, res, next) => {
    const bugId = req.bugId;

    const { assignedToUserId } = req.body;

    try {
      const bug = await GetBugById(bugId);

      const assignedToUser = await GetUserById(assignedToUserId);

      bug.assignedBy = req.auth._id;
      bug.assignedToUserId = assignedToUser._id;
      bug.assignedToUserName = `${assignedToUser.fullName}`;
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
          `Bug ${bugId} assigned to ${assignedToUser.givenName} ${assignedToUser.familyName} successfully`,
        );
    } catch (err) {
      debugBug(`Error assigning bug: ${err.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

//close bug
router.put(
  "/:bugId/close",
  validId("bugId"),
  hasPermission("canCloseAnyBug"),
  isLoggedIn(),
  validBody(closeBugSchema),
  async (req, res, next) => {
    const bugId = req.bugId;
    const  closed  = req.body;

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
        update: {
          closed: closed,
          closedOn: bug.closedOn,
          closedBy: bug.closedBy,
        },
        auth: req.auth,
      };
      await saveAuditLog(log);
      res.status(200).json({ message: `Bug ${bugId} closed!`, bugId });
    } catch (err) {
      res.status(500).send(err);
    }
  },
);

// Get comments for specific bug
router.get(
  "/:bugId/comment/list",
  isLoggedIn(),
  hasPermission("canViewData"),
  validId("bugId"),
  async (req, res) => {
    const bugId = req.bugId;

    try {
      const bug = await GetBugById(bugId);
      if (bug == null) {
        return res.status(404).send("Bug not found");
      }

      //list comments
      // const detailedComments = await Promise.all(
      //   bug.comments.map((commentId) => GetComment(commentId)),
      // );

      const detailedComments = await Promise.all(
        bug.comments.map(async (commentId) => {
          console.log("Comment ID:", commentId);

          const comment = await GetComment(commentId);

          console.log("Found comment:", comment);

          return comment;
        }),
      );
      res.status(200).json(detailedComments);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
);

// Get specific comment for a bug
router.get(
  "/:bugId/comment/:commentId",
  isLoggedIn(),
  validId("bugId"),
  validId("commentId"),
  hasPermission("canViewData"),
  async (req, res) => {
    const bugId = req.bugId;
    const commentId = req.commentId;

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
  },
);

// Get Bug Comment by ID to Create a Comment
router.post(
  "/:bugId/comment/new",
  isLoggedIn(),
  hasPermission("canAddComments"),
  validId("bugId"),
  validBody(commentSchema),
  async (req, res) => {
    const bugId = req.bugId;
    const newComment = req.body;

    if (req.auth) {
      debugBug(`User: ${JSON.stringify(req.auth)}`);
    }

    try {
      const bug = await GetBugById(bugId);
      if (JSON.stringify(bug) === "{}" || bug === null) {
        res.status(404).send("Bug not found");
      } else {
        newComment.createdOn = new Date();
        const result = await createComment(newComment);
        bug.comments.push(result.insertedId);
        const updateResult = await updateBug(bug);
        res.status(200).json(`Comment added to bug ${bugId}`);
      }
    } catch (err) {
      res.status(500).send(err);
    }
  },
);

// List tests by Bug ID
router.get(
  "/:bugId/test/list",
  isLoggedIn(),
  validId("bugId"),
  hasPermission("canViewData"),
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
  },
);

// Retrieve a specific test case for a bug
router.get(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission("canViewData"),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.bugId;
    const testsId = req.testsId;

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
  },
);

// Create new test case for a bug
router.post(
  "/:bugId/tests",
  isLoggedIn(),
  hasPermission("canAddTestCase"),
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
  },
);

// Update specific test case for a bug
router.patch(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission("canEditTestCase"),
  validId("bugId"),
  validId("testsId"),
  validBody(updateTestSchema),
  async (req, res) => {
    const bugId = req.bugId;
    const testsId = req.testsId;
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
  },
);

// Delete specific test case for a bug
router.delete(
  "/:bugId/tests/:testsId",
  isLoggedIn(),
  hasPermission("canDeleteTestCase"),
  validId("bugId"),
  validId("testsId"),
  async (req, res) => {
    const bugId = req.bugId;
    const testsId = req.testsId;

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
  },
);

export { router as bugRouter };
