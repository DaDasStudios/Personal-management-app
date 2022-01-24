const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../database');
const helper = require('../helpers/getLast');
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/authentication')

router.get('/apps/', checkAuthenticated, (req, res) => {
    res.render('apps/app.ejs', { title: 'Apps | Home' })
})

router.get('/apps/notes/add', (req, res) => {
    res.render('apps/add-note.ejs', { title: 'Apps | Notes-add' })
})

router.get('/apps/notes/:id', async(req, res) => {
    // Get the user's notes
    const Data = await helper.readBefore('../../database/notes.json')
    const id = req.params.id
    const Notes = Data.notes[id]

    // Pass and show them on the html file
    res.render('apps/notes.ejs', { title: 'Apps | Notes', notes: Notes })
})

router.post('/apps/notes/add', async(req, res) => {
    const { title, description } = req.body
    const Data = await helper.readBefore('../../database/notes.json')
    const id = req.user.id

    // Add a new note inside the object, then inside the db
    Data.notes[id].push({
        id: Date.now(),
        title: title,
        description: description
    })
    db.write(path.join(__dirname, '../../database/notes.json'), Data)
    req.flash('success', 'Note Added Successfully!')
    res.redirect(`/apps/notes/${id}`)

})

router.delete('/apps/notes/delete/:noteId', async(req, res) => {
    // Find the note to delete
    const Data = await helper.readBefore('../../database/notes.json')
    const noteId = req.params.noteId
    const id = req.user.id
    const indexOfId = db.indexOfId(Data.notes[id], noteId)

    // Delete the note
    Data.notes[id].splice(indexOfId, 1)

    // Write the changes over the db
    db.write(path.join(__dirname, '../../database/notes.json'), Data)
    req.flash('success', 'Note Deleted Successfully')

    // Change the note
    res.redirect(`/apps/notes/${id}`)
})

module.exports = router