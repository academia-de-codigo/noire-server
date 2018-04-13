const Config = require('config');
const Login = require('modules/authorization/routes/web-tls/login');
const Admin = require('modules/admin/routes/web-tls/admin');
const Home = require('modules/home/routes/web-tls/home');
const Contacts = require('modules/authorization/routes/web-tls/contacts');
const Register = require('modules/authorization/routes/web-tls/register');

exports.endpoints = [
    { method: 'GET', path: Config.prefixes.home, config: Home.get },

    { method: 'GET', path: Config.prefixes.login, config: Login.getLogin },
    { method: 'POST', path: Config.prefixes.login, config: Login.postLogin },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout },
    { method: 'GET', path: Config.prefixes.passwordReset, config: Login.getRequestReset },
    { method: 'POST', path: Config.prefixes.passwordReset, config: Login.postRequestReset },

    { method: 'GET', path: Config.prefixes.signup, config: Contacts.getSignup },
    { method: 'POST', path: Config.prefixes.signup, config: Contacts.postSignup },

    { method: 'GET', path: Config.prefixes.register, config: Register.getRegister },
    { method: 'POST', path: Config.prefixes.register, config: Register.postRegister },

    { method: 'GET', path: Config.prefixes.admin, config: Admin.get }
];
