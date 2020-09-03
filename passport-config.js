const User = require('./models/user');

const LocalStrategy = require('passport-local').Strategy;

function initialize(passport, getUser, getUserById){
    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                let found = await getUser(username);
                if(!found) done(null, false, {message: "no such username"});
                if(found.password !== password) done(null, false,
                     {message: "Wrong password"});
                done(null, found);
            } catch (error) {
                done(error);
            }
        }
    ))
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id,done) =>{
        try {
            let  user = await getUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    })
}
module.exports = initialize;