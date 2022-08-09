import express from "express";
import {config} from "dotenv";
import morganBody from "morgan-body";
import {Forecast} from "./routes/forecast";
import swaggerJsdoc from "swagger-jsdoc";
import {serve, setup} from "swagger-ui-express";

config()

const app = express();
const port = 3000;


const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts']
});

morganBody(app);

app.use('/api-docs', serve, setup(swaggerSpec));
app.use("/forecast", new Forecast().router);

app.listen(port)