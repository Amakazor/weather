
import {Forecast} from "../../../entities/forecast";
import MockAdapter from "axios-mock-adapter";
import {ForecastType} from "../../../utility/forecast-type";
import {
  openWeatherMapClientDataFixture,
  openWeatherMapClientParsedData, transformedCurrentData, transformedDailyData,
   transformedHourlyData
} from "./open-weather-map-client.fixture";
import {OpenWeatherMapClient} from "./open-weather-map-client";

describe("Open Weather Map client", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2022-08-09T22:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should parse response schema correctly", () => {
    // @ts-ignore
    const parsedResponse = OpenWeatherMapClient.responseSchema.parse(openWeatherMapClientDataFixture);

    expect(parsedResponse).toEqual(openWeatherMapClientParsedData)
  });

  it("should create forecast entity from data correctly", () => {
    // @ts-ignore
    const forecast = OpenWeatherMapClient.createEntity(OpenWeatherMapClient.normalizeResponseShape(openWeatherMapClientParsedData.current))

    expect(forecast).toBeInstanceOf(Forecast);
    expect(forecast.toJSON()).toEqual(transformedCurrentData);
  })

  it("should transform response into current, daily and hourly components", () => {
    // @ts-ignore
    const data = OpenWeatherMapClient.transformResponse(JSON.stringify(openWeatherMapClientDataFixture));

    expect(data.current.toJSON()).toEqual(transformedCurrentData)

    expect(data.daily.map(datum => datum.toJSON())).toEqual(transformedDailyData)

    expect(data.hourly.map(datum => datum.toJSON())).toEqual(transformedHourlyData)
  });

  it("should make a request with correct query parameters", () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(OpenWeatherMapClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(openWeatherMapClientDataFixture))

    const data = new OpenWeatherMapClient("apikey").getForecast({latitude: 30, longitude: 20}, ForecastType.Current);

    expect(mockAdapter.history.get.length).toEqual(1);
    expect(mockAdapter.history.get[0].params).toEqual({
      "appid": "apikey",
      "exclude": "minutely",
      "lat": 30,
      "lon": 20,
      "units": "metric"
    });
  })

  it("should fetch and return correct data", async () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(OpenWeatherMapClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(openWeatherMapClientDataFixture))

    const data = await new OpenWeatherMapClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Current);
    const data1 = await new OpenWeatherMapClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Daily);
    const data2 = await new OpenWeatherMapClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Hourly);

    expect(Array.isArray(data) ? data.map(datum => datum.toJSON()) : data.toJSON()).toEqual(transformedCurrentData)

    expect(Array.isArray(data1) ? data1.map(datum => datum.toJSON()) : data1.toJSON()).toEqual(transformedDailyData)

    expect(Array.isArray(data2) ? data2.map(datum => datum.toJSON()) : data2.toJSON()).toEqual(transformedHourlyData)
  })
})