
export enum PanelType {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  pressure: number;
  condition: string;
  rainProbability: number;
  airDensity: number; // kg/m^3
  aqi: number;
  pollution: {
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  hourlyForecast: Array<{
    time: string;
    temp: number;
    condition: string;
  }>;
  aiInsights: string;
  // Added sources to comply with Gemini search grounding requirements
  sources?: Array<{ title: string; uri: string }>;
}

export interface SensorStation {
  id: string;
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  lastPing: string;
  battery: number;
}
