import {ForecastType} from "../../utility/forecast-type";
import {Forecast} from "../../entities/forecast";
import {Coordinates} from "../../utility/coordinates";

export abstract class WeatherClient {
  constructor(protected apiKey: string) {}

  abstract getForecast(location: Coordinates, forecastType: ForecastType): Promise<Forecast | Forecast[]>
}