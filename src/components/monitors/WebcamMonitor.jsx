import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { startVideoStream } from '../../utils/videoProcessing';
import { FiVideo, FiVideoOff } from 'react-icons/fi';

const WebcamMonitor = ({ onIncident, modelLoaded }) => {
  const webcamRef = useRef(null);
  const streamInterval = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);

  const handleStreamResult = useCallback((result) => {
    if (result.predicted_class === 1) {
      setConfidence(result.confidence);
      
      if (result.confidence > 0.4) {
        onIncident({
          type: 'fight',
          confidence: result.confidence,
          source: 'webcam',
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [onIncident]);

  const startDetection = useCallback(() => {
    if (!modelLoaded) {
      setError('Model not loaded. Please wait.');
      return;
    }

    try {
      const intervalId = startVideoStream(webcamRef, handleStreamResult);
      streamInterval.current = intervalId;
      setIsDetecting(true);
      setError(null);
    } catch (err) {
      setError('Failed to start detection');
      console.error('Detection error:', err);
    }
  }, [modelLoaded, handleStreamResult]);

  const stopDetection = useCallback(() => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
      streamInterval.current = null;
    }
    setIsDetecting(false);
    setConfidence(0);
  }, []);

  useEffect(() => {
    return () => {
      if (streamInterval.current) {
        clearInterval(streamInterval.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-full max-w-3xl">
        <Webcam
          ref={webcamRef}
          className="rounded-xl shadow-2xl w-full"
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user"
          }}
        />
        
        {confidence > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-sm ${
              confidence > 0.8 
                ? 'bg-red-500/50 border border-red-400' 
                : 'bg-yellow-500/50 border border-yellow-400'
            }`}
          >
            Confidence: {(confidence * 100).toFixed(1)}%
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 px-4 py-2 rounded-full bg-red-500/50 border border-red-400 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isDetecting ? stopDetection : startDetection}
        disabled={!modelLoaded}
        className={`
          px-6 py-3 rounded-xl font-semibold
          flex items-center gap-2 transition-colors
          ${isDetecting 
            ? 'bg-red-600 hover:bg-red-700' 
            : modelLoaded 
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-600 cursor-not-allowed'
          }
        `}
      >
        {isDetecting ? (
          <>
            <FiVideoOff className="w-5 h-5" />
            Stop Detection
          </>
        ) : (
          <>
            <FiVideo className="w-5 h-5" />
            Start Detection
          </>
        )}
      </motion.button>

      {!modelLoaded && (
        <p className="text-yellow-400 text-sm">
          Please wait for the model to load before starting detection.
        </p>
      )}
    </div>
  );
};

export default WebcamMonitor;