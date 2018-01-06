[![last commit](https://img.shields.io/github/last-commit/academia-de-codigo/noire-server.svg)]()
[![Build Status](https://api.travis-ci.org/academia-de-codigo/noire-server.svg?branch=master)](https://travis-ci.org/academia-de-codigo/noire-server)
[![Coverage](https://codecov.io/gh/academia-de-codigo/noire-server/branch/master/graph/badge.svg)](https://codecov.io/gh/academia-de-codigo/noire-server)

[![Dependencies Status](https://david-dm.org/academia-de-codigo/noire-server/status.svg)](https://david-dm.org/academia-de-codigo/noire-server)
[![DevDependencies Status](https://david-dm.org/academia-de-codigo/noire-server/dev-status.svg)](https://david-dm.org/academia-de-codigo/noire-server?type=dev)

[![NSP Status](https://nodesecurity.io/orgs/academia-de-codigo/projects/b8063e26-4c37-403f-aa49-e3f8fdacbb3a/badge)](https://nodesecurity.io/orgs/academia-de-codigo/projects/b8063e26-4c37-403f-aa49-e3f8fdacbb3a)

Maintainer: [Rui Ferrão](https://github.com/ferrao)

# Noire Server

Extremely opinionated [Hapi](http://hapijs.com) boilerplate using a layered architecture for proper separation of concerns

**WARNING: Noire is currently under active development and not ready for production use**

### View Layer
* Accept data
* Apply style and formatting
* Rendering

### Controllers
* Map routes
* Extract route parameters
* Kick off some work
* Send the result to a View for rendering

### Service Layer
* Perform work for the Controller
* Return the result for the Controller

### Data Access Layer
* Repository pattern for data entities
* Thin models
* ORM with transactional capabilities

## Features

* HTTP and HTTPS support
* Server rendered views using the Semantic-UI front-end framework and Handlebars template engine
* API routes for rendering on the client side and building SPAs
* Automated API documentation generation
* Stateless JWT auth for API endpoints
* Cookie stored JWT auth for web app with CSRF protection
* RBAC authorization
* AJAX login form
* Client side caching of assets
* Logging to console and file - ops, error, auth and access logs [currently BROKEN]
* Testing, code coverage and Travis CI integration
* Graceful server shutdown
* Database ORM (Objection) with migrations (Knex) support
* Usage of native Promises and async/await

### Desired Features

* Admin interface

## Get it Running

### Clone the repo

`git clone git@github.com:academia-de-codigo/noire-server.git`

### Install the required Dependencies

`npm install`

### Adjust the configuration files to suit your environment

Edit files in `lib/config`

### Setup environment variables

* `NODE_ENV` should be set to either `development`, `staging` or `production`. If not set at all, defaults to `development`
* `JWT_SECRET` should contain a secret which will be used to sign authentication tokens. A safe randomly generated secret can be obtained by running `npm run secret`. Running `` `npm run secret | grep export` `` will automatically set it for you (don't forget the backticks)

### Reset the database to it's original state

`npm run reset`

### Build Semantic-UI
`npm run build`

### Run the unit tests

`npm test`

### Launch the server

`npm start`
