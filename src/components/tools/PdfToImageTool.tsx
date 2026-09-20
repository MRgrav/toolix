import { createSignal, Show, For } from "solid-js";
import { renderPDFPagesToImages } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";
import { ImageIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function PdfToImageTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [format, setFormat] = createSignal<"image/png" | "image/jpeg">("image/png");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [pages, setPages] = createSignal<{ pageNumber: number; dataUrl: string; blob: Blob }[]>([]);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setFile(target.files[0]);
      setPages([]);
    }
  };

  const handleConvert = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setIsProcessing(true);
    try {
      const renderedPages = await renderPDFPagesToImages(currentFile, 1.5, format());
      setPages(renderedPages);
    } catch (err: any) {
      console.error(err);
      alert("Error rendering PDF pages to images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto">
      <div class="glass-card p-6 md:p-8 rounded-md border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="relative border-2 border-dashed border-slate-300 dark:border-slate-700/60 hover:border-[#FA9A85] bg-slate-50 dark:bg-slate-900/40 rounded-md p-8 text-center cursor-pointer transition-colors">
          <input type="file" accept="application/pdf" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-[#FA9A85]/10 text-[#FA9A85] flex items-center justify-center mb-3">
                <ImageIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select PDF to Convert to Images</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Convert each PDF page into high resolution PNG or JPG</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#FA9A85]">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Output Format</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat("image/png")}
                  class={`py-2 text-xs font-bold rounded border transition-all ${
                    format() === "image/png"
                      ? "bg-[#FA9A85] border-[#FA9A85] text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  PNG Image
                </button>
                <button
                  onClick={() => setFormat("image/jpeg")}
                  class={`py-2 text-xs font-bold rounded border transition-all ${
                    format() === "image/jpeg"
                      ? "bg-[#FA9A85] border-[#FA9A85] text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  JPG Image
                </button>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-peach hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Rendering Pages to Canvas..." : "Convert PDF Pages to Images"}
            </button>
          </div>
        </Show>

        {/* Rendered Images Preview & Download Grid */}
        <Show when={pages().length > 0}>
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckIcon class="w-4 h-4 text-emerald-500" /> Extracted Page Images ({pages().length})
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
              <For each={pages()}>
                {(pg) => (
                  <div class="p-3 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
                    <img src={pg.dataUrl} alt={`Page ${pg.pageNumber}`} class="w-full h-40 object-contain rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                    <div class="flex items-center justify-between w-full text-xs text-slate-600 dark:text-slate-400">
                      <span>Page {pg.pageNumber}</span>
                      <a
                        href={pg.dataUrl}
                        download={`page_${pg.pageNumber}.${format() === "image/png" ? "png" : "jpg"}`}
                        class="px-2.5 py-1 rounded bg-[#FA9A85] text-slate-950 font-bold text-[11px] shadow-sm hover:opacity-90"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
