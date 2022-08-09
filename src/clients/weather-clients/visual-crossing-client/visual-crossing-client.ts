import {WeatherClient} from "../weather-client";
import {Forecast} from "../../../entities/forecast";
import {ForecastType} from "../../../utility/forecast-type";
import axios from "axios";
import {z} from "zod";
import {Coordinates} from "../../../utility/coordinates";

enum PrecipitationType {
  Rain = "rain",
  Snow = "snow",
  FreezingRain = "freezingrain",
  IcePellets = "ice"
}

export class VisualCrossingClient extends WeatherClient {
  private static readonly url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
  private static readonly axiosInstance = axios.create({baseURL: VisualCrossingClient.url, timeout: 5000});

  private static readonly forecastSchema = z.object({
    datetimeEpoch: z.number(),

    conditions: z.string(),

    temp: z.number(),
    pressure: z.number(),
    humidity: z.number(),

    precip: z.number(),
    preciptype: z.array(z.nativeEnum(PrecipitationType)).or(z.null()),
    cloudcover: z.number(),

    winddir: z.number(),
    windspeed: z.number(),
  })

  private static readonly responseSchema = z.object({
    days: z.array(VisualCrossingClient.forecastSchema.extend({
      hours: z.array(VisualCrossingClient.forecastSchema)
    })),
    currentConditions: VisualCrossingClient.forecastSchema
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
    return await VisualCrossingClient.axiosInstance.get<ReturnType<typeof VisualCrossingClient.transformResponse>>(`${location.latitude}, ${location.longitude}`, {
      transformResponse: VisualCrossingClient.transformResponse,
      params: {
        key: this.apiKey,
        unitGroup: "metric"
      }
    })
  }

  private static transformResponse = (response: any) => {
    const parsedResponse = VisualCrossingClient.responseSchema.parse(JSON.parse(response));

    return {
      current: VisualCrossingClient.createEntity(parsedResponse.currentConditions),
      daily: parsedResponse.days.map(VisualCrossingClient.createEntity),
      hourly: parsedResponse.days.reduce<Forecast[]>((days, day) =>
        [...days, ...day.hours.map(VisualCrossingClient.createEntity)], [])
    }
  }

  private static createEntity = (data: z.infer<typeof VisualCrossingClient.forecastSchema>) =>
    Forecast.fromJSON({
      date: new Date(data.datetimeEpoch * 1000).toISOString(),

      name: data.conditions,

      temperature: data.temp,
      pressure: data.pressure,
      humidity: data.humidity,

      rainfall: data.preciptype?.includes(PrecipitationType.Rain) ? data.precip : 0,
      snowfall: data.preciptype?.includes(PrecipitationType.Snow) ? data.precip : 0,
      cloudCover: data.cloudcover,

      windDirection: data.winddir,
      windSpeed: data.windspeed,
    })
}