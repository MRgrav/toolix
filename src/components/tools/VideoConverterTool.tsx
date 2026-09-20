import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";
import { RefreshIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function VideoConverterTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [targetFormat, setTargetFormat] = createSignal<"mp4" | "webm" | "gif" | "avi">("mp4");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [result, setResult] = createSignal<{ url: string; filename: string } | null>(null);

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

    try {
      const fmt = targetFormat();
      const outputFilename = `${currentFile.name.replace(/\.[^/.]+$/, "")}.${fmt}`;
      const mime = fmt === "gif" ? "image/gif" : `video/${fmt}`;

      let ffmpegArgs: string[] = [];
      if (fmt === "gif") {
        ffmpegArgs = ["-i", "{input}", "-vf", "fps=10,scale=480:-1:flags=lanczos", "{output}"];
      } else if (fmt === "webm") {
        ffmpegArgs = ["-i", "{input}", "-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-b:a", "128k", "-c:a", "libopus", "{output}"];
      } else {
        ffmpegArgs = ["-i", "{input}", "-c:v", "libx264", "-c:a", "aac", "{output}"];
      }

      const res = await processFFmpegCommand(
        currentFile,
        ffmpegArgs,
        outputFilename,
        mime,
        (p) => setProgress(Math.max(0.1, p))
      );

      setResult({ url: res.url, filename: res.filename });
    } catch (err: any) {
      console.error(err);
      alert("Error converting video format.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#FA9A85] bg-slate-50 dark:bg-slate-900/40 rounded-md p-6 text-center cursor-pointer transition-colors">
          <input type="file" accept="video/*" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-[#FA9A85]/10 text-[#FA9A85] flex items-center justify-center mb-3">
                <RefreshIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select video to convert format</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Convert between MP4, WebM, GIF, AVI</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#FA9A85]">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Target Output Format</label>
              <div class="grid grid-cols-4 gap-2">
                {(["mp4", "webm", "gif", "avi"] as const).map((fmt) => (
                  <button
                    onClick={() => setTargetFormat(fmt)}
                    class={`py-2 text-xs font-bold rounded uppercase border transition-all ${
                      targetFormat() === fmt
                        ? "bg-[#FA9A85] border-[#FA9A85] text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? `Converting... (${Math.round(progress() * 100)}%)` : "Convert Format Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> Conversion Successful!
            </h4>
            <a href={result()?.url} download={result()?.filename} class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm">
              <DownloadIcon class="w-4 h-4" /> Download {result()?.filename}
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
