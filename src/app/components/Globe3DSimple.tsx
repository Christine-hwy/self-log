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
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (!globeEl.current) return;
    if (globeRef.current) return; // 防止重复初始化

    console.log('Initializing Globe...');

    try {
      const globe = Globe()(globeEl.current)
        .backgroundColor('rgba(0,0,0,0)')
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#a78bfa')
        .atmosphereAltitude(0.2);

      // 设置控制器
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.minDistance = 180;
      controls.maxDistance = 400;

      // 设置初始视角
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);

      globeRef.current = globe;

      console.log('Globe initialized successfully');

      // 处理窗口大小变化
      const handleResize = () => {
        if (globeEl.current && globe) {
          globe.width(globeEl.current.offsetWidth);
          globe.height(globeEl.current.offsetHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (globeRef.current) {
          try {
            globeRef.current._destructor();
          } catch (e) {
            console.error('Error destroying globe:', e);
          }
          globeRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing globe:', error);
    }
  }, []);

  // 更新记忆点
  useEffect(() => {
    if (!globeRef.current || memories.length === 0) return;

    console.log('Updating memories:', memories.length);

    try {
      const globe = globeRef.current;

      globe
        .pointsData(memories)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(() => '#c084fc')
        .pointAltitude(0.015)
        .pointRadius(0.5)
        .pointLabel((d: any) => {
          const photoCount = d.photos?.length || 0;
          const videoCount = d.videos?.length || 0;
          return `
            <div style="background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98)); padding: 20px; border-radius: 16px; color: white; font-family: 'Inter', sans-serif; backdrop-filter: blur(20px); border: 1px solid rgba(167,139,250,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.5); min-width: 280px;">
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${d.location}</div>
              <div style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">${d.date}</div>
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
          if (onMemoryClick) {
            const memory = memories.find(m => m.id === point.id);
            if (memory) {
              onMemoryClick(memory);
            }
          }
          globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1200);
        });

      // 地球点击事件
      if (onLocationClick) {
        globe.onGlobeClick((coords: { lat: number; lng: number }) => {
          onLocationClick(coords.lat, coords.lng);
        });
      }

      // 添加标签
      globe
        .labelsData(memories)
        .labelLat('lat')
        .labelLng('lng')
        .labelText('location')
        .labelSize(0)
        .labelColor(() => 'rgba(192, 132, 252, 0.9)')
        .labelResolution(2);

    } catch (error) {
      console.error('Error updating memories:', error);
    }
  }, [memories, onLocationClick, onMemoryClick]);

  return (
    <div
      ref={globeEl}
      className="w-full h-full"
      style={{
        cursor: 'grab',
        minHeight: '400px',
        position: 'relative'
      }}
    />
  );
}
