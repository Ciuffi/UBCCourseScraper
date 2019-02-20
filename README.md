# UBCCourseScraper


## Introduction

the Ubc Course Scraper is a node server that facilitates database access
to a postgres database that stores UBC course information, and a web scraper that periodically retrives
that information.

## Basic Setup

1. Install [Node](https://nodejs.org/en/)
2. Setup a postgres database and import the _schema_dump_ restore file.
3. To start the server, type `node server.js` in the root directory

The dbclient connects to the database through a postgres connection string. It will attempt to read this string from an environmental variable called DATABASE_URL

The server will throw an error right away if it had trouble connecting to the database.

This is currently being migrated to google cloud and a new data base module (knex).

A live version that is kept up to date can be found at: [http://www.ubc-course-scraper.com/](http://www.ubc-course-scraper.com/)
