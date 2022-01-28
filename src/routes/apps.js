const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../database');
const helper = require('../helpers/getLast');
const { checkAuthenticated } = require('../helpers/authentication');
const functions = require('../helpers/functions')
const req = require('express/lib/request');
const { indexOfId } = require('../database');

router.get('/apps/', checkAuthenticated, (req, res) => {
    res.render('apps/apps.ejs', { title: 'Apps | Home' })
})

router.get('/apps/notes/add', checkAuthenticated, (req, res) => {
    res.render('apps/add-note.ejs', { title: 'Apps | Notes-add' })
})

router.get('/apps/notes/:id', checkAuthenticated, async(req, res) => {
    // Get the user's notes
    const Data = req.session.notes
    const id = req.params.id

    if (!Data.notes[id]) {
        // * In case user doesn't have notes in db, just create the note id in db
        Data.notes[id] = []
        req.session.notes = Data
        db.write(path.join(__dirname, '../../database/notes.json'), req.session.notes)
    }
    const Notes = Data.notes[id]



    // Pass and show them on the html file
    res.render('apps/notes.ejs', { title: 'Apps | Notes', notes: Notes })
})

router.post('/apps/notes/add', checkAuthenticated, async(req, res) => {
    const { title, description } = req.body
    const Data = req.session.notes
    const id = req.user.id

    // Add a new note inside the object, then inside the db
    Data.notes[id].push({
        id: Date.now(),
        title: title,
        description: description
    })

    db.write(path.join(__dirname, '../../database/notes.json'), req.session.notes)
    req.flash('success', 'Note Added Successfully!')
    res.redirect(`/apps/notes/${id}`)
})

router.delete('/apps/notes/delete/:noteId', checkAuthenticated, async(req, res) => {
    // Find the note to delete
    const Data = req.session.notes
    const noteId = req.params.noteId
    const id = req.user.id
    const indexOfId = db.indexOfId(Data.notes[id], noteId)

    // Delete the note
    Data.notes[id].splice(indexOfId, 1)
    req.session.notes = Data

    // Write the changes over the db
    req.flash('success', 'Note Deleted Successfully')
    db.write(path.join(__dirname, '../../database/notes.json'), req.session.notes)

    // Change the note
    res.redirect(`/apps/notes/${id}`)
})

// todo: Trivia Game

