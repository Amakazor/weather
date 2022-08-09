
import {Forecast} from "../../../entities/forecast";
import MockAdapter from "axios-mock-adapter";
import {ForecastType} from "../../../utility/forecast-type";
import {TomorrowClient} from "./tomorrow-client";
import {
  tomorrowClientDataFixture,
  tomorrowClientParsedData,
  transformedCurrentData,
  transformedDailyData, transformedFirstData,
  transformedHourlyData
} from "./tomorrow-client.fixture";


describe("Tomorrow client", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2022-08-09T22:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should parse response schema correctly", () => {
    // @ts-ignore
    const parsedResponse = TomorrowClient.responseSchema.parse(tomorrowClientDataFixture);

    expect(parsedResponse).toEqual(tomorrowClientParsedData)
  });

  it("should create forecast entity from data correctly", () => {
    // @ts-ignore
    const forecast = TomorrowClient.createEntity(tomorrowClientParsedData.data.timelines[0].intervals[0])

    expect(forecast).toBeInstanceOf(Forecast);
    expect(forecast.toJSON()).toEqual(transformedFirstData);
  })

  it("should transform response into current, daily and hourly components", () => {
    // @ts-ignore
    const data = TomorrowClient.transformResponse(JSON.stringify(tomorrowClientDataFixture));

    expect(data.current.toJSON()).toEqual(transformedCurrentData)

    expect(data.daily.map(datum => datum.toJSON())).toEqual(transformedDailyData)

    expect(data.hourly.map(datum => datum.toJSON())).toEqual(transformedHourlyData)
  });

  it("should make a request with correct query parameters", () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(TomorrowClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(tomorrowClientDataFixture))

    const data = new TomorrowClient("apikey").getForecast({latitude: 30, longitude: 20}, ForecastType.Current);

    expect(mockAdapter.history.get.length).toEqual(1);
    expect(mockAdapter.history.get[0].params).toEqual({
      apikey: "apikey",
      fields: "temperature,pressureSurfaceLevel,humidity,weatherCode,precipitationIntensity,precipitationType,visibility,windDirection,windSpeed,cloudCover",
      location: "30,20",
      units: "metric"
    });
  })

  it("should fetch and return correct data", async () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(TomorrowClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(tomorrowClientDataFixture))

    const data = await new TomorrowClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Current);
    const data1 = await new TomorrowClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Daily);
    const data2 = await new TomorrowClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Hourly);

    expect(Array.isArray(data) ? data.map(datum => datum.toJSON()) : data.toJSON()).toEqual(transformedCurrentData)

    expect(Array.isArray(data1) ? data1.map(datum => datum.toJSON()) : data1.toJSON()).toEqual(transformedDailyData)

    expect(Array.isArray(data2) ? data2.map(datum => datum.toJSON()) : data2.toJSON()).toEqual(transformedHourlyData)
  })
})