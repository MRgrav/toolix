import { createSignal, Show } from "solid-js";
import AdSlot from "../AdSlot";
import { ImageIcon, DownloadIcon, CheckIcon } from "../Icons";

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
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#FA9A85] bg-slate-50 dark:bg-slate-900/40 rounded-md p-8 text-center cursor-pointer transition-colors">
          <input type="file" accept="image/*" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-[#FA9A85]/10 text-[#FA9A85] flex items-center justify-center mb-3">
                <ImageIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select Image to Convert & Compress</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Convert between WebP, PNG, and JPG formats</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#FA9A85]">{file()?.name} ({( (file()?.size || 0) / 1024 ).toFixed(1)} KB)</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Target Format</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { fmt: "image/webp", label: "WebP (Best)" },
                  { fmt: "image/jpeg", label: "JPG / JPEG" },
                  { fmt: "image/png", label: "PNG Lossless" }
                ].map((opt) => (
                  <button
                    onClick={() => setTargetFormat(opt.fmt as any)}
                    class={`py-2 text-xs font-bold rounded border transition-all ${
                      targetFormat() === opt.fmt
                        ? "bg-[#FA9A85] border-[#FA9A85] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Show when={targetFormat() !== "image/png"}>
              <div>
                <div class="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Compression Quality</span>
                  <span class="font-mono text-[#FA9A85] font-semibold">{quality()}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality()}
                  onInput={(e) => setQuality(Number(e.currentTarget.value))}
                  class="w-full accent-[#FA9A85] cursor-pointer"
                />
              </div>
            </Show>

            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Converting Image..." : "Convert Image Now"}
            </button>
          </div>
        </Show>

        <Show when={result()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> Image Conversion Ready!
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 font-mono">
              Original: {( (file()?.size || 0) / 1024 ).toFixed(1)} KB ➔ Converted: {( (result()?.size || 0) / 1024 ).toFixed(1)} KB
            </p>
            <div class="max-w-xs mx-auto">
              <img src={result()?.url} alt="Result" class="max-h-48 rounded mx-auto bg-slate-200 dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-800" />
            </div>
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
