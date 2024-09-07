import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:BugRouter');

router.use(express.urlencoded({ extended: false }));

const bugsArray = [
    { bugId: 1, bugDescription: 'Bug 1', reportedBy: 'John Doe', createdDate: new Date(), classification: 'Class1', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved' },
    { bugId: 2, bugDescription: 'Bug 2', reportedBy: 'John Doe', createdDate: new Date(), classification: 'Class2', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved' },
    { bugId: 3, bugDescription: 'Bug 3', reportedBy: 'John Doe', createdDate: new Date(), classification: 'Class3', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved' },
    { bugId: 4, bugDescription: 'Bug 4', reportedBy: 'John Doe', createdDate: new Date(), classification: 'Class4', assignedTo: 'Jane Doe', resolvedDate: new Date(), resolution: 'Resolved' },
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
    //FIXME: get bug from bugsArray and send response as json
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

    if (!newBug.resolvedDate) {
        res.status(400).send('Resolved Date is required');
        return;
    }

    if (!newBug.resolution) {
        res.status(400).send('Resolution is required');
        return;
    }

    bugsArray.push(newBug);
    res.status(200).json({message: `Bug ${newBug.bugId} created successfully`});
});

router.put('/:bugId', (req, res) => {
    const bugId = req.params.bugId;
    //update existing bug
    const updatedBug = req.body;

    const index = bugsArray.findIndex(bug => bug.bugId === parseInt(bugId));

    if (index !== -1) {
        bugsArray[index] = updatedBug;
        res.json(updatedBug);
    } else {
        res.status(404).send(`Bug ${bugId} not found`);
    }
});

router.put('/:bugID/classify', (req, res) => {
    const bugId = req.params.bugId;
    const classification = req.body.classification;
});

router.put('/:bugId/assign', (req, res) => {
    const bugId = req.params.bugId;
    const assignedTo = req.body.assignedTo;
});

router.put('/:bugId/close', (req, res) => {
    const bugId = req.params.bugId;
});



export { router as bugRouter };