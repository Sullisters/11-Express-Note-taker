const fs = require('fs');
const express = require('express');
const path = require('path');
//Method for generating unique ids
const uuid = require('./helper/uuid');

const notes = require('./db/db.json');

const PORT = process.env.PORT||3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true }));

app.use(express.static('public'));

//GET request for the notes page
app.get('/notes', (req,res)=>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

//GET request for /api/notes
app.get('/api/notes', (req,res)=> {
    res.status(200).json(notes);
});

//GET request for homepage
app.get('*', (req,res)=>
    res.sendFile(path.join(__dirname, 'index.html'))
    );


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

        //Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data)=>{
            if (err){
                console.error(err);
            } else {
                //Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                //Add new note
                parsedNotes.push(newNote);
        
                //Write updated notes back to the file
                fs.writeFile(
                    './db/db.json', 
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr)=>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated notes')
                );
                
            }
        })


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

//DELETE request for the notes page
app.delete('/api/notes/:id', (req,res)=> {
    console.info(`${req.method} request received to remove a note`)

    fs.readFile('./db/db.json', 'utf8', (err, data)=>{
        if (err){
            console.error(err);
        } else {
            //Convert string into JSON object
            const parsedNotes = JSON.parse(data);

            const deleteNotes = req.params.id;

            const newNotes = parsedNotes.filter(note => note.note_id !== deleteNotes)
            if (parsedNotes.length == newNotes.length){
                return res.status(404).send(`Cannot find note`)
            } else {
                //Write updated notes back to the file
                fs.writeFile(
                    './db/db.json', 
                    JSON.stringify(newNotes, null, 4), (err, data)=>{
                        if (err){
                            console.error(err);
                        } else {
                            return res.send('Note deleted.')
                        }
                    }

                );
            }
            
        }
    })
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);