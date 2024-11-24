import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const WebcamMonitor = ({ onIncident, modelLoaded }) => {
  const webcamRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  useEffect(() => {
    let detectInterval;
    
    const loadModel = async () => {
      const model = await blazeface.load();
      
      detectInterval = setInterval(async () => {
        if (webcamRef.current) {
          const video = webcamRef.current.video;
          const predictions = await model.estimateFaces(video, false);
          
          if (predictions.length > 1) {
            const confidence = predictions[0].probability[0];
            setConfidence(confidence);
            
            if (confidence > 0.8) {
              onIncident({
                type: 'fight',
                confidence,
                source: 'webcam',
              });
            }
          }
        }
      }, 1000);
    };

    if (isDetecting) {
      loadModel();
    }

    return () => {
      if (detectInterval) {
        clearInterval(detectInterval);
      }
    };
  }, [isDetecting, onIncident]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          className="rounded-lg shadow-xl"
          style={{ width: '100%', maxWidth: '800px' }}
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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDetecting(!isDetecting)}
        className={`mt-8 px-6 py-3 rounded-full font-semibold ${
          isDetecting 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isDetecting ? 'Stop Detection' : 'Start Detection'}
      </motion.button>
    </div>
  );
};

export default WebcamMonitor;