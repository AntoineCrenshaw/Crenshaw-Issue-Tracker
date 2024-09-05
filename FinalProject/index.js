import express from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static('frontend/dist'));

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/api', (req, res) => {
    res.send('Hello World from the back end route!');
});