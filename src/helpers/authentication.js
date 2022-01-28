function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        req.flash('error', "You don't have a permission")
        res.redirect('/users/signin')
    }
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        //req.flash('error', "You're logged, What are you doing?")
        res.redirect('/users/')
    } else {
        next()
    }
}



module.exports = { checkAuthenticated: checkAuthenticated }