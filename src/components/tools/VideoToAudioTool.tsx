import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";

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
      } else {
        alert("Please drop a valid video file.");
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
    setStatusMsg("Initializing WASM Engine & Reading Video...");

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

      setStatusMsg("Extracting Audio via WASM...");
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
      setStatusMsg("Audio extraction complete!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Error during audio extraction. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      {/* Container */}
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
        
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          class={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            file() ? "border-purple-500 bg-purple-500/10" : "border-slate-700 hover:border-purple-400 bg-slate-900/40"
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
              <div class="space-y-3">
                <div class="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  🎵
                </div>
                <div>
                  <p class="text-base font-semibold text-white">Drag & drop video here or click to browse</p>
                  <p class="text-xs text-slate-400 mt-1">Supports MP4, WebM, MOV, AVI, MKV (Unlimited File Size)</p>
                </div>
              </div>
            }
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 text-left">
                <div class="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg">
                  🎬
                </div>
                <div>
                  <p class="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">{file()?.name}</p>
                  <p class="text-xs text-slate-400">{((file()?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                }}
                class="px-3 py-1 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Change File
              </button>
            </div>
          </Show>
        </div>

        {/* Options */}
        <Show when={file()}>
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Output Format</label>
              <div class="grid grid-cols-3 gap-2">
                {(["mp3", "wav", "aac"] as const).map((fmt) => (
                  <button
                    onClick={() => setFormat(fmt)}
                    class={`py-2 text-xs font-semibold rounded-lg uppercase border transition-all ${
                      format() === fmt
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <Show when={format() !== "wav"}>
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1.5">Bitrate Quality</label>
                <div class="grid grid-cols-3 gap-2">
                  {(["128k", "192k", "320k"] as const).map((br) => (
                    <button
                      onClick={() => setBitrate(br)}
                      class={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        bitrate() === br
                          ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>
            </Show>
          </div>

          {/* Action Button */}
          <div class="mt-6">
            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Show when={isProcessing()} fallback={<span>Extract Audio Now</span>}>
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Processing WASM... ({Math.round(progress() * 100)}%)</span>
              </Show>
            </button>
          </div>
        </Show>

        {/* Progress status */}
        <Show when={statusMsg()}>
          <div class="mt-4 text-center">
            <p class="text-xs text-slate-400 mb-2">{statusMsg()}</p>
            <Show when={isProcessing()}>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.round(progress() * 100)}%` }}
                ></div>
              </div>
            </Show>
          </div>
        </Show>

        {/* Output Result */}
        <Show when={result()}>
          <div class="mt-6 p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <div>
              <h4 class="text-base font-bold text-emerald-300">Extraction Complete!</h4>
              <p class="text-xs text-slate-400 mt-1">Your audio file is ready for download.</p>
            </div>

            {/* Audio Preview */}
            <div class="max-w-md mx-auto">
              <audio controls src={result()?.url} class="w-full rounded-lg" />
            </div>

            <a
              href={result()?.url}
              download={result()?.filename}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all text-sm"
            >
              ⬇️ Download {result()?.filename}
            </a>
          </div>
        </Show>

      </div>

      {/* Embedded AdSlot */}
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
