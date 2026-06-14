import { Info } from 'lucide-react';

export function QuickTip() {
  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center z-10 max-w-3xl px-4">
      <div className="backdrop-blur-sm bg-slate-950/40 px-6 py-3 rounded-full border border-slate-800/50 flex items-center gap-3 shadow-lg">
        <Info className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <p className="text-sm text-slate-400">
          <span className="text-blue-300">Zoom in</span> to see world map labels (countries & cities) ·
          <span className="text-violet-300"> Purple labels</span> = your travels ·
          <span className="text-violet-300"> Hover</span> to preview ·
          <span className="text-violet-300"> Click</span> for details
        </p>
      </div>
    </div>
  );
}
