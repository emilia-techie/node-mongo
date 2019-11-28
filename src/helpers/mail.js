var nodemailer = require('nodemailer');

/*Email configuration */
var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: '',
        pass: ''
    }
});
var siteName = "AparajitaTest";

/*Send message after signup */
exports.accountCreatedMail = function(userName) {
    let mailMessage = '';
    mailMessage += 'Hello ' + userName + ', <br/><br/>';
    mailMessage += 'Your ' + siteName + ' profile has been created on ' + siteName + '. <br/><br/>';
    mailMessage += 'Thanks, <br/>Team ' + siteName;
    return mailMessage;
}

/*Forgot password message */
exports.forgotPasswordMsg = function(userName, tempCode) {
    let forgotPasswordMsg = '';
    forgotPasswordMsg += 'Hello ' + userName + ', <br/><br/>';
    forgotPasswordMsg += 'Somebody (hopefully you) requested a new password for the ' + siteName + ' account. No changes have been made to your account yet.<br/><br/>';
    forgotPasswordMsg += 'Please use below temporary code to reset your password.<br/><br/>';
    forgotPasswordMsg += '<strong>OTP: </strong>' + tempCode + '<br/><br/>';
    forgotPasswordMsg += 'Thanks, <br/>Team ' + siteName;
    return forgotPasswordMsg;
}

/*Send email function */
exports.sendMail = function(toEmail, subject, message, callBack) {
    var mailOptions = {
        from: siteName + ' <sswelfare10@gmail.com>',
        to: toEmail,
        subject: subject,
        html: message
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log("error is ", error);
            return callBack(error, info);
        } else {
            console.log('Email sent: ' + info.response);
            return callBack(error, info);
        }

    });
}

/* To get mail error response */
exports.mailErrorResponse = function(message) {
    let mailErrorResponse = {};
    mailErrorResponse.response = {};
    mailErrorResponse.status = 0;
    if (message) {
        mailErrorResponse.message = message;
    } else {
        mailErrorResponse.message = 'User registered, but failed to send an email. Please check your gmail credential!';
    }
    return mailErrorResponse;
}