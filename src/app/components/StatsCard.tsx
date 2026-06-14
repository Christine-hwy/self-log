import { MapPin, Calendar, Image } from 'lucide-react';
import { TravelMemory } from '../../data/site';

interface StatsCardProps {
  memories: TravelMemory[];
}

export function StatsCard({ memories }: StatsCardProps) {
  const totalPhotos = memories.reduce((sum, m) => sum + m.photos.length, 0);
  const totalVideos = memories.reduce((sum, m) => sum + m.videos.length, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="p-4 bg-gradient-to-br from-violet-950/30 to-violet-900/20 border border-violet-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Places</span>
        </div>
        <div className="text-2xl font-semibold text-white">{memories.length}</div>
      </div>

      <div className="p-4 bg-gradient-to-br from-indigo-950/30 to-indigo-900/20 border border-indigo-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Image className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Photos</span>
        </div>
        <div className="text-2xl font-semibold text-white">{totalPhotos}</div>
      </div>

      <div className="p-4 bg-gradient-to-br from-purple-950/30 to-purple-900/20 border border-purple-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Videos</span>
        </div>
        <div className="text-2xl font-semibold text-white">{totalVideos}</div>
      </div>
    </div>
  );
}
