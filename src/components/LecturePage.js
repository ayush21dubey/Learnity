import React, { useEffect, useContext, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, BookOpen, Download } from 'lucide-react';
import useVideoProgress from '../hooks/useVideoProgress';
import { jsPDF } from 'jspdf';
import { fetchYouTubeSubtitles, summarizeText } from '../utils/aiUtils'; // Utility functions for fetching and summarizing

function LecturePage() {
  const { user } = useContext(UserContext);
  const { videoId, courseId } = useParams();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const { saveProgress } = useVideoProgress(user?.uid, courseId, videoId);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseId) {
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourseTitle(courseDoc.data().title);
          const videos = courseDoc.data().videos || [];
          const currentVideo = videos.find(v => v.snippet.resourceId.videoId === videoId);
          if (currentVideo) {
            setVideoTitle(currentVideo.snippet.title);
          }
        }
      }
    };
    fetchCourseDetails();
  }, [courseId, videoId]);

  useEffect(() => {
    // Clear any existing interval when video changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const handlePlayerStateChange = (event) => {
      try {
        const player = event.target;
        
        switch(event.data) {
          case window.YT.PlayerState.ENDED:
            saveProgress(true);
            break;
        }
      } catch (error) {
        console.error('Error in state change handler:', error);
      }
    };

    let player = null;
    
    const initializePlayer = () => {
      try {
        player = new window.YT.Player('player', {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            playsinline: 1
          },
          events: {
            onReady: (event) => {
              console.log('Player is ready');
              playerRef.current = event.target;
            },
            onStateChange: handlePlayerStateChange
          }
        });
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  useEffect(() => {
    const getSubtitlesAndSummarize = async () => {
      setLoading(true);
      try {
        console.log('Fetching subtitles for video:', videoId);
        const subtitlesText = await fetchYouTubeSubtitles(videoId);
        console.log('Subtitles fetched successfully:', subtitlesText.substring(0, 100) + '...');

        console.log('Starting summarization...');
        const summarizedText = await summarizeText(subtitlesText);
        console.log('Summarization completed:', summarizedText);
        setSummary(summarizedText);
      } catch (error) {
        console.error('Detailed error:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        setSummary('Error generating summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      getSubtitlesAndSummarize();
    }
  }, [videoId]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Lecture Notes', 10, 10);
    doc.text(summary, 10, 20);
    doc.save('lecture-notes.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="py-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="truncate">
                <div className="text-xs text-gray-600 truncate">{courseTitle}</div>
                <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                  {videoTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Video Player Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <div id="player" className="absolute top-0 left-0 w-full h-full"></div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Lecture Notes</h3>
            <button
              onClick={downloadPDF}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Download className="h-5 w-5 mr-1" />
              <span className="text-sm">Download PDF</span>
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </div>

        {/* Practice Questions Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Practice Questions</h2>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
            <h3 className="text-base font-medium text-blue-800 mb-2">Coming Soon!</h3>
            <p className="text-sm text-blue-600">
              We're working on adding interactive practice questions for this lecture.
              Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturePage;
