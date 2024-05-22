# Moves API

![group-pic](https://github.com/dartmouth-cs52-24s/project-api-moody-moves/assets/54900426/2ecee687-4d1f-45b6-86d6-98f3c042c8a5)

API backend code for our React Native app called Moves.

## Architecture

Libraries:
- mongoose
- express
- cors
- path
- morgan

Code organization:
src:
      controllers:
            create_controller.js
            join_controller.js
            result_controller.js
      models:
            create_model.js
            join_model.js
            result_model.js
      routes.js
      server.js

## API Routes

### GET /api/question
Get request for a question.
Send:
- user
- moveId

Receive:
- questionID
- prompt

### POST /api/question
POST request to submit an answer to a question.
Send:
- user
- moveId
- response
- questionID

Receive:
- creator
- questions
- users
- location
- radius
- status
(I think we should change the above to just be 200, no need to return entire move here)

### POST /api/create
Post request to create a new move. This function also initializes the responses, questions, status, users. This function also hits the joinCode table which matches shorter codes to the longer unique moveId's
Send:
- creator
- location
- radius

Receive:
- joinCode

### POST api/create/:code
This function allows users to join a move.
Send:
- joinCode
- user

Receive:
- creator
- questions
- users
- location
- radius
- status

## Setup

* build command:  `npm install && npm run build`
* run command:  `npm run prod`

## Deployment

Deploy to render as a web service and set up to a MongoDB cluster

On Render: [https://project-api-moody-moves.onrender.com/api](https://project-api-moody-moves.onrender.com/api)

## Authors

Jon Jafarnia, Harry Irwin, Cameron Keith, CJ Wheelan, Shaamil Karim

## Acknowledgments
