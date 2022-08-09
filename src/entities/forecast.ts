export interface ForecastData {
  date: string;

  name: string;

  temperature: number
  pressure: number;
  humidity: number;

  rainfall: number;
  snowfall: number;
  cloudCover: number;

  windDirection: number;
  windSpeed: number;
}

export class Forecast {
  private readonly data: ForecastData;

  private constructor(data: ForecastData) {
    this.data = data;
  }

  static fromJSON = (data: ForecastData) => new Forecast(data);
  toJSON = () => {
    return ({...this.data, date: this.date.toISOString()});
  };

  get date() {
    return new Date(this.data.date);
  }

  get name() {
    return this.data.name
  }

  get temperature() {
    return this.data.temperature
  }

  get pressure() {
    return this.data.pressure
  }

  get humidity() {
    return this.data.humidity
  }

  get rainfall() {
    return this.data.rainfall
  }

  get snowfall() {
    return this.data.snowfall
  }

  get cloudCover() {
    return this.data.cloudCover
  }

  get windSpeed() {
    return this.data.windSpeed
  }

  get windDirection() {
    return this.data.windDirection
  }
}