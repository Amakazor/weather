import {z} from "zod";
import {WeatherProvider} from "./weather-provider";
import {ForecastType} from "./forecast-type";
import {ForecastQueryParser} from "./forecast-query-parser";

describe("Forecast query parser", () => {
  it('should parse query arguments', () => {
    const query = {
      latitude: "51",
      longitude: "2.6",
      source: WeatherProvider.VisualCrossing,
      type: ForecastType.Current
    }

    const jumbledQuery = JSON.parse(JSON.stringify(query));

    const parsedQuery = ForecastQueryParser.parse(jumbledQuery);

    expect(parsedQuery).toEqual({
      latitude: 51,
      longitude: 2.6,
      source: WeatherProvider.VisualCrossing,
      type: ForecastType.Current
    });
  })

  it('should tell if parameter belongs to the query', () => {
    expect(ForecastQueryParser.isQueryParameter("latitude")).toBe(true);
    expect(ForecastQueryParser.isQueryParameter("longitude")).toBe(true);
    expect(ForecastQueryParser.isQueryParameter("source")).toBe(true);
    expect(ForecastQueryParser.isQueryParameter("type")).toBe(true);

    expect(ForecastQueryParser.isQueryParameter("value")).toBe(false);
    expect(ForecastQueryParser.isQueryParameter("page")).toBe(false);
  });
})