const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            console.log("email inva")
            return done(null, false, { message: "Email Not found" })

        }
        try {
            const comp = await bcrypt.compare(password, user.password);
            if (comp) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: "Password incorrect" })
            }
        }
        catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' },
        authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { return done(null, getUserById(id)) })
}


module.exports = initialize;