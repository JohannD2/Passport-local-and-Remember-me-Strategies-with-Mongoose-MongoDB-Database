const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const passport = require("passport");
const utils = require('../config/utils');


module.exports = function authController() {
    return {
        index: (req, res) => {
            if (req.user) {
                res.render('index')
            } else {
                res.render('login')
            }
        },

        register: (req, res) => {
            res.render('register')

        },
        async registerPost(req, res) {
            try {
                const { username, email, password } = req.body;
                const hash = await bcrypt.hash(password, 10);
                const user = new User({ username, email, password: hash });
                const registeredUser = await user.save();
                req.login(registeredUser, err => {
                    if (err) return next(err);
                    req.flash('success', 'You are now registered!');
                    res.redirect('/');
                })
            }
            catch (error) {
                req.flash('error', 'Error, please register again! Username OR email already taken.');
                res.redirect('/register');
                    }
        },
        
        // login: (req, res) => {
        //     if (req.isAuthenticated()) {
        //         return res.redirect('/');   
        //     }
        //     res.render('login');
        // },

        postLogin: async (req, res, next) => {
            passport.authenticate('local', {
            }, async function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    req.flash("error", "There is not such user, please try again with the correct email AND password.");
                    return res.redirect('/');
                }
                if (req.body.remember_me) {
                    var token = utils.randomString(64);
                    await Token.create({
                        token: token,
                        user: user._id
                    }).then((token) => {
                        if (token) {
                            res.cookie('remember_me', token.token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
                            return next();
                        }
                    }).catch((err) => {
                        return done(err);
                    })
                }
                req.logIn(user,  function (err) {
                    if (err) {
                        return next(err)
                     }
                    req.flash("success", "You are now logged in!");
                    return res.redirect('/');
                });
            })(req, res, next);
        },

        logout: (req, res) => {
            if (req.session) {
                res.clearCookie("remember_me");
                req.logOut();
                req.flash("success", "You are now logged out!");
                res.redirect('/');
            }
        }
    }
}

