
import { GoogleGenAI, Type } from "@google/genai";
import { WatchResult, SearchFilters } from "../types";

// Fixed: Initialize strictly using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a list of 6 movie or TV show titles that start with or are related to "${partialQuery}". Focus on popular and current titles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data.suggestions || [];
  } catch (error) {
    console.error("Suggestion error:", error);
    return [];
  }
}

export async function fetchWatchAvailability(
  query: string,
  locationInfo: string,
  filters: SearchFilters
): Promise<WatchResult> {
  const filterContext = `
    User Preferences:
    - Preferred Services: ${filters.services.length > 0 ? filters.services.join(', ') : 'Any'}
    - Target Genres: ${filters.genres.length > 0 ? filters.genres.join(', ') : 'Any'}
    - Release Year Range: ${filters.yearFrom || 'Any'} to ${filters.yearTo || 'Any'}
  `;

  const systemInstruction = `
    You are an expert entertainment concierge. Your goal is to find exactly where a user can watch a specific movie or TV show.
    
    Location context: ${locationInfo}
    ${filterContext}
    
    Priority:
    1. If the user specified "Preferred Services", prioritize finding availability on those platforms first.
    2. Check for Subscription services, Rental/Purchase options, and Cinema availability.
    3. Ensure the title matches the user's genre/year filters if provided.
    
    Provide your response in JSON format.
    Use Google Search to verify real-time availability and find direct watch links where possible.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Where can I watch "${query}" right now? Include platform availability, pricing/subscription info, and theater locations near ${locationInfo}.`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Correct title of the media" },
          year: { type: Type.STRING, description: "Release year" },
          overview: { type: Type.STRING, description: "Short summary" },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                service: { type: Type.STRING, description: "Service name" },
                type: { 
                  type: Type.STRING, 
                  description: "Type of access: subscription, rent, buy, or cinema" 
                },
                url: { type: Type.STRING, description: "Direct deep link to the title on that service if found" }
              },
              required: ["service", "type"]
            }
          }
        },
        required: ["title", "options"]
      }
    }
  });

  const text = response.text || "{}";
  const data = JSON.parse(text);

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || "Source",
      uri: chunk.web.uri
    }));

  return {
    ...data,
    sources,
    posterUrl: `https://picsum.photos/seed/${encodeURIComponent(data.title)}/400/600`
  };
}
