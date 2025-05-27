import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicController({ isPlaying, onToggle }) {
  // 音乐波浪动画状态
  const [waves, setWaves] = useState([1, 2, 3, 4]);
  
  // 随机生成波浪高度，使动画更自然
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaves(waves.map(() => Math.random() * 0.5 + 0.5));
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, waves]);
  
  return (
    <motion.button
      onClick={onToggle}
      className="p-3 rounded-full bg-space-dark/40 backdrop-blur-md border border-golden/30 text-stardust hover:text-golden transition-all hover:scale-105 hover:border-golden/60 group"
      aria-label={isPlaying ? "暂停音乐" : "播放音乐"}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <div className="w-6 h-6 flex items-end justify-center space-x-[2px] relative">
        {/* 音乐图标 - 播放状态 */}
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div 
              className="absolute inset-0 flex items-end justify-center space-x-[2px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              key="playing"
            >
              {waves.map((height, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="w-[3px] bg-golden group-hover:bg-golden"
                  initial={{ height: '30%' }}
                  animate={{ 
                    height: `${height * 100}%`,
                    transition: {
                      repeat: Infinity,
                      repeatType: 'reverse',
                      duration: 0.8 + i * 0.2,
                      ease: 'easeInOut'
                    }
                  }}
                />
              ))}
            </motion.div>
          ) : (
            // 音乐图标 - 暂停状态
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 10 }}
              transition={{ duration: 0.2 }}
              key="paused"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-golden">
                <path d="M8 18V6l12 6-12 6z"></path>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 音乐播放状态文本提示 */}
      <motion.div
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-space-dark/70 backdrop-blur-md px-2 py-1 rounded text-xs font-orbitron text-golden whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isPlaying ? "暂停音乐" : "播放音乐"}
      </motion.div>
      
      {/* 音乐播放状态标签 - 辅助功能 */}
      <span className="sr-only">{isPlaying ? "暂停音乐" : "播放音乐"}</span>
      
      {/* 光晕效果 */}
      {isPlaying && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-golden/10 z-[-1]"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
} 