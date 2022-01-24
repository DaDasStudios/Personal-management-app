const express = require('express');
const router = express.Router();
const path = require('path')
const db = require('../database');
const helper = require('../helpers/getLast');
const passport = require('passport')
const { checkAuthenticated, checkNotAuthenticated } = require('../helpers/authentication')

// * Register

router.get('/users/signup', checkNotAuthenticated, (req, res) => {
    res.render('users/signup.ejs', { title: 'Sign Up' })
})

router.post('/users/signup', checkNotAuthenticated, async(req, res) => {
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
        db.write(path.join(__dirname, '../../database/users.json'), lastData)
        req.flash('success', 'You are registered now!')
        res.redirect('/users/signin')
    }
})

// * Login

router.get('/users/signin', checkNotAuthenticated, (req, res) => {
    res.render('users/signin.ejs', { title: 'Sign In' })
})

// ? Search in database the user and authenticate it with passport-local strategy
router.post('/users/signin', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/users/',
    failureRedirect: '/users/signin',
    failureFlash: true
}))

router.delete('/users/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

// * Profile

router.get('/users/', checkAuthenticated, (req, res) => {
    //console.log(req.isAuthenticated())
    res.render('users/profile.ejs', { title: 'Profile' })
})

router.put('/users/update/:id', async(req, res) => {
    const lastData = await helper.readBefore('../../database/users.json')
    let id = req.params.id

    // Get data
    const { name, email, confirm_password } = req.body

    // We need to know where user belong
    const indexOfId = db.indexOfId(lastData.users, id)

    // Some validations
    const errors = []
    if (!await db.comparePassword(confirm_password, lastData.users[indexOfId].password)) {
        req.flash('error', 'Incorrect password')
    } else {
        // Write changes on db
        lastData.users[indexOfId].name = name
        lastData.users[indexOfId].email = email
        req.flash('success', 'Data updated successfully! Please, Sign In Again')
        db.write(path.join(__dirname, '../../database/users.json'), lastData)
    }

    //req.logOut()
    res.redirect('/users/')

})
module.exports = router