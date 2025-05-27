import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GUIDES = {
  earth: [
    "深呼吸...感受你的身体与这颗蓝色星球相连",
    "地球是宇宙中一颗美丽的绿洲，孕育了无数生命",
    "想象你的烦恼像飘过地球的云朵，轻盈且短暂",
    "46亿年的历史长河中，我们只是短暂的星尘旅行者"
  ],
  solar: [
    "我们的视野扩展到太阳系，看到那燃烧的恒星了吗？",
    "八大行星在太阳的引力下运行，形成了一个宏大的天体舞蹈",
    "在这个尺度下，地球只是一个渺小的蓝点",
    "你的烦恼，在这个庞大的系统中，是否已经开始变得微不足道？"
  ],
  galaxy: [
    "让我们继续扩展视野，进入银河系的浩瀚",
    "这个旋臂结构中有超过3000亿颗恒星在闪烁",
    "它们中的每一个都可能拥有自己的行星系统和生命故事",
    "我们的太阳系，只是银河系中普通的一员",
    "在这样的尺度面前，个人的困扰不过是宇宙中的一粒微尘"
  ],
  universe: [
    "最后，让我们站在宇宙的视角俯瞰一切",
    "可观测宇宙包含约1500亿个像银河系一样的星系",
    "它们相互交织，形成了一个巨大的宇宙网络",
    "在这无垠的宇宙海洋中，我们的银河系不过是一个小小的漩涡",
    "但请记住，即使如此渺小，你依然是这个宇宙中独一无二的存在"
  ],
};

const WORRY_REFLECTIONS = {
  earth: "你的困扰就像地球上的天气系统，无论多么剧烈，最终都会平静下来",
  solar: "太阳系运行了46亿年，你现在面对的困难只是宇宙时间线上的一个微小点",
  galaxy: "银河系转一圈需要2.2亿年，而你的烦恼可能只会持续几天或几年",
  universe: "在宇宙的尺度下，我们所有的担忧都是如此短暂，为何不珍惜当下的平静？"
};

export default function MeditationGuide({ scale, worry }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showWorryReflection, setShowWorryReflection] = useState(false);

  useEffect(() => {
    setCurrentLine(0);
    setShowWorryReflection(false);
    
    const guides = GUIDES[scale];
    const totalDuration = guides.length * 4000; // 每行显示4秒
    
    // 逐行显示引导文字
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < guides.length - 1) {
          return prev + 1;
        } else {
          // 最后一行显示完后，显示烦恼反思
          setShowWorryReflection(true);
          return prev;
        }
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [scale]);

  const currentGuides = GUIDES[scale];
  const isLastLine = currentLine === currentGuides.length - 1;

  // 根据当前尺度选择渐变色
  const gradients = {
    earth: "from-blue-900/60 to-teal-900/60",
    solar: "from-orange-800/40 to-yellow-700/40",
    galaxy: "from-purple-900/60 to-blue-900/60",
    universe: "from-indigo-900/60 to-violet-900/60"
  };
  
  // 根据尺度调整背景模糊效果
  const blurEffects = {
    earth: "backdrop-blur-md",
    solar: "backdrop-blur-sm",
    galaxy: "backdrop-blur-md",
    universe: "backdrop-blur-md"
  };
  
  // 调整背景不透明度
  const bgOpacity = {
    earth: "bg-space-dark/70",
    solar: "bg-space-dark/30",
    galaxy: "bg-space-dark/60",
    universe: "bg-space-dark/70"
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 用户烦恼显示 */}
      {scale === 'earth' && worry && (
        <motion.div 
          className={`mb-6 p-4 rounded-lg bg-gradient-to-r ${gradients.earth} backdrop-blur-sm border border-golden/20`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-2 font-orbitron text-lg text-golden text-center">
            你此刻的困扰
          </h2>
          <p className="font-space-mono text-stardust text-center text-lg">
            "{worry}"
          </p>
        </motion.div>
      )}
      
      {/* 主要引导文字 */}
      <motion.div 
        className={`mb-6 p-6 rounded-lg ${bgOpacity[scale]} bg-gradient-to-r ${gradients[scale]} ${blurEffects[scale]} border border-space-light/30`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={`${scale}-${currentLine}`}
              className="font-space-mono text-stardust text-lg text-center leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {currentGuides[currentLine]}
            </motion.p>
          </AnimatePresence>
        </div>
        
        {/* 进度指示器 */}
        <div className="mt-4 flex justify-center space-x-2">
          {currentGuides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index <= currentLine 
                  ? 'bg-golden' 
                  : 'bg-space-light/50'
              }`}
              initial={{ width: 8 }}
              animate={{ 
                width: index === currentLine ? 20 : 8,
                scale: index === currentLine ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* 烦恼反思 */}
      {showWorryReflection && worry && (
        <motion.div 
          className={`p-4 rounded-lg bg-gradient-to-r from-golden/20 to-orange-500/20 ${scale === 'solar' ? 'backdrop-blur-sm' : 'backdrop-blur-md'} border border-golden/30`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-space-mono text-golden text-center text-base">
            {WORRY_REFLECTIONS[scale]}
          </p>
        </motion.div>
      )}
      
      {/* 尺度信息 */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="inline-flex items-center space-x-4 px-4 py-2 rounded-full bg-space-light/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-golden animate-pulse"></div>
            <span className="font-orbitron text-stardust text-sm">
              {scale === 'earth' && '地球视角'}
              {scale === 'solar' && '太阳系视角'}
              {scale === 'galaxy' && '银河系视角'}
              {scale === 'universe' && '宇宙视角'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}