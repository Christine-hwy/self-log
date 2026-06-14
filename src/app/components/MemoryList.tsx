import { MapPin, Calendar, Compass, Image, Video } from 'lucide-react';
import { TravelMemory } from '../../data/site';

interface MemoryListProps {
  memories: TravelMemory[];
  onMemoryClick?: (memory: TravelMemory) => void;
}

export function MemoryList({ memories, onMemoryClick }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-violet-950/30 border border-violet-500/20 flex items-center justify-center mb-4">
          <Compass className="w-8 h-8 text-violet-400/50" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No memories yet</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
          Start your journey by adding your first travel memory. Click the globe or the button below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory, index) => (
        <button
          key={memory.id}
          onClick={() => onMemoryClick?.(memory)}
          className="w-full text-left p-4 bg-gradient-to-br from-slate-900/40 to-slate-950/40 hover:from-slate-900/60 hover:to-slate-950/60 border border-slate-800/50 hover:border-violet-500/30 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0 group-hover:text-violet-300 transition-colors" />
                <h3 className="text-white font-medium truncate group-hover:text-violet-100 transition-colors">{memory.location}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{memory.date}</span>
              </div>
              {memory.description && (
                <p className="mt-2 text-sm text-slate-500 line-clamp-2 group-hover:text-slate-400 transition-colors">{memory.description}</p>
              )}
              {(memory.photos.length > 0 || memory.videos.length > 0) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800/50">
                  {memory.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Image className="w-3.5 h-3.5" />
                      <span>{memory.photos.length}</span>
                    </div>
                  )}
                  {memory.videos.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Video className="w-3.5 h-3.5" />
                      <span>{memory.videos.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-2 h-2 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2 group-hover:scale-125" />
          </div>
        </button>
      ))}
    </div>
  );
}
