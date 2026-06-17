import { motion } from 'framer-motion';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center"
      >
        <h1 className="text-3xl font-black text-white mb-4">{title}</h1>
        <p className="text-slate-400 font-medium">This module is currently under construction.</p>
      </motion.div>
    </div>
  );
}
