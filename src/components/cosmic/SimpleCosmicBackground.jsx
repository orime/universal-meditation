import { useEffect, useState } from 'react';

export default function SimpleCosmicBackground({ intensity = 1 }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // 生成随机星星位置
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 3 + 2, // 2-5秒的闪烁周期
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900 to-violet-950" />
      
      {/* 星星 */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity * intensity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      
      {/* 光晕效果 */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-golden/10 via-transparent to-transparent"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255, 215, 0, ${0.1 * intensity}), transparent 50%)`,
        }}
      />
    </div>
  );
} 