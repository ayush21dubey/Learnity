import axios from 'axios';

// Cache for storing Gemini responses
const geminiCache = new Map();
const RATE_LIMIT = 60; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
let requestTimestamps = [];

// Helper function to check rate limit
const checkRateLimit = () => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (requestTimestamps.length >= RATE_LIMIT) {
    const oldestRequest = requestTimestamps[0];
    const waitTime = RATE_LIMIT_WINDOW - (now - oldestRequest);
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
  }
  
  requestTimestamps.push(now);
};

// Fetch YouTube video details and description
export const fetchYouTubeSubtitles = async (videoId) => {
  try {
    console.log('Fetching subtitles for video:', videoId);
    
    // Validate API key
    if (!process.env.REACT_APP_GOOGLE_API_KEY) {
      throw new Error('Google API key is not configured. Please check your .env file.');
    }

    // Add retry logic for network issues
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const response = await axios.get(
          'https://www.googleapis.com/youtube/v3/videos',
          {
            params: {
              id: videoId,
              key: process.env.REACT_APP_GOOGLE_API_KEY,
              part: 'snippet'
            },
            timeout: 10000, // 10 second timeout
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.data.items || response.data.items.length === 0) {
          throw new Error('Video not found');
        }

        const videoDetails = response.data.items[0].snippet;
        const description = videoDetails.description;
        
        if (!description) {
          throw new Error('No description available for this video');
        }

        console.log('Video description fetched:', description.substring(0, 100) + '...');
        return description;
      } catch (error) {
        lastError = error;
        if (error.response) {
          // If we get a response with an error status, don't retry
          throw error;
        }
        retries--;
        if (retries > 0) {
          console.log(`Retrying... ${retries} attempts remaining`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }
    }

    // If we've exhausted all retries
    console.error('Error fetching video details after all retries:', lastError);
    if (lastError.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw lastError;
  } catch (error) {
    console.error('Error fetching video details:', error);
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid video ID format');
        case 403:
          throw new Error('YouTube API access forbidden. Please check your API key permissions.');
        case 404:
          throw new Error('Video not found');
        case 429:
          throw new Error('YouTube API quota exceeded. Please try again later.');
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error('YouTube API service error. Please try again later.');
        default:
          throw new Error(`YouTube API error: ${error.response.status}`);
      }
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }

    throw new Error('Failed to fetch video details. Please make sure the video exists and is accessible.');
  }
};

// Summarize text using Gemini
export const summarizeText = async (text) => {
  try {
    // Validate API key
    if (!process.env.REACT_APP_GOOGLE_API_KEY) {
      throw new Error('Google API key is not configured. Please check your .env file.');
    }

    // Check rate limit
    checkRateLimit();

    // Check cache first
    const cacheKey = `summary_${text.trim().toLowerCase()}`;
    if (geminiCache.has(cacheKey)) {
      const cachedData = geminiCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < 3600000) { // Cache valid for 1 hour
        console.log('Returning cached summary');
        return cachedData.response;
      }
    }

    const prompt = `Please provide a concise summary of the following text in 2-3 sentences:\n\n${text}`;
    
    console.log('Making Gemini API request...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
      {
        model: 'gemini-pro',
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

    console.log('Gemini API Response:', response.data);

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response from Gemini API');
    }

    const summary = response.data.candidates[0].content.parts[0].text;
    
    // Cache the response
    geminiCache.set(cacheKey, {
      response: summary,
      timestamp: Date.now()
    });

    // Limit cache size
    if (geminiCache.size > 100) {
      const oldestKey = geminiCache.keys().next().value;
      geminiCache.delete(oldestKey);
    }

    console.log('Summary generated with Gemini:', summary);
    return summary;
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      } : 'No config'
    });

    if (error.message.includes('Rate limit exceeded')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid request to Gemini API. Please check your input.');
        case 401:
          throw new Error('Unauthorized. Please check your API key.');
        case 403:
          throw new Error('Access forbidden. Please check your API key and permissions.');
        case 404:
          throw new Error('Gemini API endpoint not found. Please check if the API is enabled.');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error('Gemini API service error. Please try again later.');
        default:
          throw new Error(`Gemini API error: ${error.response.status}`);
      }
    }
    
    throw new Error('Failed to connect to Gemini API. Please check your internet connection and try again.');
  }
};

// General purpose Gemini API integration
export const generateWithGemini = async (prompt) => {
  try {
    // Validate API key
    if (!process.env.REACT_APP_GOOGLE_API_KEY) {
      throw new Error('Google API key is not configured. Please check your .env file.');
    }

    // Check rate limit
    checkRateLimit();

    // Check cache first
    const cacheKey = prompt.trim().toLowerCase();
    if (geminiCache.has(cacheKey)) {
      const cachedData = geminiCache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < 3600000) { // Cache valid for 1 hour
        console.log('Returning cached Gemini response');
        return cachedData.response;
      }
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
      {
        model: 'gemini-pro',
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

    console.log('Gemini API Response:', response.data);

    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Cache the response
    geminiCache.set(cacheKey, {
      response: generatedText,
      timestamp: Date.now()
    });

    // Limit cache size
    if (geminiCache.size > 100) {
      const oldestKey = geminiCache.keys().next().value;
      geminiCache.delete(oldestKey);
    }

    console.log('Gemini response:', generatedText);
    return generatedText;
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      } : 'No config'
    });

    if (error.message.includes('Rate limit exceeded')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          throw new Error('Invalid request to Gemini API. Please check your input.');
        case 401:
          throw new Error('Unauthorized. Please check your API key.');
        case 403:
          throw new Error('Access forbidden. Please check your API key and permissions.');
        case 404:
          throw new Error('Gemini API endpoint not found. Please check if the API is enabled.');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error('Gemini API service error. Please try again later.');
        default:
          throw new Error(`Gemini API error: ${error.response.status}`);
      }
    }
    
    throw new Error('Failed to connect to Gemini API. Please check your internet connection and try again.');
  }
}; 