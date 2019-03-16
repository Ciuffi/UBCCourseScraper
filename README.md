# UBCCourseScraper


## Introduction

the Ubc Course Scraper is a node server that facilitates database access
to a postgres database that stores UBC course information, and a web scraper that periodically retrives
that information.

## Basic Setup

1. Install [Node](https://nodejs.org/en/)
2. Setup a postgres database and import the _schema_dump_ restore file.
3. To start the server, type `node server.js` in the root directory

The dbclient uses firebase and connects through google app engine.

The app is currently hosted on Google cloud and uses cron jobs to update daily for basic information and weekly for full section info.

A live version that is kept up to date can be found at: [http://www.ubc-course-scraper.com/](http://www.ubc-course-scraper.com/)
