exports.routes = {
    login: '/login',
    logout: '/logout',
    signup: '/signup',
    register: '/register?token={token}',
    'update profile': '/profile',
    'view user': '/admin/user/{id}',
    'view role': '/admin/role/{id}',
    'user actions': '/user/{id}',
    'role actions': '/role/{id}'
};

exports.XHR_OPTIONS = {
    TIMEOUT: 5000,
    VERBOSE: true,
    DEBUG: true
};
