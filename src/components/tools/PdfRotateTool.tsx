import { createSignal, Show } from "solid-js";
import { rotatePDFPages } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";

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
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer">
          <input type="file" accept="application/pdf" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div>
              <div class="text-3xl mb-2">🔄</div>
              <p class="text-base font-semibold text-white">Select PDF to Rotate Pages</p>
              <p class="text-xs text-slate-400">Rotate all pages clockwise by 90°, 180°, or 270°</p>
            </div>
          }>
            <p class="text-sm font-semibold text-purple-300">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Select Rotation Angle</label>
              <div class="grid grid-cols-3 gap-3">
                {[
                  { deg: 90, label: "90° Clockwise" },
                  { deg: 180, label: "180° Flip" },
                  { deg: 270, label: "270° Counter-Clockwise" }
                ].map((opt) => (
                  <button
                    onClick={() => setAngle(opt.deg as any)}
                    class={`py-3 text-xs font-bold rounded-xl border transition-all ${
                      angle() === opt.deg ? "bg-purple-600 border-purple-500 text-white shadow-lg" : "bg-slate-900 border-slate-800 text-slate-400"
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
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? "Rotating PDF Pages..." : "Rotate PDF Pages Now"}
            </button>
          </div>
        </Show>

        <Show when={rotatedUrl()}>
          <div class="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <h4 class="text-base font-bold text-emerald-300">PDF Rotated Successfully!</h4>
            <a href={rotatedUrl()!} download="rotated_document.pdf" class="inline-block px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-sm shadow-lg">
              ⬇️ Download Rotated PDF
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
