import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiMonitor, FiAlertTriangle } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 20,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                opacity: Math.random() * 0.5 + 0.25,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
              <FiShield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Smart CCTV
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
              >
                AI-Powered Monitoring
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Advanced real-time incident detection system with multiple monitoring options
            and instant alert capabilities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/monitor')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
            >
              Start Monitoring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm rounded-xl text-xl font-semibold hover:bg-gray-700/50 transition-all duration-300"
            >
              View Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            className="text-4xl font-bold text-center mb-12"
          >
            Monitoring Options
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.2 }}
                className="text-center bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50"
              >
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: <FiMonitor className="w-8 h-8 text-indigo-400" />,
    title: "Live Webcam",
    description: "Real-time monitoring using your device's camera with instant incident detection"
  },
  {
    icon: <FiAlertTriangle className="w-8 h-8 text-purple-400" />,
    title: "Video Upload",
    description: "Analyze pre-recorded videos for incidents with detailed confidence scoring"
  },
  {
    icon: <FiShield className="w-8 h-8 text-blue-400" />,
    title: "YouTube Analysis",
    description: "Monitor YouTube streams and videos for potential security threats"
  }
];

const stats = [
  {
    value: "99.9%",
    label: "Detection Accuracy"
  },
  {
    value: "<1s",
    label: "Response Time"
  },
  {
    value: "24/7",
    label: "Continuous Monitoring"
  }
];

export default LandingPage;