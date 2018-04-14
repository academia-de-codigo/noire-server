exports.name = function(optional) {
    return {
        identifier: 'name',
        optional: optional,
        rules: [
            {
                type: 'empty',
                prompt: 'Please enter a full name'
            },
            {
                type: 'minLength[6]',
                prompt: 'Your full name needs at least {ruleValue} characters'
            },
            {
                type: 'maxLength[64]',
                prompt: 'Your full name can not have more than {ruleValue} characters'
            }
        ]
    };
};

exports.username = function(optional) {
    return {
        identifier: 'username',
        optional: optional,
        rules: [
            {
                type: 'empty',
                prompt: 'Please enter a username'
            },
            {
                type: 'minLength[3]',
                prompt: 'Your username needs at least {ruleValue} characters'
            },
            {
                type: 'maxLength[30]',
                prompt: 'Your username can not have more than {ruleValue} characters'
            }
        ]
    };
};

exports.email = function(optional) {
    return {
        identifier: 'email',
        optional: optional,
        rules: [
            {
                type: 'email',
                prompt: 'Please enter a valid email address'
            }
        ]
    };
};

exports.password = function(optional) {
    return {
        identifier: 'password',
        optional: optional,
        rules: [
            {
                type: 'empty',
                prompt: 'Please enter a password'
            },
            {
                type: 'minLength[3]',
                prompt: 'Your password needs at least {ruleValue} characters'
            },
            {
                type: 'maxLength[30]',
                prompt: 'Your password can not have more than {ruleValue} characters'
            }
        ]
    };
};

exports.passwordConfirm = function(optional) {
    return {
        identifier: 'password-confirm',
        optional: optional,
        rules: [
            {
                type: 'empty',
                prompt: 'Please enter a password'
            },
            {
                type: 'minLength[3]',
                prompt: 'Your password needs at least {ruleValue} characters'
            },
            {
                type: 'maxLength[30]',
                prompt: 'Your password can not have more than {ruleValue} characters'
            },
            {
                type: 'match[password]',
                prompt: 'Passwords do not match'
            }
        ]
    };
};
