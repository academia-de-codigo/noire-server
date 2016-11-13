'use strict';

var Promise = require('bluebird');
var HSError = require('../../lib/error');
var Users = require('../../lib/users.json');

var internals = {};
internals.users = Users;

// created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
internals.secret = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';

// created using npm run token
internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

exports.setUsers = function(users) {
    internals.users = users;
};

exports.findById = function(id) {
    var user = internals.users.find(function(user) {
        return user.id === id;
    });

    if (!user) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Promise.resolve(user);
};

exports.findByEmail = function(email) {
    var user = internals.users.find(function(user) {
        return user.email === email;
    });

    if (!user) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Promise.resolve(user);
};

exports.list = function() {
    return Promise.resolve(internals.users);
};

exports.authenticate = function(email, password) {

    return exports.findByEmail(email).then(function(user) {

        if (!user) {
            return Promise.reject(HSError.AUTH_INVALID_EMAIL);
        }

        if (user.password !== password) {
            return Promise.reject(HSError.AUTH_INVALID_PASSWORD);
        }

        return Promise.resolve(internals.token);
    }).catch(function(err) {

        if (err === HSError.AUTH_INVALID_PASSWORD) {
            return Promise.reject(err);
        }

        return Promise.reject(HSError.AUTH_INVALID_EMAIL);
    });
};
