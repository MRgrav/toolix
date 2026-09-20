import { createSignal, Show } from "solid-js";
import AdSlot from "../AdSlot";

export default function ImageConverterTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [targetFormat, setTargetFormat] = createSignal<"image/webp" | "image/png" | "image/jpeg">("image/webp");
  const [quality, setQuality] = createSignal(80);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [result, setResult] = createSignal<{ url: string; filename: string; size: number } | null>(null);

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
    try {
      const img = new Image();
      img.src = URL.createObjectURL(currentFile);
      await new Promise((res) => (img.onload = res));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const formatExt = targetFormat() === "image/webp" ? "webp" : targetFormat() === "image/jpeg" ? "jpg" : "png";
      const dataUrl = canvas.toDataURL(targetFormat(), quality() / 100);
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const outputFilename = `${currentFile.name.replace(/\.[^/.]+$/, "")}_converted.${formatExt}`;
      setResult({ url, filename: outputFilename, size: blob.size });
    } catch (err: any) {
      console.error(err);
      alert("Error converting image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div>
              <div class="text-3xl mb-2">🌄</div>
              <p class="text-base font-semibold text-white">Select Image to Convert & Compress</p>
              <p class="text-xs text-slate-400">Convert between WebP, PNG, and JPG formats</p>
            </div>
          }>
            <p class="text-sm font-semibold text-purple-300">{file()?.name} ({( (file()?.size || 0) / 1024 ).toFixed(1)} KB)</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Target Format</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { fmt: "image/webp", label: "WebP (Recommended)" },
                  { fmt: "image/jpeg", label: "JPG / JPEG" },
                  { fmt: "image/png", label: "PNG Lossless" }
                ].map((opt) => (
                  <button
                    onClick={() => setTargetFormat(opt.fmt as any)}
                    class={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      targetFormat() === opt.fmt ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Show when={targetFormat() !== "image/png"}>
              <div>
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Compression Quality</span>
                  <span class="font-mono text-purple-400">{quality()}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality()}
                  onInput={(e) => setQuality(Number(e.currentTarget.value))}
                  class="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </Show>

            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? "Converting Image..." : "Convert Image Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <h4 class="text-base font-bold text-emerald-300">Image Conversion Ready!</h4>
            <p class="text-xs text-slate-300 font-mono">
              Original: {( (file()?.size || 0) / 1024 ).toFixed(1)} KB ➔ Converted: {( (result()?.size || 0) / 1024 ).toFixed(1)} KB
            </p>
            <div class="max-w-xs mx-auto">
              <img src={result()?.url} alt="Result" class="max-h-48 rounded-lg mx-auto bg-slate-950 p-2 border border-slate-800" />
            </div>
            <a href={result()?.url} download={result()?.filename} class="inline-block px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-sm shadow-lg">
              ⬇️ Download {result()?.filename}
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
