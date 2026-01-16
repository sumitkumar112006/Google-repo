
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData } from "../types";

/**
 * Fetches real-time weather and air quality data for a given location in India.
 * Uses Gemini 3 Pro for advanced reasoning and Google Search grounding for up-to-the-minute accuracy.
 */
export const fetchWeatherData = async (location: string): Promise<WeatherData> => {
  // Initialize the AI client using the secure environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Retrieve absolute current, real-time weather and air quality analytics for ${location}, India.
    Include a detailed hourly forecast for the next 12 hours (e.g., "1 PM", "2 PM") and a daily forecast for the next 7 days.
    Source data from IMD (India Meteorological Dept), CPCB, and reputable live news.
  `;

  // Use gemini-3-pro-preview for complex reasoning and data extraction tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      // Define a strict schema for the weather data response to ensure valid JSON output
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING },
          temperature: { type: Type.NUMBER },
          humidity: { type: Type.NUMBER },
          windSpeed: { type: Type.NUMBER },
          visibility: { type: Type.NUMBER },
          uvIndex: { type: Type.NUMBER },
          pressure: { type: Type.NUMBER },
          condition: { type: Type.STRING },
          rainProbability: { type: Type.NUMBER },
          airDensity: { type: Type.NUMBER },
          aqi: { type: Type.NUMBER },
          pollution: {
            type: Type.OBJECT,
            properties: {
              pm25: { type: Type.NUMBER },
              pm10: { type: Type.NUMBER },
              no2: { type: Type.NUMBER },
              o3: { type: Type.NUMBER }
            },
            required: ["pm25", "pm10", "no2", "o3"]
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING }
              },
              required: ["day", "temp", "condition"]
            }
          },
          hourlyForecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                temp: { type: Type.NUMBER },
                condition: { type: Type.STRING }
              },
              required: ["time", "temp", "condition"]
            }
          },
          aiInsights: { type: Type.STRING }
        },
        required: [
          "city", "temperature", "humidity", "windSpeed", "visibility", 
          "uvIndex", "pressure", "condition", "rainProbability", 
          "airDensity", "aqi", "pollution", "forecast", "hourlyForecast", "aiInsights"
        ]
      }
    }
  });

  try {
    // Extract generated text content (no method call needed)
    const jsonStr = response.text || '{}';
    const data = JSON.parse(jsonStr);
    
    // Extract search grounding chunks for source attribution as per guidelines
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => {
      if (chunk.web) {
        return {
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri
        };
      }
      return null;
    }).filter((s: any) => s !== null) || [];

    return {
      ...data,
      sources
    };
  } catch (e) {
    console.error("API Fetch Failure:", e);
    throw new Error(`Cloud sync interrupted for ${location}. Atmospheric sensors unreachable.`);
  }
};
