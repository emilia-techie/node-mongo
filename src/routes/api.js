const express = require('express');

const apiBase = '../api';

module.exports = function(app) {
    // API routes with authentication validation
    app.use('/api', require(`${apiBase}/users/index`));
    app.use('/api', require(`${apiBase}/products/index`));

};