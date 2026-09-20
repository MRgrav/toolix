import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";

export default function VideoTrimmerTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [videoUrl, setVideoUrl] = createSignal<string>("");
  const [duration, setDuration] = createSignal(0);
  const [startTime, setStartTime] = createSignal(0);
  const [endTime, setEndTime] = createSignal(0);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [statusMsg, setStatusMsg] = createSignal("");
  const [result, setResult] = createSignal<{ url: string; filename: string } | null>(null);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      const selected = target.files[0];
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleLoadedMetadata = (e: Event) => {
    const target = e.target as HTMLVideoElement;
    setDuration(target.duration);
    setStartTime(0);
    setEndTime(Math.floor(target.duration));
  };

  const handleTrim = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsProcessing(true);
    setProgress(0.05);
    setStatusMsg("Trimming video via WASM...");

    try {
      const start = startTime();
      const end = endTime();
      const dur = Math.max(1, end - start);

      const ext = currentFile.name.split('.').pop() || 'mp4';
      const outputFilename = `${currentFile.name.replace(/\.[^/.]+$/, "")}_trimmed.${ext}`;

      const ffmpegArgs = [
        "-ss", start.toString(),
        "-i", "{input}",
        "-t", dur.toString(),
        "-c", "copy",
        "{output}"
      ];

      const res = await processFFmpegCommand(
        currentFile,
        ffmpegArgs,
        outputFilename,
        `video/${ext}`,
        (p) => setProgress(Math.max(0.1, p))
      );

      setResult({ url: res.url, filename: res.filename });
      setStatusMsg("Trimming complete!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Error trimming video.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
        
        {/* Upload Zone */}
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-6 text-center cursor-pointer">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Show
            when={file()}
            fallback={
              <div class="space-y-2">
                <div class="text-3xl">✂️</div>
                <p class="text-sm font-semibold text-white">Select video to trim</p>
                <p class="text-xs text-slate-400">Supports MP4, WebM, MOV, AVI</p>
              </div>
            }
          >
            <div class="text-sm font-semibold text-purple-300">{file()?.name}</div>
          </Show>
        </div>

        {/* Video Preview & Controls */}
        <Show when={file()}>
          <div class="mt-6 space-y-4">
            <video
              src={videoUrl()}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              class="w-full max-h-80 rounded-xl bg-black"
            />

            {/* Timers */}
            <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
              <div class="flex justify-between text-xs text-slate-300 font-mono">
                <span>Start: {formatSeconds(startTime())}</span>
                <span>Duration: {formatSeconds(Math.max(0, endTime() - startTime()))}</span>
                <span>End: {formatSeconds(endTime())}</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">Start Time (sec)</label>
                  <input
                    type="number"
                    min="0"
                    max={endTime()}
                    value={startTime()}
                    onInput={(e) => setStartTime(Number(e.currentTarget.value))}
                    class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">End Time (sec)</label>
                  <input
                    type="number"
                    min={startTime()}
                    max={duration()}
                    value={endTime()}
                    onInput={(e) => setEndTime(Number(e.currentTarget.value))}
                    class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleTrim}
              disabled={isProcessing()}
              class="w-full py-3 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? `Trimming... (${Math.round(progress() * 100)}%)` : "Trim Video Now"}
            </button>
          </div>
        </Show>

        {/* Result */}
        <Show when={result()}>
          <div class="mt-6 p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <h4 class="text-sm font-bold text-emerald-300">Trimmed Video Ready!</h4>
            <video controls src={result()?.url} class="w-full max-h-64 rounded-lg bg-black mx-auto" />
            <a
              href={result()?.url}
              download={result()?.filename}
              class="inline-block px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-lg"
            >
              ⬇️ Download Trimmed Video
            </a>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
