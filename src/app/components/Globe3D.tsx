import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { TravelMemory } from '../../data/site';

interface Globe3DProps {
  memories: TravelMemory[];
  onLocationClick?: (lat: number, lng: number) => void;
  onMemoryClick?: (memory: TravelMemory) => void;
}

export function Globe3D({ memories, onLocationClick, onMemoryClick }: Globe3DProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [altitude, setAltitude] = useState(2.5);

  useEffect(() => {
    if (!globeEl.current || globeInstance.current) return;

    // 创建 Globe
    const globe = Globe()
      (globeEl.current)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .atmosphereColor('#a78bfa')
      .atmosphereAltitude(0.2)
      .pointsData(memories)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#c084fc')
      .pointAltitude(0.015)
      .pointRadius(0.4)
      .pointsMerge(true)
      .pointLabel((d: any) => {
        const photoCount = d.photos?.length || 0;
        const videoCount = d.videos?.length || 0;
        return `
          <div style="background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98)); padding: 20px; border-radius: 16px; color: white; font-family: 'Inter', sans-serif; backdrop-filter: blur(20px); border: 1px solid rgba(167,139,250,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(167,139,250,0.1); min-width: 280px;">
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.02em;">${d.location}</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 4px; font-weight: 500;">${d.date}</div>
            ${d.description ? `<div style="font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 12px; line-height: 1.6; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">${d.description}</div>` : ''}
            ${photoCount > 0 || videoCount > 0 ? `
              <div style="display: flex; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: rgba(255,255,255,0.5);">
                ${photoCount > 0 ? `<span>📷 ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}</span>` : ''}
                ${videoCount > 0 ? `<span>🎥 ${videoCount} ${videoCount === 1 ? 'video' : 'videos'}</span>` : ''}
              </div>
            ` : ''}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.4); text-align: center;">
              Click to view details
            </div>
          </div>
        `;
      })
      .onPointClick((point: any) => {
        // 如果提供了onMemoryClick回调，调用它
        if (onMemoryClick) {
          const memory = memories.find(m => m.id === point.id);
          if (memory) {
            onMemoryClick(memory);
          }
        }
        // 同时缩放到该位置
        globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1200);
      })
      // 添加地址标签 - 动态显示
      .labelsData(memories)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('location')
      .labelSize((d: any) => {
        // 根据缩放级别动态调整标签大小
        return altitude < 2 ? 1.2 : 0;
      })
      .labelDotRadius(0.4)
      .labelColor(() => 'rgba(192, 132, 252, 0.9)')
      .labelResolution(3)
      .labelAltitude(0.01);

    // 自动旋转
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.25;
    globe.controls().enableZoom = true;
    globe.controls().enablePan = false;
    globe.controls().minDistance = 180;
    globe.controls().maxDistance = 400;

    // 设置初始视角
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

    // 添加环境光照
    const scene = globe.scene();
    scene.fog = null;

    globeInstance.current = globe;
    setIsLoaded(true);

    // 在加载完成后平滑过渡到正常视角
    setTimeout(() => {
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 2000);
    }, 500);

    // 处理窗口大小变化
    const handleResize = () => {
      if (globeEl.current) {
        globe
          .width(globeEl.current.offsetWidth)
          .height(globeEl.current.offsetHeight);
      }
    };

    // 监听缩放变化以更新标签显示
    const controls = globe.controls();
    controls.addEventListener('change', () => {
      const pov = globe.pointOfView();
      if (pov && pov.altitude !== undefined) {
        setAltitude(pov.altitude);
      }
    });

    window.addEventListener('resize', handleResize);

    // 点击地球添加新位置
    if (onLocationClick) {
      globe.onGlobeClick((coords: { lat: number; lng: number }) => {
        onLocationClick(coords.lat, coords.lng);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeInstance.current) {
        globeInstance.current._destructor();
        globeInstance.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新点位数据和标签
  useEffect(() => {
    if (globeInstance.current && isLoaded) {
      globeInstance.current.pointsData(memories);
      globeInstance.current.labelsData(memories);

      // 更新标签大小
      globeInstance.current.labelSize((d: any) => {
        return altitude < 2 ? 1.2 : 0;
      });
    }
  }, [memories, isLoaded, altitude]);

  return (
    <div
      ref={globeEl}
      className="w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
}
