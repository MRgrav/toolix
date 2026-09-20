import { createSignal, Show, For } from "solid-js";
import { renderPDFPagesToImages } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";

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
      <div class="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div class="relative border-2 border-dashed border-slate-700 hover:border-purple-400 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer">
          <input type="file" accept="application/pdf" onChange={handleFileSelect} class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <Show when={file()} fallback={
            <div>
              <div class="text-3xl mb-2">🖼️</div>
              <p class="text-base font-semibold text-white">Select PDF to Convert to Images</p>
              <p class="text-xs text-slate-400">Convert each PDF page into high resolution PNG or JPG</p>
            </div>
          }>
            <p class="text-sm font-semibold text-purple-300">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-2">Output Format</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat("image/png")}
                  class={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    format() === "image/png" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  PNG Image
                </button>
                <button
                  onClick={() => setFormat("image/jpeg")}
                  class={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    format() === "image/jpeg" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  JPG Image
                </button>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing()}
              class="w-full py-3.5 rounded-xl font-bold text-white gradient-bg shadow-lg shadow-purple-600/30 hover:opacity-95 disabled:opacity-50 transition-all text-sm"
            >
              {isProcessing() ? "Rendering Pages to Canvas..." : "Convert PDF Pages to Images"}
            </button>
          </div>
        </Show>

        {/* Rendered Images Preview & Download Grid */}
        <Show when={pages().length > 0}>
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-white">Extracted Page Images ({pages().length})</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
              <For each={pages()}>
                {(pg) => (
                  <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
                    <img src={pg.dataUrl} alt={`Page ${pg.pageNumber}`} class="w-full h-40 object-contain rounded bg-slate-950 border border-slate-800" />
                    <div class="flex items-center justify-between w-full text-xs text-slate-400">
                      <span>Page {pg.pageNumber}</span>
                      <a
                        href={pg.dataUrl}
                        download={`page_${pg.pageNumber}.${format() === "image/png" ? "png" : "jpg"}`}
                        class="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px]"
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
