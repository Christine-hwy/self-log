import { useState } from 'react';
import { X, MapPin, Calendar, Image as ImageIcon, Video, ZoomIn } from 'lucide-react';
import { TravelMemory } from '../../data/site';

interface MemoryDetailProps {
  memory: TravelMemory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryDetail({ memory, isOpen, onClose }: MemoryDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!memory || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900/98 to-slate-950/98 rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-500/20 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-6 float-right mr-6 z-10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* 头部信息 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white mb-1">{memory.location}</h2>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{memory.date}</span>
                </div>
              </div>
            </div>

            {memory.description && (
              <p className="text-slate-300 leading-relaxed text-lg">{memory.description}</p>
            )}
          </div>

          {/* 照片网格 */}
          {memory.photos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-violet-400" />
                <h3 className="text-xl font-semibold text-white">Photos ({memory.photos.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {memory.photos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(photo.url)}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-700/50 hover:border-violet-500/50 transition-all group cursor-pointer relative"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 视频列表 */}
          {memory.videos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-violet-400" />
                <h3 className="text-xl font-semibold text-white">Videos ({memory.videos.length})</h3>
              </div>
              <div className="space-y-4">
                {memory.videos.map((video, index) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden border border-slate-700/50 hover:border-violet-500/50 transition-all"
                  >
                    <video
                      src={video.url}
                      controls
                      className="w-full bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="p-3 bg-slate-900/50">
                      <p className="text-sm text-slate-400">{video.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {memory.photos.length === 0 && memory.videos.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500">No photos or videos yet</p>
            </div>
          )}

          {/* 坐标信息 */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Coordinates</span>
              <span className="font-mono text-slate-400">
                {memory.lat.toFixed(4)}, {memory.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 图片全屏查看 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
