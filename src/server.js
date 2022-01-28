const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const db = require('./database');

// Initilizations
const app = express()

// ? Passport configuration
require('./config/passport');


// Configurations
require('dotenv').config({ path: path.join(__dirname, '../.env') })
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', require('ejs').renderFile)
app.set('view-engine', 'ejs')
app.set('layout', 'layouts/layout.ejs')

// Middlewares
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({
    resave: true,
    secret: process.env.SECRET,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.error = req.flash('error')
    app.locals.errors = undefined
    app.locals.user = req.user || null
    app.locals.triviaThemes = req.triviaThemes || null
    next()
})

// Routes
app.use(require('./routes/index'))
app.use(require('./routes/users'))
app.use(require('./routes/apps'))

// Static
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'public/css')))

// Server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})