router.get('/apps/trivia/', checkAuthenticated, (req, res) => {
    // ? Only load the question once
    req.session.score = 0
    req.session.startTime = Date.now()
    req.session.progression = []
    req.session.triviaThemes = {
        'informatic': [
            { question: 'When was the first computer invented?', options: [1947, 1977, 1943, 1843], answer: 3 },
            { question: 'What was the name of the first computer invented?', options: ['Electronic Numerical Integrator and Computer (ENIAC).', 'Little Boy', 'IBM', 'Analogyc Numerical Integrator Computer (ANIC)'], answer: 1 },
            { question: 'Who is known as the father of computers?', options: ['Nikola Tesla', 'Albert Einstein', 'Rainchmanoff', 'Charles Babbage.'], answer: 4 },
            { question: 'What was the name of the first computer programmer?', options: ['Linus Torvals', 'Ada Lovelace', 'Steve Jobs', 'Alan Turing'], answer: 2 },
        ],
        'spanish': [
            { question: 'En el idioma español al momento de describir sustantivos plurales se usa el', options: ['Masculino Genérico', 'Femenino Genérico', 'Género Neutro', 'Ningúno de los anteriores'], answer: 1 },
            { question: '¿Cuál enunciado es correcto?', options: ['Ahí va la águila', 'Ay va la aguíla', 'Ay va el águila', 'Ahí va el águila'], answer: 4 },
            { question: '¿Dónde está la silaba tónica de la palabra "editor"', options: ['Primera sílaba', 'Segunda sílaba', 'Tercera sílaba', 'Cuarta sílaba'], answer: 3 },
            { question: '¿Cuál es la diferencia entre "ves" y "vez"', options: ['"Ves" es para una ocasión mientras que "vez" es del verbo ver', '"Ves" es para una ocasión mientras que "vez" está mal escrito', '"Ves" es del verbo ver por otro lado "vez" se refiere a una ocasión', '"Ves" está mal escrito por otro lado "vez" es del verbo ver'], answer: 3 },
        ],
        'history': [
            { question: 'Which American President do people commemorate on National Freedom Day?', options: ['Abraham Lincoln', 'Lincoln Abrahama', 'John F. Kenedy', 'John F. Trump'], answer: 1 },
            { question: 'How many American Presidents were single children?', options: ['Zero! All America Presidents have had at least a step-sibling', 'Two! All America Presidents have had at least two brothers', 'Three! All America Presidents have belonged The Three Musketeers', 'Most of America Presidents have had different number of brothers'], answer: 1 },
            { question: 'Which President had fake dentures made from the teeth of slaves?', options: ['Benjamin Franklin', 'Abraham Lincoln', 'James Madison', 'George Washington'], answer: 4 },
            { question: 'Which new President won the most votes in the history of American Elections?', options: ['Donald Trump', 'President-Elect (at the time of writing) Joe Biden', 'Hillary Clinton', 'John Adams'], answer: 2 },
        ],
        'biology': [
            { question: 'Name the five human senses', options: ['Sight, smell, touch', 'Humans do not have senses', 'Sight, smell, touch, taste and hearing', 'Sight, smell, touch, taste and laughing'], answer: 3 },
            { question: 'What material is picked up by magnets?', options: ['Metal', 'Cloth', 'Stone', 'Wook'], answer: 1 },
            { question: 'What three things do most plants need to grow?', options: ['Sunlight, Soil and Love', 'Sunlight, Water and Soil', 'Just Water', 'Most plants do not need anything to grow'], answer: 2 },
            { question: 'What is the solid version of water called?', options: ['Orange Juice', 'Ice', 'Frozen Soda', 'Liquid Water'], answer: 2 },
        ]
    }
    let userIndex = db.indexOfId(req.session.triviaScores, req.user.id)
    res.render('apps/trivia.ejs', { title: 'Trivia Game', allScores: req.session.triviaScores, userIndex })
})

// todo: Tivia game Routers
router.get('/apps/trivia/:theme/:question/:answer', checkAuthenticated, (req, res) => {

    // * The escentials that we need for showing up the whole questions on screen
    const question = parseInt(req.params.question)
    const lastAnswer = req.params.answer
    const Trivia = req.session.triviaThemes[req.params.theme]
    req.session.theme = req.params.theme

    // * Loading the question depending to the param passed via URL, by getting it from 'req.session.triviaThemes, besides, we pass the whole parameters that the file called apps/trivia/index.ejs needs such as, question title, next question, the whole question and more'
    const crnQuestion = Trivia[question - 1]


    // * Validate the answer
    try {
        // In case user is in first question, we can't access to "Trivia[question - 2]", so we try and catch this part
        if (Trivia[question - 2].answer == lastAnswer) {
            req.session.score += 250
        }
    } catch {
        'nothing'
    }

    // ? Checking out that the question is the last one
    if (question == Trivia.length + 1) {
        // ? Check out is the last question and show the score
        res.redirect('/apps/trivia/score')
    } else {
        // ? Before starting verifying user has changed the answer via thr url by checking req.session.progression
        // ? We authenticate that the current question and the answer passed via url DO NOT be greater than 4 'cause that question doesn't exist
        if (question > 4 || lastAnswer > 4 || req.session.progression.includes(question)) {
            res.redirect('/apps/trivia/error')
        } else {
            if (question && question != 1) {
                req.session.progression.push(question - 1)
            }
            // ? In case nothing wrong has happened we continue with the next question
            res.render(`apps/trivia/index.ejs`, { title: `Trivia Game | ${req.params.theme.toUpperCase()}`, theme: req.params.theme, next: question + 1, question: crnQuestion.question, options: crnQuestion.options, answer: crnQuestion.answer })
        }
    }
})

