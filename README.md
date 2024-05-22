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

## Setup

* build command:  `npm install && npm run build`
* run command:  `npm run prod`

## Deployment

Deploy to render as a web service and set up to a MongoDB cluster

On Render: [https://project-api-moody-moves.onrender.com/api](https://project-api-moody-moves.onrender.com/api)

## Authors

Jon Jafarnia, Harry Irwin, Cameron Keith, CJ Wheelan, Shaamil Karim

## Acknowledgments
