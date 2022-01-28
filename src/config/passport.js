const passportLocal = require('passport-local').Strategy
const passport = require('passport')
const helper = require('../helpers/getLast');
const db = require('../database');

// ? Passport configuration

// * This is the main function which authenticates that user is in the db
const authenticateUser = async(email, password, done) => {
    // ? Search in DataBase
    //console.log('The credentials are:', email, password)
    const lastData = await helper.readBefore('../../database/users.json')

    // If we find the email we're ready to got the entire user
    const user = db.findByKey(lastData.users, 'email', email)

    //console.log(user)
    if (!user) {
        return done(null, false, { message: 'That user does not exist or password is incorrect' })
    }
    if (await db.comparePassword(password, user.password)) {
        return done(null, user)
    } else {
        return done(null, false, { message: 'That user does not exist or password is incorrect' })
    }
}

passport.use(new passportLocal({ usernameField: 'email' }, authenticateUser))

// * Serialization and Deserialization
passport.serializeUser(function(user, done) {
    done(null, user.id)
})
passport.deserializeUser(async function(id, done) {
    // It supposes that search into the db, in this case we won't
    const lastData = await helper.readBefore('../../database/users.json')
    const user = await db.findByKey(lastData.users, 'id', id)
    done(null, user)
})