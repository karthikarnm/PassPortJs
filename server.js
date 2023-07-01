const express = require('express');
const bcrypt = require('bcrypt')
const bodyparser = require("body-parser");
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializepass = require('./passport')

initializepass(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)



const app = express();

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(flash());
app.use(session({
    secret: 'some confidential',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))

const users = [];

app.set('view-engine', 'ejs')

app.get('/data', (req, res) => {
    res.json(users);
    console.log(users)
})
// home Route
app.get('/', checkNotAuthenticated, function (req, res) {
    res.render('home.ejs');
});
app.get('/userdetails', checkAuthentication, function (req, res) {
    res.render('det.ejs', { name: req.user.username });
});
// LoginRoute
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs',)
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/userdetails',
    failureRedirect: '/login',
    failureFlash: true
}))
// Register Route
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPas = await bcrypt.hash(req.body.password, 10)
        const user = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPas
        }
        users.push(user);
        res.redirect('/login');
    }
    catch (err) {
        res.redirect('/register');
        console.log(err)
    }
})
app.delete('/logout', (req, res) => {
    req.logOut((err) => { res.send(err) })
    res.redirect('/login');
})

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/userdetails')
    }
    next();
}



app.listen(3000, () => {
    console.log("SERVER RUNNING ...");
})