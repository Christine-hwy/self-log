import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center group"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 to-slate-950/95 rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-500/10 backdrop-blur-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-white mb-6">How to use</h2>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <h3 className="font-medium text-white mb-2">🌍 Interact with the Globe</h3>
                <p className="text-slate-400">
                  Click and drag to rotate the Earth. Scroll to zoom in and out. The globe will auto-rotate when idle.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">📍 Add a Memory</h3>
                <p className="text-slate-400">
                  Click anywhere on the globe to create a new memory at that location, or use the "Add New Memory" button. You can upload photos and videos!
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">🗺️ View Memories</h3>
                <p className="text-slate-400">
                  Hover over the markers on the globe to see details. Click on them to view full details with all your photos and videos.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">🗺️ World Map Labels</h3>
                <p className="text-slate-400">
                  Zoom in (scroll wheel) to see world locations appear: countries in <span className="text-blue-300">blue</span> (China, USA, France...), cities in <span className="text-slate-300">white</span> (Beijing, London, New York...). Your travel memories show in <span className="text-violet-300">purple</span>.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">🖼️ Hover to Preview</h3>
                <p className="text-slate-400">
                  Hover your cursor over any marker to see a preview window with photo thumbnails and travel details.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">📊 Track Your Journey</h3>
                <p className="text-slate-400">
                  View statistics and your complete list of memories in the left sidebar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
