const Config = require('config');
const Login = require('modules/authorization/routes/web-tls/login');
const Admin = require('modules/admin/routes/admin');
const Home = require('modules/home/routes/web-tls/home');
const Contacts = require('modules/authorization/routes/web-tls/contacts');

exports.endpoints = [
    { method: 'GET', path: Config.prefixes.home, config: Home.get },

    { method: 'GET', path: Config.prefixes.login, config: Login.get },
    { method: 'POST', path: Config.prefixes.login, config: Login.login },
    { method: 'GET', path: Config.prefixes.logout, config: Login.logout },

    { method: 'GET', path: Config.prefixes.signup, config: Contacts.getSignup },
    { method: 'POST', path: Config.prefixes.signup, config: Contacts.postSignup },

    { method: 'GET', path: Config.prefixes.admin, config: Admin.get }
];
