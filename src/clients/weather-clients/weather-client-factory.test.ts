import {WeatherClientFactory} from "./weather-client-factory";
import {WeatherProvider} from "../../utility/weather-provider";
import {OpenWeatherMapClient} from "./open-weather-map-client/open-weather-map-client";
import {VisualCrossingClient} from "./visual-crossing-client/visual-crossing-client";
import {TomorrowClient} from "./tomorrow-client/tomorrow-client";
import {config} from "dotenv";

describe("Weather client factory", () => {

  it('should throw if no api key is provided', () => {
    expect(() => {WeatherClientFactory.createWeatherClient(WeatherProvider.OpenWeather)}).toThrow();
  })

  it('should create correct weather client', () => {
    config({path: "test.env"})

    const client = WeatherClientFactory.createWeatherClient(WeatherProvider.OpenWeather);
    const client2 = WeatherClientFactory.createWeatherClient(WeatherProvider.VisualCrossing);
    const client3 = WeatherClientFactory.createWeatherClient(WeatherProvider.Tomorrow);

    expect(client).toBeInstanceOf(OpenWeatherMapClient);
    expect(client2).toBeInstanceOf(VisualCrossingClient);
    expect(client3).toBeInstanceOf(TomorrowClient);
  });
})