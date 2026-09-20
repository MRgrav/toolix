import { createSignal, onMount, Show } from "solid-js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function VideoTool() {
  let ffmpeg: any;

  const [ready, setReady] = createSignal(false);
  const [status, setStatus] = createSignal("Initializing tool engine...");

  onMount(async () => {
    if (typeof window !== "undefined") {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      ffmpeg = new FFmpeg();

      try {
        // 1. Point to your local public/ffmpeg assets cleanly
              const jsPath = "/ffmpeg/ffmpeg-core.js";
              const wasmPath = "/ffmpeg/ffmpeg-core.wasm";

              // 2. Convert them to internal Blobs so the browser treats them with absolute security privilege
              const coreURL = await toBlobURL(jsPath, "text/javascript");
              const wasmURL = await toBlobURL(wasmPath, "application/wasm");

              // 3. Load the safe blobs into the engine
              await ffmpeg.load({
                coreURL,
                wasmURL,
              });
        setReady(true);
        setStatus("Drop a video file below to extract audio instantly.");
      } catch (err) {
        setStatus("Error loading engine. Check headers.");
      }
    }
  });

  const handleProcess = async (e: Event) => {
    if (!ffmpeg) return;
    const target = e.target as HTMLInputElement;
    if (!target.files?.[0]) return;

    const file = target.files[0];
    setStatus("Processing... This happens entirely in your browser safely.");

    // Write file to internal virtual WASM filesystem
    await ffmpeg.writeFile("input.mp4", await fetchFile(file));

    // Execute standard FFmpeg CLI instruction to strip audio to mp3
    await ffmpeg.exec(["-i", "input.mp4", "output.mp3"]);

    // Extract the file back out of the WASM file system
    const data = await ffmpeg.readFile("output.mp3");
    const url = URL.createObjectURL(new Blob([data], { type: "audio/mp3" }));

    setStatus("Done! File downloaded.");

    // Trigger local client side file download
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted_${file.name.replace(/\.[^/.]+$/, "")}.mp3`;
    link.click();
  };

  return (
    <div class="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 text-center">
      <p class="text-sm text-gray-500 mb-4">{status()}</p>
      
      <Show when={ready()}>
        <div class="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-lg p-8 cursor-pointer transition-colors relative">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleProcess} 
            class="absolute inset-0 opacity-0 cursor-pointer"
          />
          <span class="text-purple-600 font-medium">Choose a Video File</span>
        </div>
      </Show>
    </div>
  );
}
