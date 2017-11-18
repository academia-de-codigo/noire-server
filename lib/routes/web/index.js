const Path = require('path');
const Config = require(Path.join(process.cwd(), 'config'));
const Home = require(Path.join(process.cwd(), 'lib/modules/home/routes/home'));
// const Login = require(Path.join(process.cwd(), 'lib/modules/authorization/routes/web/login'));
// const Profile = require(Path.join(process.cwd(), 'modules/authorization/routes/web/profile'));
// const Admin = require(Path.join(process.cwd(), 'modules/authorization/routes/web/admin'));

exports.endpoints = [

    // { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'GET', path: Config.prefixes.home, config: Home.get },
    // { method: 'GET', path: Config.prefixes.profile, config: Profile.get },
    // { method: 'GET', path: Config.prefixes.admin, config: Admin.get },
    // { method: 'GET', path: Config.prefixes.admin + '/{partial}', config: Admin.get },
    // { method: 'GET', path: Config.prefixes.admin + '/user/{id}', config: Admin.getUser },
    // { method: 'GET', path: Config.prefixes.admin + '/role/{id}', config: Admin.getRole }
];
