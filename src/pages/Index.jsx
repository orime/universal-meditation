import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeditationStore } from '../stores/meditation-store';
import SimpleCosmicBackground from '../components/cosmic/SimpleCosmicBackground';
import { Howl } from 'howler';

// 预加载音频文件
const preloadAudio = new Howl({
  src: ['/audio/充满希望的背景音乐.mp3'],
  preload: true,
  volume: 0,
  loop: false,
  html5: true,
  onload: () => console.log('音频预加载完成')
});

const Index = () => {
  const [worry, setWorry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUserWorry = useMeditationStore(state => state.setWorry);
  const startMeditation = useMeditationStore(state => state.startMeditation);

  // 页面加载时预加载音频
  useEffect(() => {
    preloadAudio.load();
    
    return () => {
      preloadAudio.unload();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 设置用户烦恼
    setUserWorry(worry);
    
    // 标记开始冥想
    startMeditation();
    
    // 如果音频已加载完成，直接导航到冥想页面
    if (preloadAudio.state() === 'loaded') {
      navigate('/meditation');
    } else {
      // 否则等待音频加载完成
      preloadAudio.once('load', () => {
        navigate('/meditation');
      });
      
      // 如果3秒后还未加载完成，也导航过去
      setTimeout(() => {
        if (preloadAudio.state() !== 'loaded') {
          console.log('音频加载超时，继续导航');
          navigate('/meditation');
        }
      }, 3000);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <SimpleCosmicBackground intensity={0.5} />
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-6 font-orbitron text-4xl font-bold text-stardust">
          宇宙冥想空间
        </h1>
        
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-8">
            <label htmlFor="worry" className="mb-2 block font-space-mono text-lg text-stardust">
              此刻最困扰你的是什么？
            </label>
            <input
              id="worry"
              type="text"
              value={worry}
              onChange={(e) => setWorry(e.target.value)}
              className="w-full rounded-lg bg-space-dark px-4 py-3 font-space-mono text-stardust placeholder-space-light outline-none ring-1 ring-space-light focus:ring-2 focus:ring-golden"
              placeholder="输入你的烦恼..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded-full ${isLoading ? 'bg-golden/70' : 'bg-golden'} px-8 py-3 font-orbitron text-lg font-bold text-space-dark transition-all ${!isLoading && 'hover:scale-105 hover:bg-golden-light'} relative`}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">开始宇宙之旅</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-space-dark border-t-transparent"></div>
                  <span className="ml-2">准备中...</span>
                </div>
              </>
            ) : (
              '开始宇宙之旅'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Index;