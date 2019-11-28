var crypto = require('crypto');

/*Send error response- ARP */
exports.sendErrorResponse = function(res, content, message) {
    let data = {
        success: false,
        message: message,
        data: content
    };
    // res.status(404).json(data);
    res.json(data);
};

/*Send success response- ARP */
exports.sendSuccessResponse = function(res, content, message) {
    let data = {
        success: true,
        message: message,
        data: content
    };
    res.status(200).json(data);
};

/*Manage validation error message- ARP */
exports.manageValidationMessages = function(reqData) {
    /* Count object length */
    var count = Object.keys(reqData).length;
    if (count > 0) {
        for (var i = 0; i < count; i++) {
            if (reqData[i]['msg'] != '') {
                return reqData[i]['msg'];
            }
        }
    } else {
        return '';
    }
}

/*Generate randon number- ARP */
exports.generateRandomNo = function(n) {
    let low = 1000;
    let high = 9999;
    var finalNumber = Math.floor(Math.random() * (high - low + 1) + low);
    if (parseInt(finalNumber.length) < parseInt(n)) {
        var finalNumber = this.generateRandomNo(n);
    }
    return finalNumber;
}

/*Gnerate random string- ARP */
exports.generateRandomString = function(text) {
    var text = text;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


/* Calculates the MD5 hash of a password- ARP */
exports.md5 = function(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}