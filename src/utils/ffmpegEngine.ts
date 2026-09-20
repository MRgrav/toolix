import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;
let loadPromise: Promise<FFmpeg> | null = null;

export interface ProgressCallback {
  (progress: number, time?: number): void;
}

export async function getFFmpegEngine(onProgress?: ProgressCallback): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) {
    if (onProgress) {
      ffmpegInstance.on("progress", ({ progress, time }) => {
        onProgress(Math.min(Math.max(progress, 0), 1), time);
      });
    }
    return ffmpegInstance;
  }

  if (loadPromise) {
    const instance = await loadPromise;
    if (onProgress) {
      instance.on("progress", ({ progress, time }) => {
        onProgress(Math.min(Math.max(progress, 0), 1), time);
      });
    }
    return instance;
  }

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    if (onProgress) {
      ffmpeg.on("progress", ({ progress, time }) => {
        onProgress(Math.min(Math.max(progress, 0), 1), time);
      });
    }

    try {
      // 1. Try loading core from public local path
      const jsPath = "/ffmpeg/ffmpeg-core.js";
      const wasmPath = "/ffmpeg/ffmpeg-core.wasm";
      
      const coreURL = await toBlobURL(jsPath, "text/javascript");
      const wasmURL = await toBlobURL(wasmPath, "application/wasm");

      await ffmpeg.load({ coreURL, wasmURL });
      isLoaded = true;
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (err) {
      console.warn("Local FFmpeg WASM load failed, switching to UNPKG CDN fallback...", err);
      
      // CDN Fallback to unpkg @ffmpeg/core 0.12.6
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");

      await ffmpeg.load({ coreURL, wasmURL });
      isLoaded = true;
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    }
  })();

  return loadPromise;
}

export async function processFFmpegCommand(
  inputFile: File,
  args: string[],
  outputFilename: string,
  outputMimeType: string,
  onProgress?: ProgressCallback
): Promise<{ blob: Blob; url: string; filename: string }> {
  const ffmpeg = await getFFmpegEngine(onProgress);

  const ext = inputFile.name.split('.').pop() || 'tmp';
  const internalInput = `input_${Date.now()}.${ext}`;
  const internalOutput = `output_${Date.now()}_${outputFilename}`;

  // Write file to virtual FS
  await ffmpeg.writeFile(internalInput, await fetchFile(inputFile));

  // Replace input placeholder in args if needed
  const finalArgs = args.map(arg => 0 ? arg : arg.replace('{input}', internalInput).replace('{output}', internalOutput));

  // Execute FFmpeg WASM command
  await ffmpeg.exec(finalArgs);

  // Read output file
  const data = await ffmpeg.readFile(internalOutput);
  
  // Cleanup virtual FS files
  try {
    await ffmpeg.deleteFile(internalInput);
    await ffmpeg.deleteFile(internalOutput);
  } catch (e) {
    // Ignore virtual FS delete warnings
  }

  const blob = new Blob([data as Uint8Array], { type: outputMimeType });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: outputFilename
  };
}
