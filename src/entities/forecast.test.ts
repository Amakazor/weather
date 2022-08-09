import {Forecast} from "./forecast";

describe("Forecast entity", () => {
  it("should content all data fields", () => {
    const forecast = Forecast.fromJSON({
      cloudCover: 1,
      date: "2011-10-05T14:48:00.000Z",
      humidity: 2,
      name: "cloudy",
      pressure: 2,
      rainfall: 2,
      snowfall: 2,
      temperature: 2,
      windDirection: 2,
      windSpeed: 2
    })

    expect(forecast.cloudCover).toEqual(1);
    expect(forecast.humidity).toEqual(2);
    expect(forecast.pressure).toEqual(2);
    expect(forecast.rainfall).toEqual(2);
    expect(forecast.snowfall).toEqual(2);
    expect(forecast.temperature).toEqual(2);
    expect(forecast.windSpeed).toEqual(2);
    expect(forecast.windDirection).toEqual(2);
  })

  it('should parse date correctly', () => {
    const forecast = Forecast.fromJSON({
      cloudCover: 1,
      date: "2011-10-05T14:48:00.000Z",
      humidity: 2,
      name: "cloudy",
      pressure: 2,
      rainfall: 2,
      snowfall: 2,
      temperature: 2,
      windDirection: 2,
      windSpeed: 2
    })

    expect(forecast.date.getTime()).toEqual(1317826080000);
  });
})