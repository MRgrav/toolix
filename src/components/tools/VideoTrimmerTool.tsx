import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";
import { ScissorsIcon, DownloadIcon } from "../Icons";

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
    setStatusMsg("Trimming video...");

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
      <div class="glass-card p-6 rounded-md border border-black/10 dark:border-white/10 shadow-sm">
        
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#E6986C] bg-slate-100 dark:bg-slate-900/40 rounded-md p-6 text-center cursor-pointer">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Show
            when={file()}
            fallback={
              <div class="space-y-1.5">
                <ScissorsIcon class="w-6 h-6 text-[#E6986C] mx-auto" />
                <p class="text-xs font-bold text-slate-900 dark:text-slate-100">Select video to trim</p>
                <p class="text-[11px] text-slate-600 dark:text-slate-400">Supports MP4, WebM, MOV, AVI</p>
              </div>
            }
          >
            <div class="text-xs font-semibold text-[#E6986C]">{file()?.name}</div>
          </Show>
        </div>

        <Show when={file()}>
          <div class="mt-4 space-y-3">
            <video
              src={videoUrl()}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              class="w-full max-h-64 rounded-md bg-black"
            />

            <div class="p-3 rounded-md bg-slate-100 dark:bg-slate-900/60 border border-black/5 dark:border-white/5 space-y-3">
              <div class="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                <span>Start: {formatSeconds(startTime())}</span>
                <span>Duration: {formatSeconds(Math.max(0, endTime() - startTime()))}</span>
                <span>End: {formatSeconds(endTime())}</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Start Time (sec)</label>
                  <input
                    type="number"
                    min="0"
                    max={endTime()}
                    value={startTime()}
                    onInput={(e) => setStartTime(Number(e.currentTarget.value))}
                    class="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">End Time (sec)</label>
                  <input
                    type="number"
                    min={startTime()}
                    max={duration()}
                    value={endTime()}
                    onInput={(e) => setEndTime(Number(e.currentTarget.value))}
                    class="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleTrim}
              disabled={isProcessing()}
              class="w-full py-2.5 rounded-md font-bold text-slate-950 accent-bg-muskmelon hover:opacity-90 disabled:opacity-50 transition-all text-xs"
            >
              {isProcessing() ? `Trimming... (${Math.round(progress() * 100)}%)` : "Trim Video Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="mt-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-xs font-bold text-emerald-400">Trimmed Video Ready</h4>
            <video controls src={result()?.url} class="w-full max-h-48 rounded bg-black mx-auto" />
            <a
              href={result()?.url}
              download={result()?.filename}
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs"
            >
              <DownloadIcon class="w-4 h-4" />
              <span>Download Trimmed Video</span>
            </a>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-6" />
    </div>
  );
}
