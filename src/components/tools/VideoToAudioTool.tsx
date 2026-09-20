import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";
import { MusicIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function VideoToAudioTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [format, setFormat] = createSignal<"mp3" | "wav" | "aac">("mp3");
  const [bitrate, setBitrate] = createSignal<"128k" | "192k" | "320k">("192k");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [statusMsg, setStatusMsg] = createSignal("");
  const [result, setResult] = createSignal<{ url: string; filename: string } | null>(null);

  const handleFileDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith("video/")) {
        setFile(selected);
        setResult(null);
      }
    }
  };

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setFile(target.files[0]);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsProcessing(true);
    setProgress(0.05);
    setStatusMsg("Initializing engine and reading file...");

    try {
      const targetFormat = format();
      const outputFilename = `${currentFile.name.replace(/\.[^/.]+$/, "")}_audio.${targetFormat}`;
      const mime = targetFormat === "mp3" ? "audio/mp3" : targetFormat === "wav" ? "audio/wav" : "audio/aac";

      let ffmpegArgs: string[] = [];
      if (targetFormat === "mp3") {
        ffmpegArgs = ["-i", "{input}", "-vn", "-ab", bitrate(), "{output}"];
      } else if (targetFormat === "wav") {
        ffmpegArgs = ["-i", "{input}", "-vn", "-acodec", "pcm_s16le", "{output}"];
      } else {
        ffmpegArgs = ["-i", "{input}", "-vn", "-c:a", "aac", "-b:a", bitrate(), "{output}"];
      }

      setStatusMsg("Extracting audio track...");
      const res = await processFFmpegCommand(
        currentFile,
        ffmpegArgs,
        outputFilename,
        mime,
        (p) => {
          setProgress(Math.max(0.1, p));
        }
      );

      setResult({ url: res.url, filename: res.filename });
      setStatusMsg("Extraction complete!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Error during audio extraction.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-md border border-black/10 dark:border-white/10 shadow-sm">
        
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          class={`relative border-2 border-dashed rounded-md p-6 text-center transition-all cursor-pointer ${
            file() ? "border-[#FA9A85] bg-[#FA9A85]/10" : "border-slate-300 dark:border-slate-700/60 hover:border-[#FA9A85] bg-slate-100 dark:bg-slate-900/40"
          }`}
        >
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
                <div class="w-10 h-10 rounded-md bg-[#FA9A85]/10 text-[#FA9A85] flex items-center justify-center mx-auto">
                  <MusicIcon class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-900 dark:text-slate-100">Drag & drop video here or click to browse</p>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Supports MP4, WebM, MOV, AVI, MKV</p>
                </div>
              </div>
            }
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-left">
                <MusicIcon class="w-5 h-5 text-[#FA9A85]" />
                <div>
                  <p class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">{file()?.name}</p>
                  <p class="text-[10px] text-slate-600 dark:text-slate-400">{((file()?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                class="px-2.5 py-1 rounded text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                Change File
              </button>
            </div>
          </Show>
        </div>

        {/* Options */}
        <Show when={file()}>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-md bg-slate-100 dark:bg-slate-900/60 border border-black/5 dark:border-white/5">
            <div>
              <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Output Format</label>
              <div class="grid grid-cols-3 gap-1.5">
                {(["mp3", "wav", "aac"] as const).map((fmt) => (
                  <button
                    onClick={() => setFormat(fmt)}
                    class={`py-1.5 text-xs font-bold rounded uppercase border transition-all ${
                      format() === fmt
                        ? "accent-bg-peach border-[#FA9A85] text-slate-950"
                        : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <Show when={format() !== "wav"}>
              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Bitrate Quality</label>
                <div class="grid grid-cols-3 gap-1.5">
                  {(["128k", "192k", "320k"] as const).map((br) => (
                    <button
                      onClick={() => setBitrate(br)}
                      class={`py-1.5 text-xs font-bold rounded border transition-all ${
                        bitrate() === br
                          ? "accent-bg-peach border-[#FA9A85] text-slate-950"
                          : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>
            </Show>
          </div>

          <div class="mt-4">
            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-2.5 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2"
            >
              <Show when={isProcessing()} fallback={<span>Extract Audio Now</span>}>
                <span class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Processing... ({Math.round(progress() * 100)}%)</span>
              </Show>
            </button>
          </div>
        </Show>

        <Show when={statusMsg()}>
          <div class="mt-3 text-center">
            <p class="text-[11px] text-slate-400 mb-1">{statusMsg()}</p>
            <Show when={isProcessing()}>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#FA9A85] to-[#E6986C] transition-all duration-300"
                  style={{ width: `${Math.round(progress() * 100)}%` }}
                ></div>
              </div>
            </Show>
          </div>
        </Show>

        {/* Output Result */}
        <Show when={result()}>
          <div class="mt-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <div class="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckIcon class="w-4 h-4" />
              <span>Audio Extraction Complete</span>
            </div>

            <div class="max-w-md mx-auto">
              <audio controls src={result()?.url} class="w-full rounded" />
            </div>

            <a
              href={result()?.url}
              download={result()?.filename}
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs transition-all"
            >
              <DownloadIcon class="w-4 h-4" />
              <span>Download {result()?.filename}</span>
            </a>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-6" />
    </div>
  );
}
