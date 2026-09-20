import { createSignal, Show, For } from "solid-js";
import { imagesToPDF } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";

export default function ImageToPdfTool() {
  const [images, setImages] = createSignal<File[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [pdfUrl, setPdfUrl] = createSignal<string | null>(null);

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) return;
    const list: File[] = [];
    for (let i = 0; i < filesList.length; i++) {
      if (filesList[i].type.startsWith("image/")) {
        list.push(filesList[i]);
      }
    }
    setImages((prev) => [...prev, ...list]);
    setPdfUrl(null);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompile = async () => {
    if (images().length === 0) return;

    setIsProcessing(true);
    try {
      const pdfBlob = await imagesToPDF(images());
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      alert("Error generating PDF from images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div class="space-y-2">
            <div class="text-3xl">📄</div>
            <p class="text-base font-semibold text-white">Select Images to Convert to PDF</p>
            <p class="text-xs text-slate-400">Supports JPG, PNG, WebP photos & scans</p>
          </div>
        </div>

        <Show when={images().length > 0}>
          <div class="space-y-4">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Photos ({images().length})</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              <For each={images()}>
                {(img, idx) => (
                  <div class="relative group p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <img src={URL.createObjectURL(img)} alt={img.name} class="w-full h-24 object-cover rounded-lg" />
                    <p class="text-[10px] text-slate-400 truncate mt-1">{img.name}</p>
                    <button
                      onClick={() => removeImage(idx())}
                      class="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </For>
            </div>

            <button
              onClick={handleCompile}
              disabled={isProcessing()}
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? "Creating PDF Document..." : "Convert Images to PDF"}
            </button>
          </div>
        </Show>

        <Show when={pdfUrl()}>
          <div class="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <h4 class="text-base font-bold text-emerald-300">PDF Created Successfully!</h4>
            <a href={pdfUrl()!} download="images_document.pdf" class="inline-block px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-sm shadow-lg">
              ⬇️ Download PDF Document
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
