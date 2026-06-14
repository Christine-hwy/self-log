import { useState, useRef } from 'react';
import { Loader2, Upload, X, Video } from 'lucide-react';
import { MediaFile } from '../../data/site';

interface MediaUploadProps {
  photos: MediaFile[];
  videos: MediaFile[];
  onPhotosChange: (photos: MediaFile[]) => void;
  onVideosChange: (videos: MediaFile[]) => void;
}

export function MediaUpload({ photos, videos, onPhotosChange, onVideosChange }: MediaUploadProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isReadingPhotos, setIsReadingPhotos] = useState(false);
  const [isReadingVideos, setIsReadingVideos] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsReadingPhotos(true);
    const newPhotos: MediaFile[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push({
            url: event.target.result as string,
            name: file.name,
            type: 'image'
          });
          if (newPhotos.length === files.length) {
            onPhotosChange([...photos, ...newPhotos]);
            setIsReadingPhotos(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsReadingVideos(true);
    const newVideos: MediaFile[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newVideos.push({
            url: event.target.result as string,
            name: file.name,
            type: 'video'
          });
          if (newVideos.length === files.length) {
            onVideosChange([...videos, ...newVideos]);
            setIsReadingVideos(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* 照片上传 */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Photos</label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isReadingPhotos}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 hover:border-violet-500/50 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
          >
            {isReadingPhotos ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <span>{isReadingPhotos ? 'Reading Photos...' : 'Upload Photos'}</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover rounded-lg border border-slate-700/50"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 视频上传 */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Videos</label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isReadingVideos}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 hover:border-violet-500/50 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
          >
            {isReadingVideos ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Video className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <span>{isReadingVideos ? 'Reading Videos...' : 'Upload Videos'}</span>
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            className="hidden"
          />

          {videos.length > 0 && (
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={index} className="relative group">
                  <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg flex items-center gap-3">
                    <Video className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300 truncate flex-1">{video.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="w-6 h-6 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
