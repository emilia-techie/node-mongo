var jwt = require('jsonwebtoken');

exports.jwtVerification = (req, res, next) => {
    /*Route middleware to verify a token*/
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    let loginSessionKey = token;
    if (loginSessionKey) {
        /*Verify secret and checks exp*/
        jwt.verify(loginSessionKey, 'secret', function(err, decoded) {
            if (err) {
                let resMsg = {
                    "success": false,
                    "message": "Failed to authenticate token!"
                };
                res.status('422').json(resMsg);
            } else {
                /*If everything is good, save to request for use in other routes*/
                req.decoded = decoded;
                req.userId = decoded.userId;
                next();
            }
        });
    } else {
        let resMsg = {
            "success": false,
            "message": "Please enter a valid token!"
        };
        res.status('422').json(resMsg);
    }
}