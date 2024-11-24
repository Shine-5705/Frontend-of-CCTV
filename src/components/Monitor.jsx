import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamMonitor from './monitors/WebcamMonitor';
import VideoUploadMonitor from './monitors/VideoUploadMonitor';
import YoutubeMonitor from './monitors/YoutubeMonitor';
import { FiCamera, FiUpload, FiYoutube, FiArrowLeft, FiAlertCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

const Monitor = () => {
  const [monitorType, setMonitorType] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState({ loaded: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📡 Fetching initial data...');
        const [
          featuresResponse,
          statusResponse,
          modelStatusResponse
        ] = await Promise.all([
          apiService.getFeatures(),
          apiService.getStatus(),
          apiService.getModelStatus()
        ]);

        setFeatures(featuresResponse.data);
        setModelStatus({
          loaded: modelStatusResponse.data.model_loaded
        });
        
        if (!statusResponse.data.models_loaded) {
          console.warn('⚠️ Models not loaded');
          toast.error('Models not loaded. Some features may be limited.');
        }

        console.log('✅ Initial data fetch complete', {
          features: featuresResponse.data,
          status: statusResponse.data,
          modelStatus: modelStatusResponse.data
        });
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
        setError('Failed to load model data');
        toast.error('Failed to load model data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadModel = async () => {
    try {
      console.log('🔄 Loading model...');
      setLoading(true);
      const response = await apiService.loadModel();
      
      if (response.data.model_loaded) {
        console.log('✅ Model loaded successfully');
        toast.success('Model loaded successfully');
        setModelStatus(prev => ({ ...prev, loaded: true }));
      } else {
        console.error('❌ Failed to load model:', response.data);
        toast.error('Failed to load model');
      }
    } catch (err) {
      console.error('❌ Error loading model:', err);
      toast.error('Error loading model');
    } finally {
      setLoading(false);
    }
  };

  const handleIncident = (incident) => {
    console.log('🚨 New incident detected:', incident);
    setIncidents(prev => [...prev, { ...incident, id: Date.now() }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FiLoader className="w-8 h-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center text-red-500">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadModel}
            className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg text-white"
          >
            Retry Loading Model
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 p-4 bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
      <div className="max-w-7xl mx-auto relative">
        {!modelStatus.loaded && (
          <div className="mb-6 p-4 bg-yellow-500/20 rounded-lg">
            <p className="text-yellow-300 flex items-center gap-2">
              <FiAlertCircle />
              Model not loaded. Some features may be limited.
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadModel}
                className="ml-4 px-4 py-1 bg-yellow-500/30 rounded-lg"
              >
                Load Model
              </motion.button>
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!monitorType ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-8 mt-8"
            >
              {features && Object.entries(features).map(([key, feature]) => (
                <MonitorOption
                  key={key}
                  title={feature.name}
                  icon={getFeatureIcon(key)}
                  description={feature.description}
                  capabilities={feature.capabilities}
                  onClick={() => {
                    console.log(`📺 Selecting monitor type: ${key}`);
                    setMonitorType(key);
                  }}
                  status={modelStatus.loaded ? feature.status : 'limited'}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMonitorType(null)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/30 rounded-lg backdrop-blur-sm"
              >
                <FiArrowLeft />
                <span>Back to Options</span>
              </motion.button>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  {monitorType === 'webcam' && (
                    <WebcamMonitor 
                      onIncident={handleIncident} 
                      modelLoaded={modelStatus.loaded}
                    />
                  )}
                  {monitorType === 'upload' && (
                    <VideoUploadMonitor 
                      onIncident={handleIncident}
                      modelLoaded={modelStatus.loaded}
                    />
                  )}
                  {monitorType === 'youtube' && (
                    <YoutubeMonitor 
                      onIncident={handleIncident}
                      modelLoaded={modelStatus.loaded}
                    />
                  )}
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <FiAlertCircle className="text-red-500" />
                    <span>Incident Log</span>
                  </h3>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {incidents.length === 0 ? (
                      <p className="text-gray-400">No incidents detected</p>
                    ) : (
                      incidents.map(incident => (
                        <motion.div
                          key={incident.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gray-700/50 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {incident.type || 'Potential Incident'}
                              </h4>
                              <p className="text-gray-400">
                                Source: {incident.source}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-sm ${
                              incident.confidence > 0.8 ? 'bg-red-500/50' : 'bg-yellow-500/50'
                            }`}>
                              {(incident.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MonitorOption = ({ title, icon, description, capabilities, onClick, status }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm p-8 rounded-xl cursor-pointer border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
  >
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="p-4 bg-indigo-500/20 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {capabilities.map((capability, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-indigo-500/20 rounded-full text-xs"
          >
            {capability}
          </span>
        ))}
      </div>
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'active' ? 'bg-green-500/20 text-green-400' : 
        status === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {status}
      </span>
    </div>
  </motion.div>
);

const getFeatureIcon = (type) => {
  switch (type) {
    case 'webcam':
      return <FiCamera className="text-4xl" />;
    case 'upload':
      return <FiUpload className="text-4xl" />;
    case 'youtube':
      return <FiYoutube className="text-4xl" />;
    default:
      return null;
  }
};

export default Monitor;