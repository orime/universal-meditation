import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useProgress, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// 用一个统一的宇宙场景组件替代之前分散的组件
import UnifiedCosmicScene from './UnifiedCosmicScene';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="font-orbitron text-golden">
        加载宇宙... {Math.round(progress)}%
      </div>
    </Html>
  );
}

// 摄像机控制组件，处理缩放过渡
function CameraController({ scale, userControl }) {
  const { camera } = useThree();
  const prevScale = useRef(scale);
  const cameraPositionRef = useRef(camera.position.clone());
  const animationRef = useRef(null);
  
  // 定义各个视角的摄像机位置，调整为更美观的视角
  const cameraPositions = {
    earth: { position: [0, 2, 12], target: [0, 0, 0] },
    solar: { position: [0, 40, 100], target: [0, 0, 0] },
    galaxy: { position: [0, 120, 280], target: [0, 0, 0] },
    universe: { position: [0, 350, 800], target: [0, 0, 0] }
  };
  
  // 保存用户手动调整后的摄像机位置
  useFrame(() => {
    // 如果没有动画在进行且用户控制模式开启，记录当前位置
    if (!animationRef.current && userControl) {
      cameraPositionRef.current = camera.position.clone();
    }
  });
  
  useEffect(() => {
    if (prevScale.current !== scale) {
      // 停止之前的动画（如果有）
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      
      // 平滑过渡到新的摄像机位置
      const newPosition = cameraPositions[scale].position;
      const newTarget = cameraPositions[scale].target;
      
      // 存储动画引用
      animationRef.current = gsap.to(camera.position, {
        x: newPosition[0],
        y: newPosition[1],
        z: newPosition[2],
        duration: 5, // 增加过渡时间，使体验更流畅
        ease: "power2.inOut",
        onUpdate: () => {
          // 更新控制器的目标位置
          camera.lookAt(newTarget[0], newTarget[1], newTarget[2]);
        },
        onComplete: () => {
          animationRef.current = null;
          // 更新保存的位置
          cameraPositionRef.current = camera.position.clone();
        }
      });
      
      prevScale.current = scale;
    }
  }, [scale, camera]);
  
  return null;
}

// 文案固定位置组件
function FixedTextPosition({ children }) {
  const { camera } = useThree();
  const groupRef = useRef();
  
  // 保持文案位置不变
  useFrame(() => {
    if (groupRef.current) {
      // 将组固定在相机前方
      groupRef.current.position.copy(camera.position);
      groupRef.current.rotation.copy(camera.rotation);
      // 向前移动一定距离，确保总是在视野中
      groupRef.current.translateZ(-10);
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
}

// 主场景组件
export default function CosmicScene({ scale = 'earth' }) {
  const [userControl, setUserControl] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // 控制切换
  const toggleUserControl = () => {
    setUserControl(!userControl);
  };
  
  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };
  
  return (
    <>
      {/* 控制按钮 */}
      {/* <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
        <button 
          onClick={toggleUserControl}
          className={`px-3 py-1 rounded-full font-orbitron text-xs ${
            userControl ? 'bg-golden text-space-dark' : 'bg-space-dark/40 text-golden border border-golden/40'
          }`}
        >
          {userControl ? '自动控制' : '手动控制'}
        </button>
        <button 
          onClick={toggleAutoRotate}
          className={`px-3 py-1 rounded-full font-orbitron text-xs ${
            autoRotate ? 'bg-golden text-space-dark' : 'bg-space-dark/40 text-golden border border-golden/40'
          }`}
        >
          {autoRotate ? '停止旋转' : '开始旋转'}
        </button>
      </div> */}
      
      <Canvas 
        camera={{ position: [0, 2, 12], fov: 45 }}
        dpr={[1, 2]} // 优化性能和清晰度
        gl={{ antialias: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* 背景星空 */}
          <Stars 
            radius={300} 
            depth={100} 
            count={5000} 
            factor={4} 
            fade 
            speed={1} 
          />
          
          {/* 统一的宇宙场景，包含所有尺度的元素 */}
          <UnifiedCosmicScene currentScale={scale} userControl={userControl} />
          
          {/* 摄像机过渡控制 */}
          <CameraController scale={scale} userControl={userControl} />
          
          {/* 轨道控制，允许用户旋转视角 */}
          <OrbitControls
            enableZoom={userControl}
            enablePan={userControl}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.2}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 6}
          />
          
          {/* 环境光照 */}
          <ambientLight intensity={0.5} />

          {/* 主要光源 */}
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          
          {/* 固定位置文本容器 - 这里可以添加需要保持固定位置的指导文本 */}
          <FixedTextPosition>
            {/* 这里可以放置需要在3D场景中固定位置的文本内容 */}
          </FixedTextPosition>
        </Suspense>
      </Canvas>
    </>
  );
}