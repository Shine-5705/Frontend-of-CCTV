import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { FiUpload, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';

const VideoUploadMonitor = ({ onIncident }) => {
  const videoRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    const model = await blazeface.load();
    const video = videoRef.current;
    
    const checkFrame = async () => {
      if (video.paused || video.ended) {
        setIsAnalyzing(false);
        return;
      }

      try {
        const predictions = await model.estimateFaces(video, false);
        if (predictions.length > 1) {
          const confidence = predictions[0].probability[0];
          setConfidence(confidence);
          
          if (confidence > 0.8) {
            onIncident({
              type: 'fight',
              confidence,
              source: 'upload',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Frame analysis error:', error);
      }

      setProgress((video.currentTime / video.duration) * 100);
      requestAnimationFrame(checkFrame);
    };

    video.play();
    checkFrame();
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {!videoUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-600 hover:border-indigo-500/50 hover:bg-indigo-500/5'
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <motion.div
                animate={{ scale: isDragging ? 1.1 : 1 }}
                className="text-center p-6"
              >
                <FiUpload className="mx-auto text-4xl mb-4 text-indigo-400" />
                <p className="text-lg font-medium">Drag & drop your video here</p>
                <p className="text-sm text-gray-400 mt-2">or click to browse</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl overflow-hidden shadow-2xl"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full rounded-xl"
              controls={!isAnalyzing}
            />
            
            {confidence > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-sm ${
                  confidence > 0.8 ? 'bg-red-500/50' : 'bg-yellow-500/50'
                }`}
              >
                Confidence: {(confidence * 100).toFixed(1)}%
              </motion.div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
              <motion.div
                className="h-full bg-indigo-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {videoUrl && (
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setVideoUrl('');
              setIsAnalyzing(false);
              setConfidence(0);
              setProgress(0);
            }}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <FiRefreshCw />
            Upload New Video
          </motion.button>

          {!isAnalyzing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeVideo}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <FiPlay />
              Start Analysis
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnalyzing(false)}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <FiPause />
              Stop Analysis
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploadMonitor;