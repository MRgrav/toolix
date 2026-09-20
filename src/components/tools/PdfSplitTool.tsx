import { createSignal, Show } from "solid-js";
import { extractPDFPages } from "../../utils/pdfEngine";
import AdSlot from "../AdSlot";
import { FileTextIcon, DownloadIcon, CheckIcon } from "../Icons";

export default function PdfSplitTool() {
  const [file, setFile] = createSignal<File | null>(null);
  const [pageRange, setPageRange] = createSignal("1-3");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [resultUrl, setResultUrl] = createSignal<string | null>(null);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setFile(target.files[0]);
      setResultUrl(null);
    }
  };

  const parsePageNumbers = (str: string): number[] => {
    const pages: number[] = [];
    const parts = str.split(",").map((p) => p.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) pages.push(i);
        }
      } else {
        const num = Number(part);
        if (!isNaN(num)) pages.push(num);
      }
    }
    return pages;
  };

  const handleSplit = async () => {
    const currentFile = file();
    if (!currentFile) return;

    const targets = parsePageNumbers(pageRange());
    if (targets.length === 0) {
      alert("Please enter valid page numbers (e.g. 1-3, 5, 8).");
      return;
    }

    setIsProcessing(true);
    try {
      const splitBlob = await extractPDFPages(currentFile, targets);
      const url = URL.createObjectURL(splitBlob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error splitting PDF pages.");
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
                <FileTextIcon class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Select PDF to Split & Extract Pages</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Extract page ranges or individual pages</p>
            </div>
          }>
            <p class="text-xs font-semibold text-[#E6986C]">{file()?.name}</p>
          </Show>
        </div>

        <Show when={file()}>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Enter Page Numbers to Extract</label>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-10"
                value={pageRange()}
                onInput={(e) => setPageRange(e.currentTarget.value)}
                class="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
              />
              <p class="text-[11px] text-slate-500 mt-1">Use hyphens for ranges (1-4) and commas for separate pages (1, 3, 5)</p>
            </div>

            <button
              onClick={handleSplit}
              disabled={isProcessing()}
              class="w-full py-3 rounded-md font-bold text-slate-950 accent-bg-muskmelon hover:opacity-90 disabled:opacity-50 transition-all text-xs shadow-sm"
            >
              {isProcessing() ? "Extracting Pages..." : "Extract Pages Now"}
            </button>
          </div>
        </Show>

        <Show when={resultUrl()}>
          <div class="p-5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <h4 class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckIcon class="w-4 h-4" /> Pages Extracted!
            </h4>
            <a href={resultUrl()!} download="extracted_pages.pdf" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-xs shadow-sm">
              <DownloadIcon class="w-4 h-4" /> Download Extracted PDF
            </a>
          </div>
        </Show>
      </div>
      <AdSlot format="horizontal" class="mt-8" />
    </div>
  );
}
