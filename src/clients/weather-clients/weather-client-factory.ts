import {WeatherProvider} from "../../utility/weather-provider";
import {OpenWeatherMapClient} from "./open-weather-map-client/open-weather-map-client";
import {TomorrowClient} from "./tomorrow-client/tomorrow-client";
import { VisualCrossingClient } from "./visual-crossing-client/visual-crossing-client";

export class WeatherClientFactory {
  static createWeatherClient(weatherProvider: WeatherProvider) {
    const apiKey = this.getApiKey(weatherProvider);
    if (!apiKey) throw new Error();

    switch (weatherProvider) {
      case WeatherProvider.OpenWeather:
        return new OpenWeatherMapClient(apiKey);
      case WeatherProvider.Tomorrow:
        return new TomorrowClient(apiKey);
      case WeatherProvider.VisualCrossing:
        return new VisualCrossingClient(apiKey);
    }
  }

  private static getApiKey(weatherProvider: WeatherProvider) {
    switch (weatherProvider) {
      case WeatherProvider.OpenWeather:
        return process.env.OPEN_WEATHER_KEY;
      case WeatherProvider.Tomorrow:
        return process.env.TOMMORROW_KEY;
      case WeatherProvider.VisualCrossing:
        return process.env.VISUAL_CROSSING_KEY;
    }
  }
}