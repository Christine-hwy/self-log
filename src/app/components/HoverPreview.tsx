import { TravelMemory } from '../../data/site';

interface HoverPreviewProps {
  memory: TravelMemory;
  position: { x: number; y: number };
}

export function HoverPreview({ memory, position }: HoverPreviewProps) {
  const photos = memory.photos.slice(0, 3);
  const videos = memory.videos;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x + 20}px`,
        top: `${position.y - 100}px`,
      }}
    >
      <div className="bg-gradient-to-br from-slate-900/98 to-slate-950/98 border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/20 backdrop-blur-xl p-5 max-w-sm">
        {/* 标题 */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-violet-300 mb-1">{memory.location}</h3>
          <p className="text-xs text-slate-400">📅 {memory.date}</p>
        </div>

        {/* 描述 */}
        {memory.description && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed">
            {memory.description}
          </p>
        )}

        {/* 照片缩略图 */}
        {photos.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400">📷 {memory.photos.length} {memory.photos.length === 1 ? 'Photo' : 'Photos'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden border border-slate-700/50"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {memory.photos.length > 3 && (
              <p className="text-xs text-slate-500 text-center mt-2">
                +{memory.photos.length - 3} more
              </p>
            )}
          </div>
        )}

        {/* 视频信息 */}
        {videos.length > 0 && (
          <div className="flex items-center gap-2 py-2 border-t border-slate-800/50">
            <span className="text-xs text-slate-400">🎥 {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}</span>
          </div>
        )}

        {/* 提示 */}
        <div className="pt-3 border-t border-slate-800/50 mt-3">
          <p className="text-xs text-violet-400 text-center font-medium">
            Click to view full details
          </p>
        </div>
      </div>
    </div>
  );
}
