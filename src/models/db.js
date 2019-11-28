const mongoose = require('mongoose');
config = require('../config/config');

mongoose.connect(config.dbUrl);
mongoose.set('runValidators', true);
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + config.dbUrl);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

//Include all models/schema
require('./users');
require('./products');