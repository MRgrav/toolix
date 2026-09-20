import { createSignal, Show, For } from "solid-js";
import { mergePDFs } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";
import { BookOpenIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function PdfMergeTool() {
  const [files, setFiles] = createSignal<File[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [mergedUrl, setMergedUrl] = createSignal<string | null>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfList: File[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      if (newFiles[i].type.includes("pdf")) {
        pdfList.push(newFiles[i]);
      }
    }
    setFiles((prev) => [...prev, ...pdfList]);
    setMergedUrl(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const list = [...files()];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFiles(list);
  };

  const handleMerge = async () => {
    if (files().length < 2) {
      alert("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    try {
      const mergedBlob = await mergePDFs(files());
      const url = URL.createObjectURL(mergedBlob);
      setMergedUrl(url);
    } catch (err: any) {
      console.error(err);
      alert("Error merging PDF files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        
        {/* Upload Zone */}
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#E6986C] bg-slate-50 dark:bg-slate-900/40 rounded-md p-8 text-center cursor-pointer transition-colors">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-[#E6986C]/10 text-[#E6986C] flex items-center justify-center mb-3">
              <BookOpenIcon class="w-6 h-6" />
            </div>
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Choose PDF Files to Merge</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag & drop multiple PDFs or click to browse</p>
          </div>
        </div>

        {/* Selected File List */}
        <Show when={files().length > 0}>
          <div class="space-y-3">
            <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
              <span>Selected PDFs ({files().length})</span>
              <span>Reorder files before merging</span>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <For each={files()}>
                {(file, idx) => (
                  <div class="flex items-center justify-between p-3 rounded-md bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                    <div class="flex items-center gap-3 truncate">
                      <span class="font-mono text-[#E6986C] font-bold w-4">{idx() + 1}.</span>
                      <span class="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">{file.name}</span>
                      <span class="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        onClick={() => moveFile(idx(), -1)}
                        disabled={idx() === 0}
                        class="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveFile(idx(), 1)}
                        disabled={idx() === files().length - 1}
                        class="p-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeFile(idx())}
                        class="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 ml-2"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>

            <button
              onClick={handleMerge}
              disabled={isProcessing() || files().length < 2}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-muskmelon hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Merging PDFs in browser..." : `Combine ${files().length} PDF Files`}
            </button>
          </div>
        </Show>

        {/* Output */}
        <Show when={mergedUrl()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> PDFs Combined Successfully!
            </h4>
            <a
              href={mergedUrl()!}
              download="merged_document.pdf"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm"
            >
              <DownloadIcon class="w-4 h-4" /> Download Combined PDF
            </a>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
