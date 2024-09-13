import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:BugRouter');

router.use(express.urlencoded({ extended: false }));

const bugsArray = [
    { bugId: 1, bugDescription: 'Bug 1', reportedBy: 'John Doe', createdDate: new Date(),  classification: 'Class1', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved', lastUpdated: new Date() },
    { bugId: 2, bugDescription: 'Bug 2', reportedBy: 'John Doe', createdDate: new Date(),  classification: 'Class2', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved', lastUpdated: new Date() },
    { bugId: 3, bugDescription: 'Bug 3', reportedBy: 'John Doe', createdDate: new Date(),  classification: 'Class3', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved', lastUpdated: new Date() },
    { bugId: 4, bugDescription: 'Bug 4', reportedBy: 'John Doe', createdDate: new Date(), classification: 'Class4', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved', lastUpdated: new Date() },
];

router.get('/list', (req, res) => {
    debugBug('bug list route hit /');
    res.json(bugsArray);
});

router.get('/:bugId', (req, res) => {
    const bugId = req.params.bugId;
    const bug = bugsArray.find(bug => bug.bugId === parseInt(bugId));

    if (bug) {
        res.status(200).json(`Bug ${bugId} found`);
    } else {
        res.status(404).send(`Bug ${bugId} not found`);
    }
});

router.post('/new', (req, res) => {
    const newBug = req.body;
    newBug.bugId = bugsArray.length + 1;

    if (!newBug.bugId) {
        res.status(400).send('Bug ID is required');
        return;
    }

     if (!newBug.bugDescription) {
        res.status(400).send('Bug Description is required');
        return;
    } 

     if (!newBug.reportedBy) {
        res.status(400).send('Reported By is required');
        return;
    } 
    
    if (!newBug.createdDate) {
        res.status(400).send('Created Date is required');
        return;
    }

    if (!newBug.classification) {
        res.status(400).send('Classification is required');
        return;
    }

    if (!newBug.assignedTo) {
        res.status(400).send('Assigned To is required');
        return;
    }

    // resolvedDate and resolution are optional
    if (!newBug.resolvedDate) {
        newBug.resolvedDate = "";
    } else {
        const resolvedDate = new Date(req.body.resolvedDate);
        if (isNaN(resolvedDate)) {
            res.status(400).send(`${resolvedDate} is not a valid date`);
            return;
        } else {
            newBug.resolvedDate = resolvedDate;
        }
    }

    if (!newBug.resolution) {
        newBug.resolution = "";
    }
    else {
        newBug.resolution = req.body.resolution;
    }

    bugsArray.push(newBug);
    res.status(200).json({message: `Bug ${newBug.bugId} created successfully`});
});

router.put('/:bugId', (req, res) => {
    const bugId = req.params.bugId;
    const bugToUpdate = bugsArray.find(bug => bug.bugId === parseInt(bugId));
    const updatedBug = req.body;

    if (bugToUpdate) {
        for (const key in updatedBug) {
            if (updatedBug.hasOwnProperty(key)) {
                bugToUpdate[key] = updatedBug[key];
            }
        }
        bugToUpdate.lastUpdated = new Date();
        res.status(200).json(`Bug ${bugId} updated successfully`);
    } else {
        res.status(404).send(`Bug ${bugId} not found`);
    }
});

router.put('/:bugId/classify', (req, res) => {
    const bugId = req.params.bugId;
    const classification = req.body.classification;

    if (!classification) {
        res.status(400).send('Classification is required');
        return;
    } else {
        const bug = bugsArray.find(bug => bug.bugId === parseInt(bugId));
        if (bug) {
            bug.classification = classification;
            bug.classifiedOn = new Date();
            bug.lastUpdated = new Date();
            res.status(200).json(`Bug ${bugId} classified successfully`);
        } else {
            res.status(404).send(`Bug ${bugId} not found`);
        }
    }
});

router.put('/:bugId/assign', (req, res) => {
    const bugId = req.params.bugId;
    const assignedTo = req.body.assignedTo;

    if (!assignedTo) {
        res.status(400).send('Assigned To is required');
        return;
    } else {
        const bug = bugsArray.find(bug => bug.bugId === parseInt(bugId));
        if (bug) {
            bug.assignedTo = assignedTo;
            res.status(200).json(`Bug ${bugId} assigned successfully`);
        } else {
            res.status(404).send(`Bug ${bugId} not found`);
        }
    }
});

// close bug
router.put('/:bugId/close', (req, res) => {
    const bugId = req.params.bugId;
    const resolvedDate = req.body.resolvedDate;
    const resolution = req.body.resolution;

    if (!resolvedDate && !resolution) {
        res.status(400).send('Resolved Date and Resolution are required');
        return;
    }else {
        const bug = bugsArray.find(bug => bug.bugId === parseInt(bugId));
        debugBug(JSON.stringify(bug));
        debugBug(`Index Of Bug ${bugsArray.indexOf(bug)}`);
        if (bug) {
            bug.resolvedDate = resolvedDate;
            bug.resolution = resolution;
            bugsArray[bugsArray.indexOf(bug)] = bug;
            res.status(200).json(`Bug ${bugId} closed successfully`);
        } else {
            res.status(404).send(`Bug ${bugId} not found`);
            return;
        }
    }
});



export { router as bugRouter };