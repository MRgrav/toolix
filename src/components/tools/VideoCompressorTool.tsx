import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";

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
    setStatusMsg("Compressing video via FFmpeg WASM...");

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
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-6 text-center cursor-pointer">
          <input type="file" accept="video/*" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div>
              <div class="text-3xl mb-2">📉</div>
              <p class="text-sm font-semibold text-white">Select video to compress</p>
              <p class="text-xs text-slate-400">Drastically reduce file size inside browser</p>
            </div>
          }>
            <p class="text-sm font-semibold text-purple-300">{file()?.name} ({( (file()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB)</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="mt-6 space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Compression Level</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { id: "high", label: "High Quality", desc: "Slight compression" },
                  { id: "medium", label: "Balanced", desc: "Recommended (~50% smaller)" },
                  { id: "low", label: "Max Compression", desc: "Smallest size (~70% smaller)" },
                ].map((p) => (
                  <button
                    onClick={() => setPreset(p.id as any)}
                    class={`p-3 rounded-xl border text-left transition-all ${
                      preset() === p.id ? "bg-purple-600/20 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div class="text-xs font-bold text-white">{p.label}</div>
                    <div class="text-[10px] text-slate-400 mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompress}
              disabled={isProcessing()}
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? `Compressing... (${Math.round(progress() * 100)}%)` : "Compress Video Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="mt-6 p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-300">Compression Complete!</h4>
            <div class="text-xs text-slate-300 font-mono">
              Original: {( (file()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB ➔ New: {( (result()?.size || 0) / (1024 * 1024) ).toFixed(2)} MB
            </div>
            <a href={result()?.url} download={result()?.filename} class="inline-block px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs">
              ⬇️ Download Compressed Video
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
