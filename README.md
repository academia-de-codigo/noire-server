[![Build Status](https://travis-ci.org/ferrao/hapi-starter.svg?branch=master)](https://travis-ci.org/ferrao/hapi-starter)

[![Dependencies Status](https://david-dm.org/ferrao/hapi-starter/status.svg)](https://david-dm.org/ferrao/hapi-starter)
[![DevDependencies Status](https://david-dm.org/ferrao/hapi-starter/dev-status.svg)](https://david-dm.org/ferrao/hapi-starter?type=dev)

[![NSP Status](https://nodesecurity.io/orgs/rui-ferrao/projects/7f53cba3-6d6c-4e35-8fc8-c7ec79f55ffe/badge)](https://nodesecurity.io/orgs/rui-ferrao/projects/7f53cba3-6d6c-4e35-8fc8-c7ec79f55ffe)
[![Known Vulnerabilities](https://snyk.io/test/github/ferrao/hapi-starter/badge.svg)](https://snyk.io/test/github/ferrao/hapi-starter)

Maintainer: [Rui Ferrão](https://github.com/ferrao)

# Hapi Starter

Extremely opinionated ES5 [Hapi](http://hapijs.com) boilerplate using a layered architecture for proper separation of concerns

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
* Server rendered views using the Foundation front-end framework and Handlebars template engine
* API routes for rendering on the client side and building SPAs
* Automated API documentation generation
* Stateless JWT auth for API endpoints
* Cookie stored JWT auth for web app with CSRF protection
* AJAX login form
* Client side caching of assets
* Logging to console and file - ops, error, auth and access logs
* Testing, code coverage and Travis CI integration
* Graceful server shutdown
* Database ORM (Objection) with migrations (Knex) support
* Usage of Promises with Bluebird

### Desired Features

* Jobs with Agenda
* User management

## Get it Running

### Clone the repo

`git clone https://github.com/ferrao/hapi-starter.git`

### Install the required Dependencies

`npm install`

### Adjust the configuration files to suit your environment

Edit files in `lib/config`

### Setup environment variables

* `NODE_ENV` should be set to either `development`, `staging` or `production`. If not set at all, defaults to `development`
* `JWT_SECRET` should contain a secret which will be used to sign authentication tokens. A safe randomly generated secret can be obtained by running `npm run secret`. Running `` `npm run secret | grep export` `` will automatically set it for you (don't forget the backticks)

### Run the unit tests

`npm test`

### Reset the database to it's original state

`npm run reset`

### Launch the server

`npm start`
