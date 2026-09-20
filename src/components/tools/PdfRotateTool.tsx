import { createSignal, Show } from "solid-js";
import { rotatePDFPages } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";
import { RotateIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function PdfRotateTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [angle, setAngle] = createSignal<90 | 180 | 270>(90);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [rotatedUrl, setRotatedUrl] = createSignal<string | null>(null);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setFile(target.files[0]);
      setRotatedUrl(null);
    }
  };

  const handleRotate = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsProcessing(true);
    try {
      const rotatedBlob = await rotatePDFPages(currentFile, angle());
      const url = URL.createObjectURL(rotatedBlob);
      setRotatedUrl(url);
    } catch (err: any) {
      console.error(err);
      alert("Error rotating PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#E6986C] bg-slate-50 dark:bg-slate-900/40 rounded-md p-8 text-center cursor-pointer transition-colors">
          <input type="file" accept="application/pdf" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-[#E6986C]/10 text-[#E6986C] flex items-center justify-center mb-3">
                <RotateIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select PDF to Rotate Pages</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Rotate all pages clockwise by 90°, 180°, or 270°</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#E6986C]">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Select Rotation Angle</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { deg: 90, label: "90° Clockwise" },
                  { deg: 180, label: "180° Flip" },
                  { deg: 270, label: "270° Counter-CW" }
                ].map((opt) => (
                  <button
                    onClick={() => setAngle(opt.deg as any)}
                    class={`py-2.5 text-xs font-bold rounded border transition-all ${
                      angle() === opt.deg
                        ? "bg-[#E6986C] border-[#E6986C] text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRotate}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-muskmelon hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Rotating PDF Pages..." : "Rotate PDF Pages Now"}
            </button>
          </div>
        </Show>

        <Show when={rotatedUrl()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> PDF Rotated Successfully!
            </h4>
            <a href={rotatedUrl()!} download="rotated_document.pdf" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm">
              <DownloadIcon class="w-4 h-4" /> Download Rotated PDF
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
