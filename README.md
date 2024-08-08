# [API] Proffy
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/DiegoVictor/proffy-api/config.yml?logo=github&style=flat-square)](https://github.com/DiegoVictor/proffy-api/actions)
[![typescript](https://img.shields.io/badge/typescript-5.5.4-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![eslint](https://img.shields.io/badge/eslint-8.57.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-29.7.0-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/proffy-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/proffy-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/proffy-api/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Proffy&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fproffy-api%2Fmaster%2FInsomnia_2023-09-06.json)


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
  * [Bearer Token](#bearer-token)
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
The application uses just one database: [SQLite](https://www.sqlite.org/index.html).  For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### SQLite
Store all the users, classes and connections. For more information to how to setup your database see:
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
|APP_WEB_URL|Used to create the reset password link (front-end) sent in the recover password email.|`http://127.0.0.1:3000`
|MAIL_HOST|Hostname or IP address of the email provider service| -
|MAIL_PORT|Service's port| `587`
|MAIL_USER|Username to authenticate in the email service| -
|MAIL_PASSWORD|Password to authenticate in the email service| -
|JWT_SECRET|A alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`7d`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/proffy-api#errors-reference`
> For more information about the `MAIL_*` keys configurations see [nodemailer](https://nodemailer.com) website, since this project uses it to mail.

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
  "code": 529,
  "docs": "https://github.com/DiegoVictor/proffy-api#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|141|User not found|Could not found the user of the class.
|144|Class not found|The `id` sent does not references an existing class in the database.
|150|Unexpected error while update new classes|An error ocurred during the updating/creation of the user, classes and schedules.
|240|Email already in use|The provided email is already used by another user.
|244|User not found|The `id` sent does not references an existing user in the database.
|340|User and/or password not match|User and/or password is incorrect.
|344|User not exists|The email sent not references an existing user in the database.
|440|You can not favorite yourself|You provide your own `id` as `favorited_user_id`.
|444|Users not match|Couldn't found one or both users, the favorited (proffy) and you (you not exists xD!).
|540|Token invalid or expired|The reset password JWT token is invalid or expired.
|541|Token invalid or expired|The login JWT token is invalid or expired.
|542|Invalid token|The login JWT token not contain a valid user id.
|543|Token not provided|The login JWT token was not sent.
|544|User does not exists|The provided email not references a user in the database.
|529|Too Many Requests|You reached at the requests limit.
|550|An unexpected error while updating the user occured|Was not possible to reset user password.

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

## Bearer Token
A few routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/classes Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/classes
```

## Routes
|route|HTTP Method|pagination|params|description|auth method
|:---|:---:|:---:|:---:|:---:|:---:
|`/sessions`|POST|:x:|Body with user `email` and `password`.|Authenticates user and return an access token.|:x:
|`/connections`|GET|:x:| - |Lists connections total.|Bearer
|`/connections`|POST|:x:|Body with `user_id`.|Increase the number of connections.|Bearer
|`/classes`|GET|:heavy_check_mark:|`week_day`, `subject`, `time`, `page` query parameters.|Lists classes available.|Bearer
|`/classes/my-class`|GET|:x:| - |Return the logged in user's class.|Bearer
|`/classes`|POST|:x:|Body with class `subject`, `cost`, user `user_id`, `whatsapp`, `bio` and class schedule `schedules.week_day`, `schedules.from`, `schedules.to`.|Create new class availability.|Bearer
|`/users`|POST|:x:|Body with user `name`, `surname`, `email`, `password`, `avatar` (url), `whatsapp` and `bio`.|Creates a new user.|:x:
|`/users/:id`|GET|:x:|`id` of the user.|Return one user.|Bearer
|`/users/forgot_password`|POST|:x:|Body with `email`.|Send forgot password email.|:x:
|`/users/reset_password`|POST|:x:|Body with `password`, `password_confirmation` and `token`.|Change user's current password.|:x:
|`/favorites`|GET|:heavy_check_mark:|`page` query parameters.|Lists favorited proffys.|Bearer
|`/favorites`|POST|:x:|Body with `user_id` from user that intending to be favorite.|Set a proffy as favorite.|Bearer

### Requests
* `POST /sessions`

Request body:
```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

* `POST /connections`

Request body:
```json
{
  "user_id": 76988
}
```

* `POST /classes`

Request body:
```json
{
  "user_id": 76988,
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

* `POST /users`

Request body:
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "johndoe@example.com",
  "password": "123456",
  "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/1103.jpg",
  "whatsapp": "1125585262",
  "bio": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
}
```

* `POST /users/forgot_password`

Request body:
```json
{
  "email": "johndoe@example.com"
}
```

* `POST /users/reset_password`

Request body:
```json
{
  "password": "123456",
  "password_confirmation": "123456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpZCI6IjE4ZjZkNzYzLTQ1NWMtNDEwNC1iMmFlLWUwNzE2N2JhOTMwYyJ9.uqiIJHRc6wsNCBy3MVtO-hDWwvs_afIhv7adswrUas4"
}
```

* `POST /favorites`

Request body:
```json
{
  "user_id": 76988
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
