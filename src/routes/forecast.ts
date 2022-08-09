import {Router, Request, Response} from "express";
import {ForecastQueryParser} from "../utility/forecast-query-parser";
import {WeatherClientFactory} from "../clients/weather-clients/weather-client-factory";
import {RequestErrorHandler} from "../utility/request-error-handler";
import {Route} from "./route";

/**
 * @swagger
 * /forecast:
 *   get:
 *     tags:
 *       - Forecast
 *     summary: Fetch Weather Data
 *     parameters:
 *       - name: latitude
 *         in: query
 *         description: Latitude of queried location
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: query
 *         description: Longitude of queried location
 *         schema:
 *           type: number
 *       - name: source
 *         in: query
 *         description: Source of the weather data
 *         schema:
 *           type: string
 *           enum:
 *             - open-weather
 *             - visual-crossing
 *             - tomorrow
 *       - name: type
 *         in: query
 *         description: Range of data to be extracted
 *         schema:
 *           type: string
 *           enum: [current, daily, hourly]
 *     responses:
 *       500:
 *         description: Server error has occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: Unknown server error
 *       405:
 *         description: Query parameters are missing or are malformed
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "Request error: required query parameter 'longitude' is missing"
 *       200:
 *         description: Data fetched correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: 2021-06-20T11:40:39.937Z
 *                     description: Date as UTC string
 *                   name:
 *                     type: string
 *                     example: cloudy
 *                     description: Textual description of the weather
 *                   temperature:
 *                     type: number
 *                     example: 32
 *                     description: Temperature in centigrade
 *                   pressure:
 *                     type: number
 *                     example: 1002
 *                     description: Pressure in hPa
 *                   humidity:
 *                     type: number
 *                     example: 23
 *                     description: Humidity as percentage
 *                   rainfall:
 *                     type: number
 *                     example: 2
 *                     description: Rainfall in millimeters
 *                   snowfall:
 *                     type: number
 *                     example: 4
 *                     description: Rainfall in millimeters
 *                   cloudCover:
 *                     type: number
 *                     example: 20
 *                     description: Cloud cover as percentage
 *                   windDirection:
 *                     type: number
 *                     example: 350
 *                     description: Wind direction as angle with north being 0
 *                   windSpeed:
 *                     type: number
 *                     example: 20
 *                     description: Wind speed in meters per second
 *
 */
export class Forecast extends Route {
  private readonly _router;

  constructor() {
    super();

    this._router = Router()
    this._router.get('/', Forecast.handleGet)
  }

  get router() {
    return this._router;
  }

  private static handleGet = async (req: Request, res: Response) => {
    try {
      const query = ForecastQueryParser.parse(req.query);
      const client = WeatherClientFactory.createWeatherClient(query.source);
      const data = await client.getForecast(query, query.type)
      res.status(200).json(data);
    } catch (error: any) {
      const {
        code,
        errorMessages
      } = RequestErrorHandler.handleError(error, issue => ForecastQueryParser.isQueryParameter(issue.path.join("/")))

      res.status(code).json(errorMessages);
    }
    res.end()
  }
}