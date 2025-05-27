import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeditationStore } from '../stores/meditation-store';
import CosmicScene from '../components/cosmic/CosmicScene';
import MeditationGuide from '../components/meditation/MeditationGuide';
import MusicController from '../components/meditation/MusicController';
import { Howl } from 'howler';

// 优化的时序设置
const SCALE_TIMINGS = {
  earth: 16000,    // 地球视角 16秒 (4行 x 4秒)
  solar: 16000,    // 太阳系视角 16秒
  galaxy: 20000,   // 银河系视角 20秒 (5行 x 4秒)
  universe: 20000, // 宇宙视角 20秒 (5行 x 4秒)
};

const FINAL_MESSAGES = [
  "在浩瀚宇宙面前，烦恼有没有减少一点？",
  "宇宙这么大，我们探索的还很少",
  "未来充满了无限可能",
  "不要被当下的困扰牵绊住前进的脚步",
  "你是宇宙中独一无二的存在"
];

export default function Meditation() {
  const navigate = useNavigate();
  const { worry, currentScale, setScale, reset } = useMeditationStore();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showFinalReflection, setShowFinalReflection] = useState(false);
  const [currentGuide, setCurrentGuide] = useState('earth');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // 初始化音频
  useEffect(() => {
    // 创建新的Howl实例
    audioRef.current = new Howl({
      src: ['/audio/充满希望的背景音乐.mp3'],
      loop: true,
      volume: 0.6,
      html5: true,
      preload: true,
      autoplay: false, // 不自动播放，等用户进入页面后手动触发
    });

    // 音频加载完成的回调
    audioRef.current.once('load', () => {
      console.log('音频加载完成');
    });

    // 组件卸载时清理音频资源
    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current.unload();
        audioRef.current = null;
      }
    };
  }, []);

  // 初始化第一阶段和播放音乐
  useEffect(() => {
    // 地球 -> 太阳系
    const earthTimer = setTimeout(() => {
      setScale('solar');
      setCurrentGuide('solar');
    }, SCALE_TIMINGS.earth);

    // 开启冥想旅程时自动播放音乐
    if (audioRef.current && !isPlaying) {
      try {
        audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('音频自动播放失败:', error);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
        setIsPlaying(false);
      }
      clearTimeout(earthTimer);
    };
  }, [setScale]);

  // 音乐播放状态监听
  useEffect(() => {
    if (!audioRef.current) return;
    
    const updatePlayingState = () => {
      setIsPlaying(audioRef.current.playing());
    };
    
    audioRef.current.on('play', updatePlayingState);
    audioRef.current.on('pause', updatePlayingState);
    audioRef.current.on('stop', updatePlayingState);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.off('play', updatePlayingState);
        audioRef.current.off('pause', updatePlayingState);
        audioRef.current.off('stop', updatePlayingState);
      }
    };
  }, []);

  // 太阳系 -> 银河系
  useEffect(() => {
    if (currentScale === 'solar') {
      const solarTimer = setTimeout(() => {
        setScale('galaxy');
        setCurrentGuide('galaxy');
      }, SCALE_TIMINGS.solar);
      
      return () => clearTimeout(solarTimer);
    }
  }, [currentScale, setScale]);

  // 银河系 -> 宇宙
  useEffect(() => {
    if (currentScale === 'galaxy') {
      const galaxyTimer = setTimeout(() => {
        setScale('universe');
        setCurrentGuide('universe');
      }, SCALE_TIMINGS.galaxy);
      
      return () => clearTimeout(galaxyTimer);
    }
  }, [currentScale, setScale]);

  // 宇宙 -> 最终反思
  useEffect(() => {
    if (currentScale === 'universe') {
      const universeTimer = setTimeout(() => {
        setShowFinalReflection(true);
        
        // 开始显示最终消息序列
        const messageInterval = setInterval(() => {
          setCurrentMessage(prev => {
            if (prev < FINAL_MESSAGES.length - 1) {
              return prev + 1;
            } else {
              clearInterval(messageInterval);
              setIsCompleted(true);
              
              // 3秒后返回首页
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.fade(audioRef.current.volume(), 0, 2000);
                  setTimeout(() => {
                    audioRef.current.stop();
                    reset();
                    navigate('/');
                  }, 2000);
                } else {
                  reset();
                  navigate('/');
                }
              }, 3000);
              
              return prev;
            }
          });
        }, 3000); // 每3秒切换一条消息
        
        return () => {
          clearInterval(messageInterval);
        };
      }, SCALE_TIMINGS.universe);
      
      return () => clearTimeout(universeTimer);
    }
  }, [currentScale, navigate, reset]);

  // 切换音乐播放状态
  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.playing()) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-space-dark">
      {/* 3D宇宙场景 */}
      <CosmicScene scale={currentScale} />
      
      {/* 引导界面 */}
      {!showFinalReflection && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-16">
          <MeditationGuide scale={currentGuide} worry={worry} />
        </div>
      )}
      
      {/* 最终反思阶段 */}
      {showFinalReflection && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center p-8">
            {/* 主要反思消息 */}
            <div 
              key={currentMessage}
              className="mb-8 animate-float-in"
            >
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-golden mb-4">
                {FINAL_MESSAGES[currentMessage]}
              </h1>
              
              {currentMessage === 0 && worry && (
                <p className="text-lg font-space-mono text-stardust/80">
                  回想一下你的困扰："{worry}"
                </p>
              )}
            </div>
            
            {/* 进度指示 */}
            <div className="flex justify-center space-x-3 mb-6">
              {FINAL_MESSAGES.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-full transition-all duration-500 ${
                    index <= currentMessage 
                      ? 'bg-golden scale-110' 
                      : 'bg-white/30 scale-100'
                  }`}
                />
              ))}
            </div>
            
            {/* 完成状态 */}
            {isCompleted && (
              <div className="mt-8 animate-fade-in">
                <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-golden/20 border border-golden/30">
                  <div className="w-2 h-2 rounded-full bg-golden animate-pulse"></div>
                  <span className="font-space-mono text-golden text-sm">
                    冥想结束，即将返回...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 音频控制器 */}
      <div className="absolute top-4 right-4 z-30">
        <MusicController isPlaying={isPlaying} onToggle={toggleMusic} />
      </div>
    </div>
  );
}