# [API] Proffy
[![eslint](https://img.shields.io/badge/eslint-6.8.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/proffy-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Proffy&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fproffy-api%2Fmaster%2FInsomnia_2020-08-04.json)


Responsible for provide data to the [`web`](https://github.com/DiegoVictor/proffy-web) front-end. Permit to register your class availability and subject, also count the number of teacher connected to users (get contacted by whatsapp). The app has validation and a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [SQLite](#sqlite)
      * [Migrations](#migrations)
    * [.env](#env)
* [Usage](#usage)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use just one database: [SQLite](https://www.sqlite.org/index.html).


### SQLite
Store the NGOs and its incidents. For more information to how to setup your database see:
* [knexfile.js](http://knexjs.org/#knexfile)
> You can find the application's `knexfile.js` file in the root folder. It already comes with `test` and `development` connection configured, so you will update it only when deploying or staging!

#### Migrations
Remember to run the SQLite database migrations:
```
$ yarn knex:migrate
```
Or:
```
$ npx knex migrate:latest
```
> See more information on [Knex Migrations](http://knexjs.org/#Migrations).

### .env
In this file you may configure your Redis database connection, JWT settings, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/classes
```

## Routes
|route|HTTP Method|params|description
|:---|:---:|:---:|:---:
|`/connections`|GET|`week_day`, `from` and `to` query parameters.|Lists connections total.
|`/connections`|POST|Body with `user_id`.|Increase the number of connections.
|`/classes`|GET|`page` query parameter.|Lists classes available.
|`/classes`|POST|Body with class `subject`, `cost`, user `name`, `avatar`, `whatsapp`, `bio` and class schedule `schedule.week_day`, `schedule.from`, `schedule.to`.|Create new class availability.

### Requests
* `POST /connections`

Request body:
```json
{
  "user_id": "76988"
}
```

* `POST /classes`

Request body:
```json
{
  "name": "John Doe",
  "avatar": "https://avatars2.githubusercontent.com/u/15165349?s=460&u=1013eaaceb8a54984f7f77bc21812ad68f6ef526&v=4",
  "whatsapp": "39379976591",
  "bio": "I have been worked with PHP/Laravel and JavaScript/Node.js for +4 years. Recently I started studying ReactJs and React Native :)",
  "cost": 30,
  "subject": "Node.js",
  "schedule": [
    {
      "week_day": 0,
      "from": "10:00",
      "to": "15:00"
    },
    {
      "week_day": 4,
      "from": "7:00",
      "to": "11:00"
    }
  ]
}
```
