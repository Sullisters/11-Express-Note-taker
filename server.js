const fs = require('fs');
const express = require('express');
//Method for generating unique ids
const uuid = require('./helper/uuid');
const notes = require('./db/db.json')

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true }));

app.use(express.static('public'));

app.get('/', (req,res)=>
    res.sendFile(path.join(__dirname, '/public/index.html'))
    );

//GET request for /api/notes
app.get('/api/notes', (req,res)=> {
    res.status(200).json(notes);
});

//POST request to add to the notes.json
app.post('/api/notes', (req,res)=> {
    //log that POST request was received
    console.info(`${req.method} request received to add a note`);

    //Destructuring assignment for the items in req.body
    const { title, text }=req.body;

    //If all required properties are present
    if (title && text) {
        //Variable for new object that will be saved
        const newNote = {
            title,
            text,
            note_id: uuid(),
        };

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);