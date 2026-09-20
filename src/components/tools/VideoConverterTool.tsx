import { createSignal, Show } from "solid-js";
import { processFFmpegCommand } from "../../utils/ffmpegEngine";
import AdSlot from "../AdSlot";

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
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-6 text-center cursor-pointer">
          <input type="file" accept="video/*" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div>
              <div class="text-3xl mb-2">🔄</div>
              <p class="text-sm font-semibold text-white">Select video to convert format</p>
              <p class="text-xs text-slate-400">Convert between MP4, WebM, GIF, AVI</p>
            </div>
          }>
            <p class="text-sm font-semibold text-purple-300">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="mt-6 space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Target Output Format</label>
              <div class="grid grid-cols-4 gap-2">
                {(["mp4", "webm", "gif", "avi"] as const).map((fmt) => (
                  <button
                    onClick={() => setTargetFormat(fmt)}
                    class={`py-2 text-xs font-bold rounded-lg uppercase border transition-all ${
                      targetFormat() === fmt ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
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
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? `Converting... (${Math.round(progress() * 100)}%)` : "Convert Format Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="mt-6 p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-300">Conversion Successful!</h4>
            <a href={result()?.url} download={result()?.filename} class="inline-block px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs">
              ⬇️ Download {result()?.filename}
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
