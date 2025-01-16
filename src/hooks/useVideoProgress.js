import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useVideoProgress = (userId, courseId, videoId) => {
  const [progress, setProgress] = useState(0);

  const saveProgress = async (isComplete, timestamp, duration) => {
    if (!userId || !courseId || !videoId) return;

    try {
      // Save video progress
      const videoProgressRef = doc(db, 'progress', `${userId}_${courseId}_${videoId}`);
      await setDoc(videoProgressRef, {
        userId,
        courseId,
        videoId,
        isComplete,
        timestamp,
        duration,
        progress: (timestamp / duration) * 100,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Update course progress
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (courseDoc.exists()) {
        const totalVideos = courseDoc.data().videos?.length || 0;
        const progressRef = doc(db, 'users', userId, 'courseProgress', courseId);
        const progressDoc = await getDoc(progressRef);
        
        let completedVideos = progressDoc.exists() ? progressDoc.data().completedVideos : 0;
        if (isComplete) {
          completedVideos += 1;
        }

        await setDoc(progressRef, {
          completedVideos,
          progress: (completedVideos / totalVideos) * 100,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return { progress, saveProgress };
}; 