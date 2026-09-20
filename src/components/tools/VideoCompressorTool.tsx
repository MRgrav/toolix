import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";
import { CompressIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function VideoCompressorTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [preset, setPreset] = createSignal<"high" | "medium" | "low">("medium");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [statusMsg, setStatusMsg] = createSignal("");
  const [result, setResult] = createSignal<{ url: string; filename: string; size: number } | null>(null);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setFile(target.files[0]);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsProcessing(true);
    setProgress(0.05);
    setStatusMsg("Compressing video...");

    try {
      const crfValue = preset() === "low" ? "32" : preset() === "medium" ? "28" : "24";
      const outputFilename = `${currentFile.name.replace(/\.[^/.]+$/, "")}_compressed.mp4`;

      const ffmpegArgs = [
        "-i", "{input}",
        "-vcodec", "libx264",
        "-crf", crfValue,
        "-preset", "ultrafast",
        "-acodec", "aac",
        "{output}"
      ];

      const res = await processFFmpegCommand(
        currentFile,
        ffmpegArgs,
        outputFilename,
        "video/mp4",
        (p) => setProgress(Math.max(0.1, p))
      );

      setResult({ url: res.url, filename: res.filename, size: res.blob.size });
      setStatusMsg("Compression complete!");
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Error during video compression.");
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
                <CompressIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select video to compress</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Drastically reduce file size inside browser</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#FA9A85]">{file()?.name} ({( (file()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB)</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Compression Level</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { id: "high", label: "High Quality", desc: "Slight compression" },
                  { id: "medium", label: "Balanced", desc: "Recommended (~50% smaller)" },
                  { id: "low", label: "Max Compression", desc: "Smallest size (~70% smaller)" },
                ].map((p) => (
                  <button
                    onClick={() => setPreset(p.id as any)}
                    class={`p-3 rounded-md border text-left transition-all ${
                      preset() === p.id
                        ? "bg-[#FA9A85] border-[#FA9A85] text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div class="text-xs font-bold">{p.label}</div>
                    <div class="text-[10px] opacity-80 mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompress}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? `Compressing... (${Math.round(progress() * 100)}%)` : "Compress Video Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> Compression Complete!
            </h4>
            <div class="text-xs text-slate-600 dark:text-slate-300 font-mono">
              Original: {( (file()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB ➔ New: {( (result()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB
            </div>
            <a href={result()?.url} download={result()?.filename} class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm">
              <DownloadIcon class="w-4 h-4" /> Download Compressed Video
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
