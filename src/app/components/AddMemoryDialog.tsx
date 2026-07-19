import { useState, useEffect, useMemo, useReducer } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import { TravelMemory, MediaFile } from '../../data/site';
import { MediaUpload } from './MediaUpload';
import { PlaceSearchField } from './PlaceSearchField';
import { createLocalPlaceLookupService } from '../utils/placeLookupService';
import { locationFieldsReducer, initialLocationFieldsState } from '../utils/locationFieldsReducer';

interface AddMemoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memory: Omit<TravelMemory, 'id'>) => void;
  initialLat?: number;
  initialLng?: number;
}

export function AddMemoryDialog({ isOpen, onClose, onAdd, initialLat, initialLng }: AddMemoryDialogProps) {
  const [locationFields, dispatchLocationFields] = useReducer(
    locationFieldsReducer,
    initialLocationFieldsState(initialLat, initialLng)
  );
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoized so the same `PlaceLookupService` instance (and, by extension,
  // the same `createSearchController`/dataset-loading closure inside
  // `PlaceSearchField`) is reused across re-renders instead of being
  // recreated every render.
  const placeLookupService = useMemo(() => createLocalPlaceLookupService(), []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // `initializeCoords` requires both lat/lng as numbers, but
      // `initialLat`/`initialLng` are independent optional props. The
      // pre-refactor code set them independently via two separate `if`
      // statements, so a single provided coordinate could be applied on its
      // own even when the other was absent. To preserve that exact
      // behavior: when both are provided (the common globe-click case), use
      // `initializeCoords` in one dispatch; otherwise, fall back to
      // dispatching `editLat`/`editLng` independently (each still formatted
      // with `.toFixed(4)`, matching the original formatting) so a lone
      // coordinate is still applied.
      if (initialLat !== undefined && initialLng !== undefined) {
        dispatchLocationFields({ type: 'initializeCoords', lat: initialLat, lng: initialLng });
      } else {
        if (initialLat !== undefined) {
          dispatchLocationFields({ type: 'editLat', value: initialLat.toFixed(4) });
        }
        if (initialLng !== undefined) {
          dispatchLocationFields({ type: 'editLng', value: initialLng.toFixed(4) });
        }
      }
    }
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen && !isAnimating) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationFields.location || !locationFields.lat || !locationFields.lng || !date) return;

    onAdd({
      location: locationFields.location,
      lat: parseFloat(locationFields.lat),
      lng: parseFloat(locationFields.lng),
      date,
      description,
      photos,
      videos
    });

    // Reset form
    dispatchLocationFields({ type: 'reset' });
    setDate('');
    setDescription('');
    setPhotos([]);
    setVideos([]);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none pointer-events-none'
        }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900/95 to-slate-950/95 rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-500/10 backdrop-blur-xl transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Add Memory</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Search for a Place</label>
              <PlaceSearchField
                onSelect={(candidate) => dispatchLocationFields({ type: 'selectPlace', candidate })}
                service={placeLookupService}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Location Name</label>
              <input
                type="text"
                value={locationFields.location}
                onChange={(e) => dispatchLocationFields({ type: 'editLocation', value: e.target.value })}
                placeholder="e.g., Paris, France"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationFields.lat}
                  onChange={(e) => dispatchLocationFields({ type: 'editLat', value: e.target.value })}
                  placeholder="48.8566"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationFields.lng}
                  onChange={(e) => dispatchLocationFields({ type: 'editLng', value: e.target.value })}
                  placeholder="2.3522"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Date</label>
              <input
                type="month"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your memories..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
              />
            </div>

            <div className="border-t border-slate-800/50 pt-6 -mx-8 px-8">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Media & Memories</h3>
              <MediaUpload
                photos={photos}
                videos={videos}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/20"
              >
                Add Memory
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
