const router = require('express').Router()
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')

router.get("/signup", (req, res, next) => {
    // Shows the sign up form to the user
    res.render('auth/signup.hbs')
});

router.post("/signup", (req, res, next) => {
    const {username, password} = req.body

    if (!username || !password) {
        res.render('auth/signup', {msg: 'Please enter all fields'})
        return;
    }

    let regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!regexPass.test(password)) {
       res.render('auth/signup', {msg: 'Password needs to have special characters, some numbers and be 6 characters minimum'})
       return;
    }

     let salt = bcrypt.genSaltSync(10);
     let hash = bcrypt.hashSync(password, salt);
     UserModel.create({username, password: hash})
        .then(() => {
            res.redirect('/')
        })
        .catch((err) => {
            next(err)
        })
})

router.get("/login", (req, res, next) => {
    // Shows the sign up form to the user
    res.render('auth/login.hbs')
})

router.post("/login", (req, res, next) => {
    const {username, password} = req.body

    // implement the same set of validations as you did in signup as well
    // NOTE: We have used the Async method here. Its just to show how it works
    UserModel.findOne({username: username})
        .then((result) => {
            // if user exists
            if (result) {
                //check if the entered password matches with that in the DB
                bcrypt.compare(password, result.password)
                    .then((isMatching) => {
                        if (isMatching) {
                            // when the user successfully signs up
                            req.session.userData = result
                            res.redirect('/profile')
                        }
                        else {
                            // when passwords don't match
                            res.render('auth/login.hbs', {msg: 'Password is incorrect'})
                        }
                    })
            }
            else {
                // when the user signs in with a username that does not exist
                res.render('auth/login.hbs', {msg: 'Username does not exist'})
            }
        })
        .catch((err) => {
            next(err)
        })
   
});

//Middleware to protect routes
const checkLoggedInUser = (req, res, next) => {
    if (req.session.userData) {
       next()
    }
    else {
        res.redirect('/signin')
    }
    
}

router.get('/profile', checkLoggedInUser, (req, res, next) => {
   let username = req.session.userData.username
   res.render('profile.hbs', {username})
})

router.get('/main', checkLoggedInUser, (req, res, next) => {
    res.render('auth/main.hbs')
 })

router.get('/private', checkLoggedInUser, (req, res, next) => {
    res.render('auth/private.hbs')
 })

//router.get(path, callback,callback,callback,callback,callback)
router.get('/logout', (req, res) => {
   req.session.destroy()
   res.redirect('/')
})

module.exports = router