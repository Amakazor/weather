# Weather API application
## About
This is an app that can be used to create an API that can fetch weather data from multiple sources:
* Open Weather Map API,
* Tomorrow,
* Visual Crossing.

## Requirements
To run this application you need to have the following:
* Node.js v >= 14.17.3,
* Yarn >= 1.22.10.

<p style="font-size: 0.6em">This can also work with older versions probably, but I haven't actually tested it...</p>

The other thing you will need to have is `.env` file containing environment variables for all the APIS that this app uses. 
You should base this on the `.env.template` file.

## Actually running it
So, there are two ways to run this application.

First is running it in dev mode with `yarn dev` command. It will automatically regenerate whenever the code changes.

Second way is running it in production mode with `yarn build` to build it followed by `yarn start` to actually run it. Build app WILL NOT auto update on changes.

## API Documentation
When the app is spun up, you can access the documentation for it's API created with Swagger on `/api-docs` route.

## TL;DR
`/forecast` route will give you weather data when you provide it with some info (further described in swagger docs).