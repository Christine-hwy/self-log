import { useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import {
  Calendar,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  MicOff,
  Phone,
  RotateCcw,
  Video,
  Volume2,
  X
} from 'lucide-react';
import { MediaFile, TravelMemory } from '../../data/site';
import { VoiceFootprintDraft, buildFootprintFromSpeech } from '../utils/footprintAgent';

interface VoiceFootprintAgentProps {
  onCreateMemory: (memory: Omit<TravelMemory, 'id'>) => void;
}

export function VoiceFootprintAgent({ onCreateMemory }: VoiceFootprintAgentProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<VoiceFootprintDraft | null>(null);
  const [status, setStatus] = useState('点按通话，直接说出今天的旅行地点');
  const [isParsing, setIsParsing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  const conversation = useConversation({
    onMessage: (message) => {
      const userText = extractUserTranscript(message);

      if (userText) {
        setTranscript(userText);
        parseTranscript(userText);
      }
    }
  });

  const totalMedia = photos.length + videos.length;
  const isElevenLabsConnected = conversation.status === 'connected';

  const startXiaobai = async () => {
    setLastCreated(null);
    setDraft(null);
    setVoiceError('');
    setIsConnecting(true);
    setStatus('正在连接小白...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('当前浏览器不支持麦克风访问');
      }

      if (!window.RTCPeerConnection) {
        throw new Error('当前浏览器不支持 WebRTC 语音连接');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      conversation.startSession({
        connectionType: 'webrtc',
        onConnect: () => {
          setIsConnecting(false);
          setVoiceError('');
          setStatus('小白已连接，说出今天的旅行地点');
        },
        onDisconnect: () => {
          setIsConnecting(false);
          setStatus('语音已结束，可以重新开始');
        },
        onError: (error) => {
          setIsConnecting(false);
          const message = normalizeVoiceError(error);
          setVoiceError(message);
          setStatus(message);
        },
        onModeChange: (mode) => {
          if (mode === 'speaking') {
            setStatus('小白正在回复');
          }
          if (mode === 'listening') {
            setStatus('小白正在听你说旅行地点');
          }
        }
      });
    } catch (error) {
      setIsConnecting(false);
      const message = normalizeVoiceError(error);
      setVoiceError(message);
      setStatus(message);
    }
  };

  const stopXiaobai = () => {
    conversation.endSession();
    setIsConnecting(false);
  };

  const parseTranscript = (value = transcript) => {
    const cleanValue = value.trim();
    if (!cleanValue) {
      setStatus('先说一句旅行描述');
      return;
    }

    setIsParsing(true);
    setDraft(null);

    window.setTimeout(() => {
      const nextDraft = buildFootprintFromSpeech(cleanValue, { photos, videos });

      if (!nextDraft) {
        setStatus('还没识别出地点。可以试试：今天我在杭州西湖旅行');
        setIsParsing(false);
        return;
      }

      setDraft(nextDraft);
      setStatus(`识别到 ${nextDraft.location}，检查一下再保存`);
      setIsParsing(false);
    }, 350);
  };

  const saveDraft = () => {
    if (!draft) return;

    onCreateMemory(draft);
    setLastCreated(draft.location);
    setStatus(`已保存 ${draft.location} 的旅行足迹`);
    setTranscript('');
    setDraft(null);
    setPhotos([]);
    setVideos([]);
  };

  const handleMediaFiles = (
    files: FileList | null,
    type: 'image' | 'video',
    onDone: (media: MediaFile[]) => void
  ) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const readers = selectedFiles.map(
      (file) =>
        new Promise<MediaFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              url: event.target?.result as string,
              name: file.name,
              type
            });
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then(onDone);
  };

  const clearMedia = () => {
    setPhotos([]);
    setVideos([]);
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            photos: [],
            videos: [],
            description: currentDraft.description.replace(/ Attached .*$/, '')
          }
        : null
    );
  };

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-4 shadow-lg shadow-cyan-950/20">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">小白 Footprint Agent</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{status}</p>
        </div>
        {lastCreated && (
          <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Saved
          </div>
        )}
      </div>

      <div className="relative mb-4 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-gradient-to-b from-white via-slate-100 to-cyan-50 px-4 py-6">
        <div
          className={`voice-orb ${isElevenLabsConnected ? 'voice-orb-active' : ''} ${
            conversation.isSpeaking ? 'voice-orb-speaking' : ''
          }`}
        >
          <span className="voice-orb-petal voice-orb-petal-1" />
          <span className="voice-orb-petal voice-orb-petal-2" />
          <span className="voice-orb-petal voice-orb-petal-3" />
          <span className="voice-orb-petal voice-orb-petal-4" />
          <span className="voice-orb-petal voice-orb-petal-5" />
          <span className="voice-orb-petal voice-orb-petal-6" />
          <span className="voice-orb-core" />
        </div>

        <button
          type="button"
          onClick={isElevenLabsConnected ? stopXiaobai : startXiaobai}
          disabled={isConnecting}
          aria-label={isElevenLabsConnected ? '结束小白语音' : '开始小白语音'}
          className={`absolute bottom-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-white text-white shadow-2xl transition-all ${
            isElevenLabsConnected
              ? 'bg-red-500 hover:bg-red-400'
              : 'bg-slate-950 hover:bg-cyan-950'
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {isConnecting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isElevenLabsConnected ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Phone className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
          {isConnecting ? '正在连接' : isElevenLabsConnected ? '语音通话中' : '小白语音'}
        </span>
        <span className={isElevenLabsConnected ? 'text-emerald-300' : 'text-slate-500'}>
          {isElevenLabsConnected
            ? conversation.isSpeaking
              ? 'speaking'
              : 'listening'
            : conversation.status}
        </span>
      </div>

      {transcript && (
        <div className="mb-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2">
          <p className="line-clamp-2 text-xs leading-relaxed text-cyan-100">{transcript}</p>
        </div>
      )}

      {voiceError && (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
          <p className="text-xs leading-relaxed text-red-200">{voiceError}</p>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => parseTranscript()}
          disabled={isParsing}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          重试解析
        </button>

        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/40 px-3 text-sm text-slate-300 transition-all hover:border-violet-500/40 hover:text-white"
        >
          <ImagePlus className="h-4 w-4" />
          照片
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/40 px-3 text-sm text-slate-300 transition-all hover:border-violet-500/40 hover:text-white"
        >
          <Video className="h-4 w-4" />
          视频
        </button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) =>
          handleMediaFiles(event.target.files, 'image', (nextPhotos) => {
            setPhotos([...photos, ...nextPhotos]);
            setDraft(null);
          })
        }
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(event) =>
          handleMediaFiles(event.target.files, 'video', (nextVideos) => {
            setVideos([...videos, ...nextVideos]);
            setDraft(null);
          })
        }
      />

      {totalMedia > 0 && (
        <div className="mb-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              已选择 {photos.length} 张照片 / {videos.length} 个视频
            </span>
            <button
              type="button"
              onClick={clearMedia}
              className="flex items-center gap-1 text-slate-500 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              清空
            </button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <img
                  key={photo.url}
                  src={photo.url}
                  alt={photo.name}
                  className="aspect-square rounded-lg border border-slate-800 object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {draft && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <MapPin className="h-4 w-4 text-violet-300" />
                <span className="truncate">{draft.location}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {draft.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {draft.photos.length}
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  {draft.videos.length}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-3 text-sm font-medium text-white transition-all hover:bg-emerald-400"
            >
              <Check className="h-4 w-4" />
              保存足迹
            </button>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-300">{draft.description}</p>
        </div>
      )}
    </div>
  );
}

function extractUserTranscript(message: unknown) {
  if (!message || typeof message !== 'object') return '';

  const payload = message as Record<string, unknown>;
  const candidates = [
    payload.message,
    payload.text,
    payload.transcript,
    payload.user_transcript,
    payload.userTranscript
  ];

  const source = String(payload.source ?? payload.role ?? payload.type ?? '').toLowerCase();
  const looksLikeUserMessage =
    source.includes('user') || source.includes('transcript') || source.includes('user_transcript');

  if (!looksLikeUserMessage) return '';

  return candidates.find((candidate): candidate is string => typeof candidate === 'string')?.trim() ?? '';
}

function normalizeVoiceError(error: unknown) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '语音连接失败';

  if (/permission|denied|notallowed/i.test(rawMessage)) {
    return '麦克风权限被拒绝，请允许浏览器使用麦克风';
  }

  if (/notfound|device/i.test(rawMessage)) {
    return '没有找到可用麦克风，请检查输入设备';
  }

  if (/webrtc|peer/i.test(rawMessage)) {
    return '当前浏览器不支持 WebRTC 语音连接，请用 Chrome 或 Safari 打开';
  }

  return rawMessage.includes('语音') || rawMessage.includes('麦克风')
    ? rawMessage
    : '小白语音连接失败，请检查麦克风权限或换系统浏览器打开';
}
