# Twitter Clone

## Overview

A Backend Restful API system focuses on key aspects such as authentication, tweeting, and tagging.
It uses [Fastify](https://www.fastify.io/) as a web framework, [TypeScript](https://www.typescriptlang.org/) for type-safe development, and [Sequelize](https://sequelize.org/) for handling database operations and migrations using [PostgreSQL](https://www.postgresql.org/).

## Prerequisites

* NodeJS version v22.13.1 or higher.
* NMP version 10.9.2 (or yarn compatible version).
* NVM can be used for node version installation and dependencies (optional).
* Fastify version 5.2.2.
* TypeScript version 5.8.2.
* PostgreSQL version 14.

## Setup Environment

An environemnt variables file `.env` should be available in the root directory with the variables for the solution:

* APP_NAME=***
* APP_VERSION=***
* APP_PORT=***
* ENV_NAME=***
* DB_HOST=***
* DB_USER=***
* DB_PASS=***
* DB_NAME=***
* ENV_NAME="development"
* LOGGING=true
* AUTH_SECRET_KEY=***
* AUTH_TOKEN_EXPIRY=** (e.g: 2h)
* DEFAULT_PAGINATION_LIMIT=*** (e.g: 20)
* DEFAULT_SEARCH_MIN_CHARACTERS=*** (e.g: 3)

The `tsconfig.json` and `tsconfig.test.json` are set up with Fastify's type definitions. If customization is needed, modify the relevant compiler options.

## Installation

* Run `npm install` to install dependencies (required modules).

## Migration

To create the required table(s) via the migration script, you can setup a PostgreSQL instance and create a new database then run the following command:

* Run `npm migrate`

To create a new migration, Run `npm generate-migration <name>`.

## Usage

Start the development server:

* Run `npm start` to start and run the application.

Access the API at: 

* `http://localhost:3000/api`

## Unit Tests

The implemented tests integration covers the critical functionalities (i.e: services and routes).

* Run `npm test` to run the unit tests.

## StandardJS

To ensures that the application is fully linted with StandardJS while maintaining compatibility with TypeScript:

* Run `npm run lint` to check for linting issues.
* Run `npm run lint:fix` to automatically fix issues.

## Notes

* The solution has the following libraries and modules installed for usage.
    * `dotenv` (for Environment variables definition).
    * `mocha` and `fastify inject` (for unit tests).
    * `StandardJS` (for linting).
* The solution uses ES module as a type defined in the ECMAScript standard.
* The migrations folder has the migration scripts renamed in `cjs` for type and module compatibility.
* The solution has a Dockerfile and docker-compose.yml files set for running the project in a Docker container environment for dependencies management(can be used for OS compatible environment).
* The project was tested on Windows OS, for users on macOS or Linux, consider verifying compatibility, particularly for any OS specific dependencies, environment variables, or file paths to address platform-specific differences.