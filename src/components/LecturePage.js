import React, { useEffect, useContext, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, BookOpen } from 'lucide-react';
import useVideoProgress from '../hooks/useVideoProgress';
import { jsPDF } from 'jspdf';
import { fetchYouTubeSubtitles, summarizeText } from '../utils/aiUtils'; // Utility functions for fetching and summarizing

function LecturePage() {
  const { user } = useContext(UserContext);
  const { videoId, courseId } = useParams();
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
              // Store player reference
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
        // Fetch subtitles
        const subtitlesText = await fetchYouTubeSubtitles(videoId);

        // Summarize subtitles
        const summarizedText = await summarizeText(subtitlesText);
        setSummary(summarizedText);
      } catch (error) {
        console.error('Error fetching or summarizing subtitles:', error);
      } finally {
        setLoading(false);
      }
    };

    getSubtitlesAndSummarize();
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
              <Link 
                to={`/courses/${courseId}`}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
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
        {/* Optimized Video Player Container */}
        <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-6">
          <div className="relative w-full">
            {/* 16:9 aspect ratio maintained but max height limited */}
            <div className="relative pt-[56.25%] max-h-[calc(100vh-200px)]">
              <div id="player" className="absolute inset-0"></div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Practice Questions Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Practice Questions
              </h2>
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-6 text-center">
              <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-2">
                Coming Soon!
              </h3>
              <p className="text-sm sm:text-base text-blue-600">
                We're working on adding interactive practice questions for this lecture.
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>

        {/* Additional Mobile-optimized Features */}
        <div className="mt-6 space-y-4">
          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Lecture Notes
            </h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <h2>Summary</h2>
                <p>{summary}</p>
                <button onClick={downloadPDF} className="download-button">
                  Download as PDF
                </button>
              </div>
            )}
          </div>

          {/* Resources Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Additional Resources
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                Supplementary materials and resources will be available here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Footer */}
      <div className="mt-8 py-4 bg-gray-50 border-t">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; 2024 Learnity. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LecturePage;
