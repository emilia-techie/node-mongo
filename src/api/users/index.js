let router = require('express').Router();
let controller = require('./controller');
const jwtVerification = require('../../middlewares/jwt').jwtVerification;

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/forgot-password/:email', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;