router.get('/apps/trivia/score', checkAuthenticated, async(req, res) => {
    const score = req.session.score
    let allScores = req.session.triviaScores
    let beforeSortUserId = db.indexOfId(allScores, req.user.id)

    if (score) {
        // ? Calculate the time spented
        let totalTime = (Date.now() - req.session.startTime) / 1000
        let measure = 'Seconds'

        // ? In case of minutes
        if (totalTime >= 60) {
            totalTime /= 60
            measure = 'Minutes'
        }
        totalTime = functions.roundToTwo(totalTime)

        const newScore = {
            id: req.user.id,
            name: req.user.name,
            score: score,
            category: functions.toCapitalize(req.session.theme),
            time: `${totalTime} ${measure}`
        }

        // * Load the scores and show the lead, if user already have a score overwrite it else just added into the db
        if (!allScores[beforeSortUserId]) {
            allScores.push(newScore)
        } else if (score > allScores[beforeSortUserId].score) {
            allScores[beforeSortUserId] = newScore
        }
    }

    // * Before sending the whole scores, it's highly necessary to sort the array by score number
    allScores = functions.sortScores(allScores)
    const triviaUserId = db.indexOfId(allScores, req.user.id)

    // todo: overwrite changes
    req.session.triviaScores = allScores
    db.write(path.join(__dirname, '../../database/triviaScores.json'), req.session.triviaScores)

    // ! Delete the session variables
    req.session.score = 0
        //req.session.progression = []
    req.session.startTime = null
    res.render('apps/trivia/score.ejs', { title: 'Trivia Game | Score', score: score || allScores[triviaUserId].score, totalTime: allScores[triviaUserId].time, allScores, userIndex: triviaUserId })
})

router.get('/apps/trivia/error', checkAuthenticated, (req, res) => {
    let errors = ["Don't try to hack", "Don't change the url"]
    let userIndex = db.indexOfId(req.session.triviaScores, req.user.id)
    req.session.score = 0
    req.session.progression = []
    req.session.startTime = Date.now()
    res.render('apps/trivia.ejs', { title: 'Trivia Game | ERROR', errors: errors, allScores: req.session.triviaScores, userIndex })
})


// * Books app 

router.get('/apps/books/', checkAuthenticated, (req, res) => {
    // * Checking that user already has a book spot in DB
    if (!req.session.books[req.user.id]) {
        req.session.books[req.user.id] = []
    }
    res.render('apps/books/index.ejs', { title: 'Books App | Home', books: req.session.books[req.user.id] })
})

router.post('/apps/books/add', checkAuthenticated, (req, res) => {

    // * Add a brand new book into db
    const { title, author, image, description } = req.body
    req.session.books[req.user.id].push({
        id: Date.now(),
        title,
        author,
        image,
        description
    })

    // * Save data in db
    db.write(path.join(__dirname, '../../database/books.json'), req.session.books)
    req.flash('success', 'Book Added Successfully!')
    res.redirect('/apps/books/')
})

router.delete('/apps/books/delete/:id', checkAuthenticated, (req, res) => {
    const bookPosition = db.indexOfId(req.session.books[req.user.id], req.params.id)
    req.session.books[req.user.id].splice(bookPosition, 1)

    db.write(path.join(__dirname, '../../database/books.json'), req.session.books)
    req.flash('success', 'Book Deleted Successfully')
    res.redirect('/apps/books/')
})

router.get('/apps/books/update/:id', checkAuthenticated, (req, res) => {
    // * Find book in db
    const bookToUpdate = db.findByKey(req.session.books[req.user.id], 'id', req.params.id)
    res.render('apps/books/update.ejs', { title: 'Books App | Update ', book: bookToUpdate })
})

router.put('/apps/books/update/:id', checkAuthenticated, (req, res) => {
    // * Finally update the book
    const { title, author, image, description } = req.body
    const bookPosition = db.indexOfId(req.session.books[req.user.id], req.params.id)
    req.session.books[req.user.id][bookPosition] = {
        id: req.params.id,
        title,
        author,
        image,
        description
    }

    db.write(path.join(__dirname, '../../database/books.json'), req.session.books)
    req.flash('success', 'Book Updated Successfully!')
    res.redirect('/apps/books/')
})
module.exports = router