import axios from 'axios';

// Fetch YouTube subtitles
export const fetchYouTubeSubtitles = async (videoId) => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);
    console.log('Subtitles fetched:', response.data);
    return response.data.items.map(item => item.snippet.text).join(' ');
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    throw error;
  }
};

// Summarize text using AI
export const summarizeText = async (text) => {
  try {
    const apiEndpoint = 'https://language.googleapis.com/v1/documents:analyzeEntities';
    const requestBody = {
      document: {
        content: text,
        type: 'PLAIN_TEXT',
      },
      encodingType: 'UTF8'
    };

    const response = await axios.post(apiEndpoint, requestBody, {
      params: {
        key: process.env.REACT_APP_GOOGLE_API_KEY
      }
    });

    const entities = response.data.entities;
    const summary = entities.map(entity => entity.name).join(', ');

    console.log('Summary generated:', summary);
    return summary;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw error;
  }
}; 