import {z} from "zod";
import {WeatherProvider} from "./weather-provider";
import {ForecastType} from "./forecast-type";

export class ForecastQueryParser {
  private static forecastQuerySchema = z.object({
    latitude: z.string().transform(string => parseFloat(string)),
    longitude: z.string().transform(string => parseFloat(string)),
    source: z.nativeEnum(WeatherProvider),
    type: z.nativeEnum(ForecastType)
  })

  static parse = (query: any):z.infer<typeof ForecastQueryParser.forecastQuerySchema> => ForecastQueryParser.forecastQuerySchema.parse(query);

  static isQueryParameter = (parameter: string) => ["latitude", "longitude", "source", "type"].includes(parameter);
}