import { createSignal, Show, For } from "solid-js";
import { mergePDFs } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";

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
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        
        {/* Upload Zone */}
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFiles(e.currentTarget.files)}
            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div class="space-y-2">
            <div class="text-3xl">📚</div>
            <p class="text-base font-semibold text-white">Choose PDF Files to Merge</p>
            <p class="text-xs text-slate-400">Drag & drop multiple PDFs or click to browse</p>
          </div>
        </div>

        {/* Selected File List */}
        <Show when={files().length > 0}>
          <div class="space-y-3">
            <div class="flex justify-between items-center text-xs text-slate-400">
              <span>Selected PDFs ({files().length})</span>
              <span>Reorder files before merging</span>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <For each={files()}>
                {(file, idx) => (
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div class="flex items-center gap-3 truncate">
                      <span class="font-mono text-purple-400 font-bold w-4">{idx() + 1}.</span>
                      <span class="font-semibold text-white truncate max-w-xs">{file.name}</span>
                      <span class="text-slate-500 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        onClick={() => moveFile(idx(), -1)}
                        disabled={idx() === 0}
                        class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveFile(idx(), 1)}
                        disabled={idx() === files().length - 1}
                        class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeFile(idx())}
                        class="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 ml-2"
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
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? "Merging PDFs in browser..." : `Combine ${files().length} PDF Files`}
            </button>
          </div>
        </Show>

        {/* Output */}
        <Show when={mergedUrl()}>
          <div class="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <h4 class="text-base font-bold text-emerald-300">PDFs Combined Successfully!</h4>
            <a
              href={mergedUrl()!}
              download="merged_document.pdf"
              class="inline-block px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-sm shadow-lg"
            >
              ⬇️ Download Combined PDF
            </a>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
