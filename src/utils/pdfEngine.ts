import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Merge multiple PDF files into one combined PDF Document
 */
export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Extract target pages from a PDF document
 * targetPages is 1-indexed (e.g. [1, 2, 5])
 */
export async function extractPDFPages(file: File, targetPages: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // Convert 1-indexed to 0-indexed and validate
  const pageIndices = targetPages
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < pdf.getPageCount());

  if (pageIndices.length === 0) {
    throw new Error('No valid page numbers provided.');
  }

  const copiedPages = await newPdf.copyPages(pdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Convert images (PNG, JPG, WebP) into a PDF document
 */
export async function imagesToPDF(
  files: File[],
  options: { margin?: number; fitPage?: boolean } = {}
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const margin = options.margin ?? 20;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type.includes('png')) {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // Fallback: draw non-standard image formats onto HTML canvas to export standard PNG buffer
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = await loadImageFromFile(file);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const pngRes = await fetch(pngUrl);
      const pngBuffer = await pngRes.arrayBuffer();
      image = await pdfDoc.embedPng(pngBuffer);
    }

    const { width, height } = image;
    const page = pdfDoc.addPage([width + margin * 2, height + margin * 2]);
    page.drawImage(image, {
      x: margin,
      y: margin,
      width: width,
      height: height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Rotate PDF pages by 90, 180, or 270 degrees clockwise
 */
export async function rotatePDFPages(file: File, angleDegrees: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angleDegrees) % 360));
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Helper to load an Image element from a File object
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Dynamically render PDF pages to HTML5 Canvas and get Image Data URLs using pdfjs-dist
 */
export async function renderPDFPagesToImages(
  file: File,
  scale: number = 1.5,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
  // Dynamically import pdfjs-dist on client side
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source URL
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const results: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL(format, 0.92);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      results.push({ pageNumber: i, dataUrl, blob });
    }
  }

  return results;
}
