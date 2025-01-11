import React from 'react';
import { useParams } from 'react-router-dom';

function LecturePage() {
  const { videoId } = useParams();

  return (
    <div>
      <h2>Lecture Page</h2>
      <div>
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <p>AI-generated notes and questions will be displayed here.</p>
    </div>
  );
}

export default LecturePage;
