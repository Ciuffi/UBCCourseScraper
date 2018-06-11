# UBCCourseScraper


## Introduction

the Ubc Course Scraper is a node server that facilitates database access
to a postgres database that stores UBC course information, and a web scraper that periodically retrives
that information.

## Basic Setup

1. Install [Node](https://nodejs.org/en/)
2. Setup a postgres database and import the _schema_dump_ restore file.
3. To start the server, type `node server.js` in the root directory

The database address is hard coded so make sure to change it (under `dbClient.js`)

The server will throw an error right away if it had trouble connecting to the database.

A working version that is kept up to date can be found at: [http://207.6.49.83:8080/](http://207.6.49.83:8080/)