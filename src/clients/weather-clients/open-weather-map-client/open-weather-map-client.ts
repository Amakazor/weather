import {WeatherClient} from "../weather-client";
import {Forecast} from "../../../entities/forecast";
import {ForecastType} from "../../../utility/forecast-type";
import {Coordinates} from "../../../utility/coordinates";
import axios from "axios";
import {z} from "zod";

export class OpenWeatherMapClient extends WeatherClient {
  private static readonly url = "https://api.openweathermap.org/data/3.0/onecall"
  private static readonly axiosInstance = axios.create({baseURL: OpenWeatherMapClient.url, timeout: 5000});

  private static readonly forecastSchema = z.object({
    dt: z.number(),

    weather: z.array(
      z.object({
        main: z.string(),
      }
    )),

    temp: z.object({
      day: z.number()
    }),
    pressure: z.number(),
    humidity: z.number(),

    rain: z.number().optional(),
    snow: z.number().optional(),
    clouds: z.number(),

    wind_deg: z.number(),
    wind_speed: z.number(),
  })

  private static readonly extendedForecastSchema = OpenWeatherMapClient.forecastSchema.extend({
    rain: z.object({
      "1h": z.number(),
    }).optional(),
    snow: z.object({
      "1h": z.number(),
    }).optional(),
    temp: z.number()
  })

  private static readonly responseSchema = z.object({
    current: OpenWeatherMapClient.extendedForecastSchema,
    daily: z.array(OpenWeatherMapClient.forecastSchema),
    hourly: z.array(OpenWeatherMapClient.extendedForecastSchema)
  })

  getForecast = async (location: Coordinates, forecastType: ForecastType) => {
    const data = (await this.fetchForecast(location)).data;

    switch (forecastType) {
      case ForecastType.Current:
        return data.current
      case ForecastType.Daily:
        return data.daily
      case ForecastType.Hourly:
        return data.hourly

    }
  };

  private fetchForecast = async (location: Coordinates) => {
    return await OpenWeatherMapClient.axiosInstance.get<ReturnType<typeof OpenWeatherMapClient.transformResponse>>("", {
      transformResponse: OpenWeatherMapClient.transformResponse,
      params: {
        exclude: "minutely",
        units: "metric",
        lat: location.latitude,
        lon: location.longitude,
        appid: this.apiKey,
      }
    })
  }

  private static transformResponse = (response: any) => {
    const parsedResponse = OpenWeatherMapClient.responseSchema.parse(JSON.parse(response));

    return {
      current: OpenWeatherMapClient.createEntity(OpenWeatherMapClient.normalizeResponseShape(parsedResponse.current)),
      hourly: parsedResponse.hourly.map(OpenWeatherMapClient.normalizeResponseShape).map(OpenWeatherMapClient.createEntity),
      daily: parsedResponse.daily.map(OpenWeatherMapClient.createEntity),
    }
  }

  private static normalizeResponseShape = (data: z.infer<typeof OpenWeatherMapClient.extendedForecastSchema>) => ({
    ...data,
    rain: data.rain?.["1h"] ?? 0,
    snow: data.snow?.["1h"] ?? 0,
    temp: {
      day: data.temp
    }
  })

  private static createEntity = (data: z.infer<typeof OpenWeatherMapClient.forecastSchema>) =>
    Forecast.fromJSON({
      date: new Date((data.dt * 1000)).toISOString(),

      name: data.weather[0].main,

      temperature: data.temp.day,
      pressure: data.pressure,
      humidity: data.humidity,

      rainfall: data.rain ?? 0,
      snowfall: data.snow ?? 0,
      cloudCover: data.clouds,

      windDirection: data.wind_deg,
      windSpeed: data.wind_speed,
    })
}