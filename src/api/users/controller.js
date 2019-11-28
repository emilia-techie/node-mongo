const { sendErrorResponse, sendSuccessResponse, manageValidationMessages, generateRandomNo, md5 } = require('../../helpers/utility');
const { sendMail, mailErrorResponse, forgotPasswordMsg, accountCreatedMail } = require('../../helpers/mail');
/*User schema */
const User = require('mongoose').model('User');
var async = require('async');
var jwt = require('jsonwebtoken');
const maxOtpTime = 10; //minutes

/*User signup with email &  username unique validation  */
exports.signup = (req, res, next) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var gender = req.body.gender;
    /*Validate input values*/
    req.check('name', 'Please enter your full name!').notEmpty();
    req.check('name').matches(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/g).withMessage('Name can only contain letters')
    req.check('name', 'Minimum length of name atleast should be 3!').isLength({ min: 3 });
    req.check('email', 'Please enter email!').notEmpty();
    req.check('email', 'Enter a valid email').isEmail();
    req.check('username', 'Enter a valid username').notEmpty();
    req.check('username', 'Username must be only alphanumeric!').isAlphanumeric();
    req.check('password', 'Please enter password!').notEmpty();
    req.check('password', 'The password field must contain minimum 6 characters, including upper/lower case, numbers & atleast a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$@$!%*#?&]).{6,}$/, "i");
    req.check('gender', 'Please enter gender!').notEmpty();
    req.check('gender', 'Invalid value for gender, it should be Female, Male & Other! ').isIn(['Female', 'Male', 'Other'])
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        async.waterfall([
            function(callback) {
                /*Firstly we'll check if user already exists */
                User.findOne({ email: email }, (err, result) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (result) {
                        return sendErrorResponse(res, {}, 'User already exists!');
                    } else {
                        callback(null, result);
                    }
                });
            },
        ], function(err, result) {
            /*username must be unique */
            User.findOne({ username: username }, (err, result) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (result) {
                    return sendErrorResponse(res, {}, 'This username is unavailable, please try another!');
                } else {
                    let userObj = {};
                    userObj.name = name;
                    userObj.email = email;
                    userObj.username = username;
                    userObj.password = md5(password);
                    userObj.gender = gender;
                    userObj.accountStatus = 1; //(By default 1 for active)
                    userObj.createdAt = new Date();
                    userObj.updatedAt = new Date();
                    /*Store user data in user collection */
                    let Users = new User(userObj);
                    Users.save((err, userResult) => {
                        if (err) return sendErrorResponse(res, {}, { error: err.message });
                        if (userResult) {
                            var userId = userResult._id;
                            /*Generate token using JWT*/
                            var token = jwt.sign({
                                userId: userId
                            }, 'secret', {
                                expiresIn: 86400 //24 hours
                            });
                            userResult.loginSessionKey = token;
                            userResult.save((err, docx) => {
                                if (err) return sendErrorResponse(res, {}, { error: err.message });
                                if (!docx) return sendErrorResponse(res, {}, 'There is some problem while updating details, please try again later!');
                                /*Send an email*/
                                var emailSubject = 'Account Created';
                                sendMail(email, emailSubject, accountCreatedMail(name), function(err, resp) {
                                    if (err) {
                                        res.send(mailErrorResponse());
                                        return false;
                                    } else {
                                        return sendSuccessResponse(res, userResult, 'User registered successfully!');
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    }
}

/*Forgot password */
exports.forgotPassword = (req, res, next) => {
    let email = req.params.email;
    /*Validate input values*/
    req.check('email', 'Email is required!').notEmpty();
    req.check('email', 'Enter a valid email').isEmail();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        async.waterfall([
            function(callback) {
                User.findOne({ email: email }, (err, result) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (result) {
                        callback(null, result);
                    } else {
                        return sendErrorResponse(res, {}, "Email does not exist!");
                    }
                });
            },
            function(results, callback) {
                var userId = results._id;
                User.findOne({ _id: userId }, (err, userRes) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (userRes) {
                        if (userRes.accountStatus == 0) {
                            return sendErrorResponse(res, {}, "Account is inactive!");
                        } else {
                            let getTempCode = generateRandomNo(4);
                            results.tempCode = getTempCode;
                            results.otpTimeLimit = new Date();
                            /* Update tempcode */
                            results.save((err, docx) => {
                                if (err) return sendErrorResponse(res, {}, { error: err.message });
                                if (!docx) return sendErrorResponse(res, {}, 'There is some problem, please try again later!');
                                if (docx) {
                                    callback(null, results, getTempCode);
                                }
                            });
                        }
                    } else {
                        return sendErrorResponse(res, {}, "User not found!");
                    }
                });
            }
        ], function(err, results, getTempCode) {
            var subject = "Forgot Password";
            var message = forgotPasswordMsg(results.name, getTempCode);
            sendMail(results.email, subject, message, function(err, resp) {
                if (err) {
                    res.send(mailErrorResponse());
                    return false;
                } else {
                    return sendSuccessResponse(res, {}, 'A temporary code has been sent to your email. Please use that to reset your password! note that OTP is valid for 10 minutes!');
                }
            });
        });
    }
}

/*Reset password */
exports.resetPassword = (req, res, next) => {
    let newPassword = req.body.newPassword;
    let otp = req.body.otp;
    /*Manage validation*/
    req.check('otp', 'Enter OTP!').notEmpty();
    req.check('newPassword', 'Enter new password').notEmpty();
    req.check('newPassword', 'New password field must contain minimum 6 characters, including upper/lower case, numbers & atleast a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$@$!%*#?&]).{6,}$/, "i");
    req.check('confirmPassword', 'Confirm your password').notEmpty();
    req.check('confirmPassword', 'New password & confirm password must be match!').equals(newPassword);
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        async.waterfall([
            function(callback) {
                User.findOne({ tempCode: otp }, (err, result) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (result) {
                        if (result.accountStatus == 0) {
                            return sendErrorResponse(res, {}, "Account is inactive!");
                        } else {
                            /*Calculate OTP expires time */
                            let today = new Date();
                            let otpTime = result.otpTimeLimit;
                            let diff = (otpTime.getTime() - today.getTime()) / 1000;
                            diff /= 60;
                            let diffMins = Math.abs(Math.round(diff))
                            if (diffMins <= maxOtpTime) {
                                callback(null, result);
                            } else {
                                return sendErrorResponse(res, {}, "OTP expires! Please request a new one.");
                            }
                        }
                    } else {
                        return sendErrorResponse(res, {}, "Invalid code!");
                    }
                });
            }
        ], function(err, result) {
            /* Update user details */
            result.password = md5(newPassword) //newPassword;
            result.tempCode = "";
            result.otpTimeLimit = "";
            result.save((err, docx) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (!docx) return sendErrorResponse(res, {}, 'There is some problem while updating details, please try again later!');
                if (docx) {
                    return sendSuccessResponse(res, { loginSessionKey: result.loginSessionKey }, 'Your password has been reset successfully!');
                }
            });
        });
    }
}

/*User login with email or username*/
exports.login = (req, res, next) => {
    var email = req.body.email;
    var password = req.body.password;
    /*Manage all validations */
    req.check('email', 'Enter your email or username').notEmpty();
    req.check('password', 'Enter password').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "success": false,
            "message": manageValidationMessages(errors)
        });
    } else {
        async.waterfall([
            function(callback) {
                User.findOne({ $and: [{ $or: [{ email: email }, { username: email }] }, { password: md5(password) }] }, (err, result) => {
                    if (err) return sendErrorResponse(res, {}, { error: err.message });
                    if (result) {
                        if (result.accountStatus == 0) {
                            return sendErrorResponse(res, {}, "Account is inactive!");
                        } else {
                            callback(null, result);
                        }
                    } else {
                        return sendErrorResponse(res, {}, "Your email/username or password is incorrect!");
                    }
                });
            },
        ], function(err, result) {
            /*Generate & update token using JWT*/
            var token = jwt.sign({
                userId: result._id
            }, 'secret', {
                expiresIn: 86400 //24 hours
            });
            /* Update loginSessionKey details */
            result.loginSessionKey = token;
            var sendRes = {};
            sendRes.loginSessionKey = token;
            sendRes.userId = result._id;
            result.save((err, docx) => {
                if (err) return sendErrorResponse(res, {}, { error: err.message });
                if (!docx) return sendErrorResponse(res, {}, 'There is some problem while updating details, please try again later!');
                if (docx) {
                    return sendSuccessResponse(res, sendRes, 'You have logged in successfully!');
                }
            });
        });
    }
}