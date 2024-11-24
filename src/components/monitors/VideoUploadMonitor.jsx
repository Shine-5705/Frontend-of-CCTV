import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const VideoUploadMonitor = ({ onIncident, modelLoaded }) => {
  const videoRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictions, setPredictions] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setProgress(0);
      setPredictions([]);
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

  const startAnalysis = async () => {
    if (!videoRef.current || !modelLoaded) return;

    try {
      setIsAnalyzing(true);
      const file = await fetch(videoUrl).then(r => r.blob());
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Video = reader.result.split(',')[1];
        
        try {
          const response = await apiService.post('/api/analyze/video', {
            video: base64Video
          });

          if (response.data.status === 'success') {
            setPredictions(response.data.predictions);
            
            // Find highest confidence prediction
            const highestPrediction = response.data.predictions.reduce(
              (max, p) => p.fight_probability > max.fight_probability ? p : max,
              { fight_probability: 0 }
            );
            
            setConfidence(highestPrediction.fight_probability);
            
            if (highestPrediction.fight_probability > 0.4) {
              onIncident({
                type: 'fight',
                confidence: highestPrediction.fight_probability,
                source: 'upload',
                timestamp: new Date().toISOString(),
              });
            }
            
            toast.success('Analysis complete');
          } else {
            toast.error(response.data.message || 'Analysis failed');
          }
        } catch (error) {
          console.error('Error analyzing video:', error);
          toast.error('Failed to analyze video');
        }
        
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video');
      setIsAnalyzing(false);
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
  };

  // Update progress based on video playback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
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
              onTimeUpdate={handleTimeUpdate}
            />
            
            {confidence > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-sm ${
                  confidence > 0.8 ? 'bg-red-500/50' : 'bg-yellow-500/50'
                }`}
              >
                Max Confidence: {(confidence * 100).toFixed(1)}%
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
              stopAnalysis();
              setVideoUrl('');
              setConfidence(0);
              setProgress(0);
              setPredictions([]);
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
              onClick={startAnalysis}
              disabled={!modelLoaded}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                modelLoaded
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <FiPlay />
              Start Analysis
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopAnalysis}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <FiPause />
              Stop Analysis
            </motion.button>
          )}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Analysis Timeline</h3>
          <div className="space-y-2">
            {predictions.map((pred, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  pred.fight_probability > 0.4 ? 'bg-red-500/20' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>Timestamp: {pred.timestamp.toFixed(2)}s</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    pred.fight_probability > 0.4 ? 'bg-red-500/50' : 'bg-gray-600/50'
                  }`}>
                    {(pred.fight_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadMonitor;