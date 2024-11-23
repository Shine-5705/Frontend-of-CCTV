import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamMonitor from './monitors/WebcamMonitor';
import VideoUploadMonitor from './monitors/VideoUploadMonitor';
import YoutubeMonitor from './monitors/YoutubeMonitor';
import { FiCamera, FiUpload, FiYoutube, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const Monitor = () => {
  const [monitorType, setMonitorType] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const handleIncident = (incident) => {
    setIncidents(prev => [...prev, { ...incident, id: Date.now() }]);
  };

  return (
    <div className="min-h-screen pt-16 p-4 bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
      <div className="max-w-7xl mx-auto relative">
        <AnimatePresence mode="wait">
          {!monitorType ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-8 mt-8"
            >
              <MonitorOption
                title="Live Webcam"
                icon={<FiCamera className="text-4xl" />}
                description="Real-time monitoring using your device's camera"
                onClick={() => setMonitorType('webcam')}
              />
              <MonitorOption
                title="Upload Video"
                icon={<FiUpload className="text-4xl" />}
                description="Analyze pre-recorded videos for incidents"
                onClick={() => setMonitorType('upload')}
              />
              <MonitorOption
                title="YouTube Stream"
                icon={<FiYoutube className="text-4xl" />}
                description="Monitor YouTube streams and videos"
                onClick={() => setMonitorType('youtube')}
              />
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
                  {monitorType === 'webcam' && <WebcamMonitor onIncident={handleIncident} />}
                  {monitorType === 'upload' && <VideoUploadMonitor onIncident={handleIncident} />}
                  {monitorType === 'youtube' && <YoutubeMonitor onIncident={handleIncident} />}
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
                              <h4 className="font-medium">Potential Fight Scene</h4>
                              <p className="text-sm text-gray-400">
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

const MonitorOption = ({ title, icon, description, onClick }) => (
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
    </div>
  </motion.div>
);

export default Monitor;