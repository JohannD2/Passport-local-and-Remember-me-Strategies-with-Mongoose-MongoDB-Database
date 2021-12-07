const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const RememberMeStrategy = require('passport-remember-me').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Token = require("../models/Token");
const utils = require('./utils')

passport.use(new LocalStrategy(
    async function (username, password, done) {
        try {
            const user = await User.findOne({ email: username });
            if (user === null) {
                return done(null, false, { message: 'Wrong Username' });
            }
            bcrypt
                .compare(password, user.password)
                .then((match) => {
                    if (match) {
                        return done(null, user, { message: 'Logged in succesfully'});
                    }
                    return done(null, false, { message: 'Wrong username or password' });
                })
                .catch(() => {
                    done(null, false, { message: 'Something went wrong' })
                });
        } catch (error) {
            done(null, false, { message: 'Something went wrong' });
        }
    }
));

passport.use(new RememberMeStrategy(
    async function (token, done) {
        try {
            Token.findOneAndRemove({ token })
                .populate('User')
                .exec(function (err, doc) {
                    if (err) return done(err);
                    if (!doc) return done(null, false);
                    return done(null, doc.user);
                });
        } catch (error) {
            return done(error);
        }
    },
    async function (user, done) {
        try {
            const token = utils.randomString(64);

            await Token.create({
                token: token,
                user: user._id,
            })
            return done(null, token);S
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((_id, done) => {
    User.findById(_id, (err, user) => {
        if (err) {
            done(null, false, { error: err });
        } else {
            done(null, user);
        }
    });
});