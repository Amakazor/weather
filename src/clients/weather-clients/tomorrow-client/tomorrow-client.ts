import {WeatherClient} from "../weather-client";
import {Forecast} from "../../../entities/forecast";
import {ForecastType} from "../../../utility/forecast-type";
import {Coordinates} from "../../../utility/coordinates";
import axios from "axios";
import {z} from "zod";

enum PrecipitationType {
  NA,
  Rain,
  Snow,
  FreezingRain,
  IcePellets
}

export class TomorrowClient extends WeatherClient {
  private static readonly url = "https://api.tomorrow.io/v4/timelines"
  private static readonly axiosInstance = axios.create({baseURL: TomorrowClient.url, timeout: 5000});

  private static readonly forecastSchema = z.object({
    startTime: z.string(),
    values: z.object({
      weatherCode: z.number(),

      temperature: z.number(),
      pressureSurfaceLevel: z.number(),
      humidity: z.number(),

      precipitationIntensity: z.number(),
      precipitationType: z.nativeEnum(PrecipitationType),
      cloudCover: z.number(),

      windSpeed: z.number(),
      windDirection: z.number(),
    })
  })


  private static readonly responseSchema = z.object({
    data: z.object({
      timelines: z.array(z.object({
        intervals: z.array(TomorrowClient.forecastSchema)
      })).min(1)
    })
  })

  private static readonly weatherConditions = new Map<number, string>([
    [0, "Unknown"],
    [1000, "Clear, Sunny"],
    [1100, "Mostly Clear"],
    [1101, "Partly Cloudy"],
    [1102, "Mostly Cloudy"],
    [1001, "Cloudy"],
    [2000, "Fog"],
    [2100, "Light Fog"],
    [4000, "Drizzle"],
    [4001, "Rain"],
    [4200, "Light Rain"],
    [4201, "Heavy Rain"],
    [5000, "Snow"],
    [5001, "Flurries"],
    [5100, "Light Snow"],
    [5101, "Heavy Snow"],
    [6000, "Freezing Drizzle"],
    [6001, "Freezing Rain"],
    [6200, "Light Freezing Rain"],
    [6201, "Heavy Freezing Rain"],
    [7000, "Ice Pellets"],
    [7101, "Heavy Ice Pellets"],
    [7102, "Light Ice Pellets"],
    [8000, "Thunderstorm"]
  ]);

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
    return await TomorrowClient.axiosInstance.get<ReturnType<typeof TomorrowClient.transformResponse>>("", {
      transformResponse: TomorrowClient.transformResponse,
      params: {
        location: `${location.latitude},${location.longitude}`,
        fields: "temperature,pressureSurfaceLevel,humidity,weatherCode,precipitationIntensity,precipitationType,visibility,windDirection,windSpeed,cloudCover",
        units: "metric",
        apikey: this.apiKey,
      }
    })
  }

  private static transformResponse = (response: any) => {
    const parsedResponse = TomorrowClient.responseSchema.parse(JSON.parse(response));

    const sortedData = parsedResponse.data.timelines[0].intervals.sort((a, b) => a.startTime.localeCompare(b.startTime));
    const currentDate = new Date().toISOString()

    return {
      current: TomorrowClient.createEntity(sortedData.find(datum => datum.startTime.localeCompare(currentDate) > 0) ?? sortedData[0]),
      hourly: sortedData.map(TomorrowClient.createEntity),
      daily: sortedData.filter(datum => new Date(datum.startTime).getHours() === 12).map(TomorrowClient.createEntity),
    }
  }

  private static createEntity = (data: z.infer<typeof TomorrowClient.forecastSchema>) =>
    Forecast.fromJSON({
      date: data.startTime,

      name: TomorrowClient.weatherConditions.get(data.values.weatherCode) ?? "Unknown",

      temperature: data.values.temperature,
      pressure: data.values.pressureSurfaceLevel,
      humidity: data.values.humidity,

      rainfall: data.values.precipitationType === PrecipitationType.Rain ? data.values.precipitationIntensity : 0,
      snowfall: data.values.precipitationType === PrecipitationType.Snow ? data.values.precipitationIntensity : 0,
      cloudCover: data.values.cloudCover,

      windDirection: data.values.windDirection,
      windSpeed: data.values.windSpeed,
    })
}