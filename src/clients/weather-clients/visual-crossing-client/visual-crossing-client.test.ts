import {
  transformedCurrentData,
  transformedDailyData,
  transformedHourlyData,
  visualCrossingClientDataFixture,
  visualCrossingClientParsedData
} from "./visual-crossing-client.fixture";
import {VisualCrossingClient} from "./visual-crossing-client";
import {Forecast} from "../../../entities/forecast";
import MockAdapter from "axios-mock-adapter";
import {ForecastType} from "../../../utility/forecast-type";

describe("Visual crossing clients", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2022-08-09T22:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should parse response schema correctly", () => {
    // @ts-ignore
    const parsedResponse = VisualCrossingClient.responseSchema.parse(visualCrossingClientDataFixture);

    expect(parsedResponse).toEqual(visualCrossingClientParsedData)
  });

  it("should create forecast entity from data correctly", () => {
    // @ts-ignore
    const forecast = VisualCrossingClient.createEntity(visualCrossingClientParsedData.currentConditions)

    expect(forecast).toBeInstanceOf(Forecast);
    expect(forecast.toJSON()).toEqual(transformedCurrentData);
  })

  it("should transform response into current, daily and hourly components", () => {
    // @ts-ignore
    const data = VisualCrossingClient.transformResponse(JSON.stringify(visualCrossingClientDataFixture));

    expect(data.current.toJSON()).toEqual(transformedCurrentData)

    expect(data.daily.map(datum => datum.toJSON())).toEqual(transformedDailyData)

    expect(data.hourly.map(datum => datum.toJSON())).toEqual(transformedHourlyData)
  });

  it("should make a request with correct query parameters", () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(VisualCrossingClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(visualCrossingClientDataFixture))

    const data = new VisualCrossingClient("apikey").getForecast({latitude: 30, longitude: 20}, ForecastType.Current);

    expect(mockAdapter.history.get.length).toEqual(1);
    expect(mockAdapter.history.get[0].params).toEqual({
      key: "apikey",
      unitGroup: "metric"
    });
  })

  it("should fetch and return correct data", async () => {
    // @ts-ignore
    const mockAdapter = new MockAdapter(VisualCrossingClient.axiosInstance);
    mockAdapter.onGet(/./).reply(200, JSON.stringify(visualCrossingClientDataFixture))

    const data = await new VisualCrossingClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Current);
    const data1 = await new VisualCrossingClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Daily);
    const data2 = await new VisualCrossingClient("apikey").getForecast({
      latitude: 30,
      longitude: 20
    }, ForecastType.Hourly);

    expect(Array.isArray(data) ? data.map(datum => datum.toJSON()) : data.toJSON()).toEqual(transformedCurrentData)

    expect(Array.isArray(data1) ? data1.map(datum => datum.toJSON()) : data1.toJSON()).toEqual(transformedDailyData)

    expect(Array.isArray(data2) ? data2.map(datum => datum.toJSON()) : data2.toJSON()).toEqual(transformedHourlyData)
  })
})