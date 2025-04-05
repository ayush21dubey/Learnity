import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useVideoProgress = (userId, courseId, videoId) => {
  const saveProgress = async (isComplete) => {
    if (!userId || !courseId || !videoId) return;

    try {
      // Only update progress when video is complete
      if (isComplete) {
        // Get course details
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (courseDoc.exists()) {
          const totalVideos = courseDoc.data().videos?.length || 0;
          
          // Get current progress
          const progressRef = doc(db, 'users', userId, 'courseProgress', courseId);
          const progressDoc = await getDoc(progressRef);
          
          // Get completed videos list
          const completedVideosRef = doc(db, 'users', userId, 'completedVideos', courseId);
          const completedVideosDoc = await getDoc(completedVideosRef);
          let completedVideos = completedVideosDoc.exists() ? completedVideosDoc.data().videos || [] : [];
          
          // Add video to completed list if not already there
          if (!completedVideos.includes(videoId)) {
            completedVideos.push(videoId);
            
            // Update completed videos list
            await setDoc(completedVideosRef, {
              videos: completedVideos,
              lastUpdated: new Date().toISOString()
            }, { merge: true });
            
            // Update course progress
            await setDoc(progressRef, {
              completedVideos: completedVideos.length,
              progress: (completedVideos.length / totalVideos) * 100,
              lastUpdated: new Date().toISOString()
            }, { merge: true });
          }
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return { saveProgress };
};

export default useVideoProgress; 