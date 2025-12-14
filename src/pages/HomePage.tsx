import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { authState } = useAuth();
  const { username, role } = authState;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6 py-12">
      <motion.div
        className="flex items-center space-x-3 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <img
          src="/logo.jpeg"
          alt="Logo PT Berkah Bina Amanat"
          className="h-12 w-12 rounded-xl border border-gray-200 shadow-sm"
        />
        <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
          PT Berkah Bina Amanat
        </h2>
      </motion.div>

      <motion.div
        className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 max-w-xl w-full text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-center mb-4">
          <Sparkles className="text-orange-500 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Selamat Datang</h1>
        <p className="text-lg text-gray-600">
          Kamu login sebagai <span className="font-semibold text-gray-800">{username}</span>{' '}
          dengan peran <span className="font-semibold text-gray-800">{role}</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default HomePage;
