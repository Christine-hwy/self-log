import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import { TravelMemory } from '../../data/site';
import { worldLocations } from '../../data/worldLocations';

interface GlobeViewProps {
  memories: TravelMemory[];
  onLocationClick?: (lat: number, lng: number) => void;
  onMemoryClick?: (memory: TravelMemory) => void;
}

export function GlobeView({ memories, onLocationClick, onMemoryClick }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [altitude, setAltitude] = useState(2.2);

  useEffect(() => {
    if (!containerRef.current) {
      console.log('Container not ready');
      return;
    }

    if (globeRef.current) {
      console.log('Globe already exists');
      return;
    }

    console.log('Creating globe with', memories.length, 'memories');

    const myGlobe = Globe()(containerRef.current);

    myGlobe
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#a78bfa')
      .atmosphereAltitude(0.2)
      .width(containerRef.current.offsetWidth)
      .height(containerRef.current.offsetHeight);

    myGlobe.controls().autoRotate = true;
    myGlobe.controls().autoRotateSpeed = 0.3;

    myGlobe.pointOfView({ altitude: 2.2 });

    // 监听缩放变化
    const controls = myGlobe.controls();
    const updateAltitude = () => {
      const pov = myGlobe.pointOfView();
      if (pov && pov.altitude !== undefined) {
        setAltitude(pov.altitude);
      }
    };
    controls.addEventListener('change', updateAltitude);

    globeRef.current = myGlobe;

    // 窗口缩放处理
    const handleResize = () => {
      if (containerRef.current && globeRef.current) {
        globeRef.current.width(containerRef.current.offsetWidth);
        globeRef.current.height(containerRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeRef.current) {
        globeRef.current._destructor?.();
        globeRef.current = null;
      }
    };
  }, []);

  // 更新记忆点
  useEffect(() => {
    if (!globeRef.current) return;

    console.log('Updating points with', memories.length, 'memories');

    globeRef.current
      .pointsData(memories)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#c084fc')
      .pointAltitude(0.01)
      .pointRadius(0.5)
      .pointLabel((d: any) => {
        const photos = d.photos || [];
        const videos = d.videos || [];

        // 生成照片缩略图
        let photoThumbnails = '';
        if (photos.length > 0) {
          const displayPhotos = photos.slice(0, 3); // 最多显示3张
          photoThumbnails = `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <span>📷</span>
                <span>${photos.length} ${photos.length === 1 ? 'Photo' : 'Photos'}</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                ${displayPhotos.map(photo => `
                  <div style="
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                  ">
                    <img
                      src="${photo.url}"
                      alt="${photo.name}"
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      "
                    />
                  </div>
                `).join('')}
              </div>
              ${photos.length > 3 ? `
                <div style="margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.5); text-align: center;">
                  +${photos.length - 3} more
                </div>
              ` : ''}
            </div>
          `;
        }

        // 生成视频信息
        let videoInfo = '';
        if (videos.length > 0) {
          videoInfo = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 12px; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 6px;">
                <span>🎥</span>
                <span>${videos.length} ${videos.length === 1 ? 'Video' : 'Videos'}</span>
              </div>
            </div>
          `;
        }

        return `
          <div style="
            background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98));
            padding: 16px;
            border-radius: 16px;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            border: 1px solid rgba(167,139,250,0.3);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(167,139,250,0.15);
            backdrop-filter: blur(20px);
            min-width: 280px;
            max-width: 320px;
          ">
            <div style="font-size: 19px; font-weight: 600; margin-bottom: 6px; color: rgba(192,132,252,1);">${d.location}</div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px;">📅 ${d.date}</div>
            ${d.description ? `
              <div style="
                font-size: 13px;
                color: rgba(255,255,255,0.5);
                margin-top: 10px;
                line-height: 1.5;
                max-height: 60px;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${d.description}</div>
            ` : ''}
            ${photoThumbnails}
            ${videoInfo}
            <div style="
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.1);
              font-size: 11px;
              color: rgba(167,139,250,0.8);
              text-align: center;
              font-weight: 500;
            ">
              Click to view full details
            </div>
          </div>
        `;
      })
      .onPointClick((point: any) => {
        const memory = memories.find(m => m.id === point.id);
        if (memory && onMemoryClick) {
          onMemoryClick(memory);
        }
        globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
      });

    if (onLocationClick) {
      globeRef.current.onGlobeClick((coords: any) => {
        onLocationClick(coords.lat, coords.lng);
      });
    }

    // 添加用户旅行记忆标签（紫色）
    globeRef.current
      .labelsData(memories)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('location')
      .labelSize(() => altitude < 1.8 ? 1.2 : 0) // 放大时显示标签
      .labelDotRadius(0.4)
      .labelColor(() => 'rgba(192, 132, 252, 1)') // 紫色 - 用户的旅行地点
      .labelResolution(3)
      .labelAltitude(0.01);

    // 添加世界地理位置标签（白色/蓝色）
    const geoLabels = worldLocations.map(loc => ({
      ...loc,
      lat: loc.lat,
      lng: loc.lng,
      text: loc.name,
      size: loc.size || 1.0
    }));

    globeRef.current
      .htmlElementsData(geoLabels)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.style.cssText = `
          color: ${d.type === 'country' ? 'rgba(147, 197, 253, 0.9)' : 'rgba(226, 232, 240, 0.8)'};
          font-size: ${altitude < 1.5 ? (d.size * 12) : altitude < 2.5 ? (d.size * 8) : 0}px;
          font-weight: ${d.type === 'country' ? '600' : '500'};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          pointer-events: none;
          user-select: none;
          text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6);
          white-space: nowrap;
          letter-spacing: 0.5px;
          opacity: ${altitude < 1.5 ? 1 : altitude < 2.5 ? 0.7 : 0};
          transition: opacity 0.3s ease, font-size 0.3s ease;
        `;
        el.textContent = d.text;
        return el;
      });

  }, [memories, onLocationClick, onMemoryClick, altitude]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        cursor: 'grab'
      }}
    />
  );
}
