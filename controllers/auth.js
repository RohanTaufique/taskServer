const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
require("dotenv").config();
const User = require("../models/user");
const _ = require("lodash");
const {
    sendConfirmationEmail,
    resetPasswordEmail,
} = require("../helper/emailConfig");

exports.signup = async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
        return res.status(403).json({ error: "Email is taken! Please use another email." });
    }

    const token = jwt.sign({ email: req.body.email }, process.env.SECRET_KEY);

    const user = await new User(req.body);
    user.name = req.body.fname + " " + req.body.lname;
    user.emailVerficationCode = token;
    await user.save((err) => {
        if (err) {
            return res.status(500).send({ error: "Unable to save user, please try again later!" });
        }
        sendConfirmationEmail(user.name, user.email, user.emailVerficationCode);
        return res
            .status(200)
            .json({ message: "Signup successful! Please check your email to verify your account." });
    });
};

exports.verifyUser = async (req, res, next) => {
    const userExists = await User.findOne({
        emailVerficationCode: req.params.confirmationCode,
    });
    if (userExists) {
        userExists.status = "Active";
        userExists.save((err) => {
            if (err) return res.status(500).json({ error: "Unable to verify user" });
            else
                return res
                    .status(200)
                    .json({
                        message: "User verified sucessfully! Please signin.",
                    });
        });
    } else
        return res
            .status(404)
            .json({ message: "Verification link expired, please sign up" });
};



exports.signin = async (req, res) => {
    //find the user based on email
    const { email, password } = req.body;

    await User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: "User with that email does not exisit. Please signup.",
            });
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match",
            });
        }
        if (user.status != "Active") {
            return res
                .status(401)
                .json({
                    message: "Pending Account. Please Verify Your Email!",
                });
        }

        const token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), _id: user._id }, process.env.SECRET_KEY);
        // res.cookie("t", token, { expire: new Date() + 9999 });
        const { _id, name, email } = user;
        // req.session.token = token;
        return res.json({ token, user: { _id, email, name} });
    });
};

exports.forgotPassword = (req, res) => {
    req.check("email", "Email required!").notEmpty();
    req.check("email", "Email must be between 3 to 32 characters")
        .matches(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        .withMessage("Invalid Email Address")
        .isLength({
            min: 4,
            max: 32,
        });
    const errors = req.validationErrors();
    //if erro show the first one as they happen
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: "User does not exsist. ",
            });
        }
        const token = jwt.sign(
            { _id: user._id, email },
            process.env.SECRET_KEY,
            { expiresIn: "30m" }
        );
        user.updateOne({ resetPasswordLink: token }, function (err, success) {
            if (err) {
                return res
                    .status(400)
                    .json({ error: "Reset password link error" });
            } else {
                resetPasswordEmail(user.name, email, token);
                return res
                    .status(200)
                    .json({
                        message:
                            "A verification email to reset your password has been sent to your email address. Please check your email to reset your password. ",
                    });
            }
        });
    });
};

exports.resetPassword = (req, res) => {

    if (req.params.resetCode) {
        jwt.verify(
            req.params.resetCode,
            process.env.SECRET_KEY,
            function (error, decodeData) {
                if (error) {
                    return res.json({
                        error: "Incorrect token or it is expired.",
                    });
                }
                User.findOne(
                    { resetPasswordLink: req.params.resetCode },
                    (err, user) => {
                        if (err || !user)
                            return res
                                .status(400)
                                .json({
                                    error:
                                        "Password reset token is invalid or has expired",
                                });
                        else
                            return res.status(200).json({
                                message: `Hello ${user.name}, your verification has been completed. Please update your password.`,
                            });
                    }
                );
            }
        );
    } else {
        return res.status(401).json({ error: "Reset password link expired!" });
    }
};

exports.newPassword = (req, res) => {
    const { resetCode } = req.params;
    if (resetCode) {
        jwt.verify(
            resetCode,
            process.env.SECRET_KEY,
            function (error, decodeData) {
                if (error) {
                    return res.json({
                        error: "Incorrect token or it is expired.",
                    });
                }
                User.findOne({ resetPasswordLink: resetCode }, (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: "User with this token does not exist.",
                        });
                    }
                    req.check("password", "Password is required").notEmpty();
                    req.check("password")
                        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
                        .withMessage(
                            "Password must contain minimum eight characters, at least one letter and one number.(no special characters are allowed)"
                        );
                    //check for errors
                    const errors = req.validationErrors();
                    //if erro show the first one as they happen
                    if (errors) {
                        const firstError = errors.map((error) => error.msg)[0];
                        return res.status(400).json({ error: firstError });
                    }
                    const obj = {
                        password: req.body.password,
                        resetLink: " ",
                    };
                    user = _.extend(user, obj);
                    user.save((err, result) => {
                        if (err)
                            return res
                                .status(400)
                                .json({ error: "Reset password error." });
                        else
                            return res.status(200).json({
                                message: "Password changed successfully",
                            });
                    });
                });
            }
        );
    } else {
        return res.status(401).json({ error: "Reset password link expired!" });
    }
};
exports.requireSignin = expressJwt({
    secret: process.env.SECRET_KEY,
    algorithms: ["HS256"],
    userProperty: "auth",
});

exports.userById = (req, res, next, id) => {
    User.findById(id)
        .exec((err, user) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Unable to find User!' })
            }
            else{
                user.salt = undefined;
                user.hashed_password = undefined;
                user.emailVerificationCode=undefined
                req.profile = user; //adding a parameter object of profile with info about user in the req
                
                next();
            }
         
        });
};

exports.getUser = (req, res) => {
    if(req.auth._id.toString()===req.profile._id.toString())
    return res.status(200).json({message:"valid user",user:req.profile});
    else
    return res.status(400).json({error:"invalid user"})
}

