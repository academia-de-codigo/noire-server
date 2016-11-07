'use strict';

var Role = require('../models/role');

exports.getRoles = function() {
    return Role.query();
};
