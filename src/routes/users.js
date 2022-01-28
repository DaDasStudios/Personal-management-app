const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../database');
const helper = require('../helpers/getLast');
const passport = require('passport')
const { checkAuthenticated } = require('../helpers/authentication')

// * Register

router.get('/users/signup', (req, res) => {
    res.render('users/signup.ejs', { title: 'Sign Up' })
})

router.post('/users/signup', async(req, res) => {
    // ? Save the user into the database
    const lastData = await helper.readBefore('../../database/users.json')

    // * Some Validations
    const error_array = []

    // * Before save a user inside the DB, we need to check the email is not in the db
    if (db.findByKey(lastData.users, 'email', req.body.email)) {
        error_array.push('That email is already registered')
    }
    if (req.body.password != req.body.confirm_password) {
        error_array.push('Passwords have to match')
    } else if (req.body.password.length < 8) {
        //error_array.push('Password must be at least 8 characters')
    }

    // ? Final Validation
    if (error_array.length > 0) {
        res.render('users/signup.ejs', { title: 'Sign Up', errors: error_array })
    } else {
        // * Create the user 
        const user = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: await db.encodePassword(req.body.password)
        }
        lastData.users.push(user)

        await db.write(path.join(__dirname, '../../database/users.json'), lastData)
        req.flash('success', 'You are registered now!')
        res.redirect('/users/signin')
    }
})

// * Login

router.get('/users/signin', (req, res) => {
    res.render('users/signin.ejs', { title: 'Sign In' })
})

// ? Search in database the user and authenticate it with passport-local strategy
router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/users/init-session',
    failureRedirect: '/users/signin',
    failureFlash: true
}))

router.get('/users/init-session', async(req, res) => {
    // * Once in route "users" we open all the database that we'd need
    req.session.users = await helper.readBefore('../../database/users.json')
    req.session.notes = await helper.readBefore('../../database/notes.json')
    req.session.triviaScores = await helper.readBefore('../../database/triviaScores.json')
    req.session.books = await helper.readBefore('../../database/books.json')
    res.redirect('/users/')
})

router.delete('/users/logout', async(req, res) => {
    // When user logOut, we write the changes over the db, this is because when db is wrote the session somehow gets logged out, so to avoid that we're gonna do that
    //console.log('Saving user data')
    // db.write(path.join(__dirname, '../../database/users.json'), req.session.users)
    // db.write(path.join(__dirname, '../../database/notes.json'), req.session.notes)
    // db.write(path.join(__dirname, '../../database/triviaScores.json'), req.session.triviaScores)
    req.logOut()
    res.redirect('/')
})

// * Profile

router.get('/users/', checkAuthenticated, (req, res) => {
    //console.log(req.isAuthenticated())

    //console.log(req.session.users)
    res.render('users/profile.ejs', { title: 'Profile' })
})

router.put('/users/update/:id', async(req, res) => {
    var lastData = req.session.users
    let id = req.params.id

    // Get data
    const { name, email, confirm_password } = req.body

    // We need to know where user belong
    const indexOfId = db.indexOfId(lastData.users, id)

    // Some validations
    if (!await db.comparePassword(confirm_password, lastData.users[indexOfId].password)) {
        req.flash('error', 'Incorrect password')
    } else {
        // Write changes on db
        lastData.users[indexOfId].name = name
        lastData.users[indexOfId].email = email
        req.flash('success', 'Data updated successfully!')
        req.session.users = lastData
        db.write(path.join(__dirname, '../../database/users.json'), lastData)
    }

    //req.logOut()
    res.redirect('/users/')

})
module.exports = router