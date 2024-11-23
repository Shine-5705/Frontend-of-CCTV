import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const YoutubeMonitor = ({ onIncident }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const handleUrlChange = (event) => {
    const newUrl = event.target.value;
    setUrl(newUrl);
    setIsValid(ReactPlayer.canPlay(newUrl));
  };

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    const model = await blazeface.load();
    
    // Note: YouTube analysis would require additional setup
    // This is a simplified version that simulates analysis
    setInterval(() => {
      const mockConfidence = Math.random();
      setConfidence(mockConfidence);
      
      if (mockConfidence > 0.8) {
        onIncident({
          type: 'fight',
          confidence: mockConfidence,
          source: 'youtube',
          url,
        });
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter YouTube URL"
        className="w-full max-w-xl px-4 py-2 rounded-md bg-gray-800 mb-8"
      />

      {isValid && (
        <div className="relative">
          <ReactPlayer
            url={url}
            width="800px"
            height="450px"
            controls
          />
          
          {confidence > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute top-4 right-4 px-4 py-2 rounded-full ${
                confidence > 0.8 ? 'bg-red-600' : 'bg-yellow-600'
              }`}
            >
              Confidence: {(confidence * 100).toFixed(1)}%
            </motion.div>
          )}
        </div>
      )}

      {isValid && !isAnalyzing && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={analyzeVideo}
          className="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full font-semibold"
        >
          Analyze Video
        </motion.button>
      )}
    </div>
  );
};

export default YoutubeMonitor;