import { useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useVideoProgress = (userId, courseId, videoId, setProgress) => {
  useEffect(() => {
    if (!userId || !courseId || !videoId) return;

    let progressInterval;
    let player;

    const updateProgressUI = (percent) => {
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progress');
      
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }
      if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
      }
      if (setProgress) {
        setProgress(percent);
      }
    };

    const saveVideoProgress = async (isComplete, timestamp, duration) => {
      try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${videoId}`);
        const progress = (timestamp / duration) * 100;
        
        await setDoc(progressRef, {
          userId,
          courseId,
          videoId,
          isComplete,
          timestamp,
          duration,
          progress,
          lastUpdated: new Date().toISOString()
        }, { merge: true });

        updateProgressUI(progress);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    const loadSavedProgress = async () => {
      try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${videoId}`);
        const progressDoc = await getDoc(progressRef);
        if (progressDoc.exists()) {
          const data = progressDoc.data();
          updateProgressUI(data.progress || 0);
          return data;
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
      return null;
    };

    const initializePlayer = () => {
      player = new window.YT.Player('player', {
        videoId,
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: async (event) => {
            const savedProgress = await loadSavedProgress();
            if (savedProgress?.timestamp) {
              event.target.seekTo(savedProgress.timestamp);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              const duration = player.getDuration();
              saveVideoProgress(true, duration, duration);
              clearInterval(progressInterval);
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              progressInterval = setInterval(() => {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                saveVideoProgress(false, currentTime, duration);
              }, 5000);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              clearInterval(progressInterval);
              const currentTime = player.getCurrentTime();
              const duration = player.getDuration();
              saveVideoProgress(false, currentTime, duration);
            }
          }
        }
      });
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

    // Load initial progress
    loadSavedProgress();

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [userId, courseId, videoId, setProgress]);
}; 