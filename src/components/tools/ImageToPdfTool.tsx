import { createSignal, Show, For } from "solid-js";
import { imagesToPDF } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";
import { ImageIcon, DownloadIcon, CheckIcon } from "../Icons";

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
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#FA9A85] bg-slate-50 dark:bg-slate-900/40 rounded-md p-8 text-center cursor-pointer transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-[#FA9A85]/10 text-[#FA9A85] flex items-center justify-center mb-3">
              <ImageIcon class="w-6 h-6" />
            </div>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select Images to Convert to PDF</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports JPG, PNG, WebP photos & scans</p>
          </div>
        </div>

        <Show when={images().length > 0}>
          <div class="space-y-4">
            <h4 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Selected Photos ({images().length})</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              <For each={images()}>
                {(img, idx) => (
                  <div class="relative group p-2 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <img src={URL.createObjectURL(img)} alt={img.name} class="w-full h-24 object-cover rounded" />
                    <p class="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-1">{img.name}</p>
                    <button
                      onClick={() => removeImage(idx())}
                      class="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold shadow flex items-center justify-center"
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
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Creating PDF Document..." : "Convert Images to PDF"}
            </button>
          </div>
        </Show>

        <Show when={pdfUrl()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> PDF Created Successfully!
            </h4>
            <a href={pdfUrl()!} download="images_document.pdf" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm">
              <DownloadIcon class="w-4 h-4" /> Download PDF Document
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
