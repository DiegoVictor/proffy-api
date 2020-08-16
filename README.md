# [API] Proffy
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiegoVictor/proffy-api/CI?logo=github&style=flat-square)](https://github.com/DiegoVictor/proffy-api/actions)
[![eslint](https://img.shields.io/badge/eslint-7.6.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-26.3.0-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/proffy-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/proffy-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/proffy-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Proffy&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fproffy-api%2Fmaster%2FInsomnia_2020-08-16.json)


Responsible for provide data to the [`web`](https://github.com/DiegoVictor/proffy-web) and [`mobile`](https://github.com/DiegoVictor/proffy-app) front-ends. Permit to register your class availability and subject, also count the number of teacher connected to users (get contacted by whatsapp). The app has validation and a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [SQLite](#sqlite)
      * [Migrations](#migrations)
    * [.env](#env)
* [Usage](#usage)
* [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Pagination](#pagination)
    * [Link Header](#link-header)
    * [X-Total-Count](#x-total-count)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

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
* [knexfile.ts](http://knexjs.org/#knexfile)
> You can find the application's `knexfile.ts` file in the root folder.

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
In this file you may configure the environment, your app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment. The knex's connection configuration used rely on the this key value, so if the environment is `development` the knex connection used will be`development`.|`development`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/proffy-api#errors-reference`

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Too Many Requests",
  "code": 449,
  "docs": "https://github.com/DiegoVictor/proffy-api#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|150|Unexpected error while creating new classes|An error ocorred during the creation of the user, class or schedules.


## Pagination
All the routes with pagination returns 10 records per page, to navigate to other pages just send the `page` query parameter with the number of the page.

* To get the third page of incidents:
```
GET http://localhost:3333/v1/classes?page=3
```

### Link Header
Also in the headers of every route with pagination the `Link` header is returned with links to `first`, `last`, `next` and `prev` (previous) page.
```
<http://localhost:3333/v1/classes?page=7>; rel="last",
<http://localhost:3333/v1/classes?page=4>; rel="next",
<http://localhost:3333/v1/classes?page=1>; rel="first",
<http://localhost:3333/v1/classes?page=2>; rel="prev"
```
> See more about this header in this MDN doc: [Link - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).

### X-Total-Count
Another header returned in routes with pagination, this bring the total records amount.

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

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
