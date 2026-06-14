import { useEffect, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { Plus, Globe as GlobeIcon } from 'lucide-react';
import { GlobeView as Globe3D } from './components/GlobeView';
import { AddMemoryDialog } from './components/AddMemoryDialog';
import { MemoryList } from './components/MemoryList';
import { LoadingScreen } from './components/LoadingScreen';
import { StatsCard } from './components/StatsCard';
import { HelpButton } from './components/HelpButton';
import { MemoryDetail } from './components/MemoryDetail';
import { QuickTip } from './components/QuickTip';
import { VoiceFootprintAgent } from './components/VoiceFootprintAgent';
import { siteData, TravelMemory } from '../data/site';
import { loadStoredMemories, saveStoredMemories } from './utils/memoryStorage';

const ELEVENLABS_AGENT_ID = 'agent_2101kv2en28cetzahzchd5p7ag71';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [memories, setMemories] = useState<TravelMemory[]>(siteData.memories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<TravelMemory | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => setIsLoading(false), 1800);
    return () => window.clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    loadStoredMemories(siteData.memories).then((storedMemories) => {
      setMemories(storedMemories);
      setIsStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    saveStoredMemories(memories);
  }, [isStorageReady, memories]);

  const handleAddMemory = (newMemory: Omit<TravelMemory, 'id'>) => {
    const memory: TravelMemory = {
      ...newMemory,
      id: Date.now().toString()
    };
    setMemories([memory, ...memories]);
  };

  const handleGlobeClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsDialogOpen(true);
  };

  const handleMemoryClick = (memory: TravelMemory) => {
    setSelectedMemory(memory);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-slate-950 to-indigo-950/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      {/* 主内容 */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* 左侧面板 */}
        <div className="w-full md:w-96 h-auto md:h-full flex flex-col border-b md:border-b-0 md:border-r border-slate-800/50 bg-slate-950/60 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* 头部 */}
          <div className="flex-shrink-0 p-6 md:p-8 border-b border-slate-800/50">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <GlobeIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  Journey
                </h1>
              </div>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              {siteData.subtitle}
            </p>
          </div>

          {/* 旅行记录列表 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 max-h-64 md:max-h-none">
            <ConversationProvider agentId={ELEVENLABS_AGENT_ID}>
              <VoiceFootprintAgent onCreateMemory={handleAddMemory} />
            </ConversationProvider>
            <StatsCard memories={memories} />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider">
                Recent Memories
              </h2>
            </div>
            <MemoryList memories={memories} onMemoryClick={handleMemoryClick} />
          </div>

          {/* 底部操作 */}
          <div className="flex-shrink-0 p-4 md:p-6 border-t border-slate-800/50">
            <button
              onClick={() => {
                setSelectedCoords(null);
                setIsDialogOpen(true);
              }}
              className="w-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base font-medium">Add New Memory</span>
            </button>
          </div>
        </div>

        {/* 右侧地球 */}
        <div className="flex-1 h-full flex flex-col items-center justify-center p-4 md:p-12 relative min-h-0">
          {/* 星空装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          <div className="w-full h-full max-w-5xl relative z-10" style={{ minHeight: '500px' }}>
            <Globe3D
              memories={memories}
              onLocationClick={handleGlobeClick}
              onMemoryClick={handleMemoryClick}
            />
          </div>

          {/* 快捷提示 */}
          <QuickTip />
        </div>
      </div>

      {/* 添加记录对话框 */}
      <AddMemoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddMemory}
        initialLat={selectedCoords?.lat}
        initialLng={selectedCoords?.lng}
      />

      {/* 记忆详情 */}
      <MemoryDetail
        memory={selectedMemory}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* 帮助按钮 */}
      <HelpButton />
    </div>
  );
}
