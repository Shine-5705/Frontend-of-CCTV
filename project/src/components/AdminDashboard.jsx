import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import useIncidentStore from '../store/incidentStore';
import { FiActivity, FiCamera, FiUpload, FiYoutube, FiAlertTriangle, FiPieChart, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = () => {
  const incidents = useIncidentStore((state) => state.incidents);
  const clearIncidents = useIncidentStore((state) => state.clearIncidents);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    bySource: {},
    averageConfidence: 0,
    recentTrend: 0
  });

  useEffect(() => {
    const filteredIncidents = incidents.filter(incident => 
      filter === 'all' || incident.source === filter
    );

    const bySource = incidents.reduce((acc, incident) => {
      acc[incident.source] = (acc[incident.source] || 0) + 1;
      return acc;
    }, {});

    const avgConfidence = incidents.length
      ? incidents.reduce((sum, inc) => sum + inc.confidence, 0) / incidents.length
      : 0;

    const last24h = incidents.filter(inc => 
      new Date(inc.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    const prev24h = incidents.filter(inc => 
      new Date(inc.timestamp) > new Date(Date.now() - 48 * 60 * 60 * 1000) &&
      new Date(inc.timestamp) <= new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    const trend = prev24h ? ((last24h - prev24h) / prev24h) * 100 : 0;

    setStats({
      total: filteredIncidents.length,
      bySource,
      averageConfidence: avgConfidence,
      recentTrend: trend
    });
  }, [incidents, filter]);

  const sourceIcon = {
    webcam: <FiCamera className="text-blue-400" />,
    upload: <FiUpload className="text-green-400" />,
    youtube: <FiYoutube className="text-red-400" />
  };

  return (
    <div className="min-h-screen pt-20 p-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={<FiAlertTriangle className="text-red-400" />}
            title="Total Incidents"
            value={stats.total}
          />
          <StatCard
            icon={<FiPieChart className="text-blue-400" />}
            title="Average Confidence"
            value={`${(stats.averageConfidence * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={<FiActivity className="text-green-400" />}
            title="Active Monitors"
            value={Object.keys(stats.bySource).length}
          />
          <StatCard
            icon={<FiTrendingUp className="text-purple-400" />}
            title="24h Trend"
            value={`${stats.recentTrend > 0 ? '+' : ''}${stats.recentTrend.toFixed(1)}%`}
            trend={stats.recentTrend}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700"
            >
              <option value="all">All Sources</option>
              <option value="webcam">Webcam</option>
              <option value="upload">Uploaded Videos</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearIncidents}
            className="px-4 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg backdrop-blur-sm transition-colors"
          >
            Clear History
          </motion.button>
        </div>

        {/* Incident List */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {incidents
              .filter(incident => filter === 'all' || incident.source === filter)
              .map((incident) => (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        {sourceIcon[incident.source]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Potential Fight Scene
                        </h3>
                        <p className="text-gray-400">
                          Source: {incident.source.charAt(0).toUpperCase() + incident.source.slice(1)}
                        </p>
                        <p className="text-gray-400">
                          Camera ID: {incident.cameraId || 'N/A'}
                        </p>
                        {incident.url && (
                          <a
                            href={incident.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            View Source
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full ${
                        incident.confidence > 0.8 
                          ? 'bg-red-500/50' 
                          : 'bg-yellow-500/50'
                      }`}>
                        {(incident.confidence * 100).toFixed(1)}% Confidence
                      </div>
                      <p className="text-gray-400 mt-2">
                        {format(new Date(incident.timestamp), 'PPpp')}
                      </p>
                    </div>
                  </div>
                </motion.div>
            ))}
          </AnimatePresence>

          {incidents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              No incidents reported
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-gray-700/50 rounded-lg">
        {icon}
      </div>
      <h3 className="text-gray-400">{title}</h3>
    </div>
    <div className="text-2xl font-bold">
      {value}
      {trend !== undefined && (
        <span className={`text-sm ml-2 ${
          trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
        }`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
        </span>
      )}
    </div>
  </motion.div>
);

export default AdminDashboard;