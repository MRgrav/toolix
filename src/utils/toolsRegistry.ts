export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'video-audio' | 'pdf' | 'image';
  categoryLabel: string;
  icon: string;
  badge?: string;
  keywords: string[];
  features: string[];
}

export const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'video-audio', label: 'Video & Audio' },
  { id: 'pdf', label: 'PDF Utilities' },
  { id: 'image', label: 'Image Tools' }
] as const;

export const TOOLS_REGISTRY: ToolMeta[] = [
  {
    id: 'video-to-audio',
    slug: 'video-to-audio',
    name: 'Video to Audio Extractor',
    description: 'Extract high-quality MP3, WAV, or AAC audio tracks from any video file 100% in your browser using WASM.',
    category: 'video-audio',
    categoryLabel: 'Video & Audio',
    icon: '🎵',
    badge: 'Popular',
    keywords: ['video to mp3', 'extract audio', 'mp4 to mp3', 'audio converter', 'ffmpeg wasm'],
    features: [
      'Extract MP3, WAV, or AAC audio formats',
      'Supports MP4, WebM, MOV, AVI, MKV formats',
      '100% Client-side processing - files never leave your device',
      'Bitrate quality customization (128k - 320k)'
    ]
  },
  {
    id: 'video-trimmer',
    slug: 'video-trimmer',
    name: 'Video Trimmer & Cutter',
    description: 'Cut and trim video segments easily with precise start and end time controls.',
    category: 'video-audio',
    categoryLabel: 'Video & Audio',
    icon: '✂️',
    keywords: ['trim video', 'cut video', 'crop mp4', 'video editor'],
    features: [
      'Precise start and end timestamp trimming',
      'Fast client-side rendering with FFmpeg WASM',
      'Maintains original video quality',
      'Instant download preview'
    ]
  },
  {
    id: 'video-compressor',
    slug: 'video-compressor',
    name: 'Video Compressor',
    description: 'Reduce video file sizes drastically while maintaining crisp visual quality.',
    category: 'video-audio',
    categoryLabel: 'Video & Audio',
    icon: '📉',
    badge: 'WASM',
    keywords: ['compress video', 'reduce mp4 size', 'video shrink', 'ffmpeg compression'],
    features: [
      'Select compression presets (Small, Medium, High Quality)',
      'Adjust resolution output (1080p, 720p, 480p)',
      'No file size caps or artificial limits',
      'Fast browser-based processing'
    ]
  },
  {
    id: 'video-converter',
    slug: 'video-converter',
    name: 'Video Format Converter',
    description: 'Convert videos seamlessly between MP4, WebM, GIF, AVI, and MKV formats.',
    category: 'video-audio',
    categoryLabel: 'Video & Audio',
    icon: '🔄',
    keywords: ['convert video', 'mp4 to webm', 'mp4 to gif', 'video format converter'],
    features: [
      'Convert MP4 to GIF animation clips',
      'Convert WebM to MP4 for wider compatibility',
      'Batch configuration support',
      'High-performance WASM video encoder'
    ]
  },
  {
    id: 'pdf-merge',
    slug: 'pdf-merge',
    name: 'PDF Merger',
    description: 'Combine multiple PDF documents into a single organized PDF file instantly.',
    category: 'pdf',
    categoryLabel: 'PDF Utilities',
    icon: '📚',
    badge: 'Popular',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf binder'],
    features: [
      'Drag-and-drop multiple PDF files',
      'Reorder files before merging',
      'Preserves original quality, fonts, and images',
      'Zero server upload - total privacy guarantee'
    ]
  },
  {
    id: 'pdf-split',
    slug: 'pdf-split',
    name: 'PDF Splitter & Page Extractor',
    description: 'Separate pages from a PDF or split documents into individual single-page files.',
    category: 'pdf',
    categoryLabel: 'PDF Utilities',
    icon: '📑',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf pages'],
    features: [
      'Extract specific page ranges (e.g. 1-3, 5, 8-10)',
      'Split PDF into individual single pages',
      'Fast client-side execution with pdf-lib',
      'Instant ZIP download package for multi-page splits'
    ]
  },
  {
    id: 'pdf-to-image',
    slug: 'pdf-to-image',
    name: 'PDF to Image Converter',
    description: 'Convert PDF pages into high-resolution PNG or JPG image files with live previews.',
    category: 'pdf',
    categoryLabel: 'PDF Utilities',
    icon: '🖼️',
    badge: 'New',
    keywords: ['pdf to png', 'pdf to jpg', 'pdf image extractor', 'render pdf canvas'],
    features: [
      'Convert every page into PNG or JPG images',
      'Adjust image resolution rendering scale (1x, 2x, 3x)',
      'Interactive canvas thumbnail visualizer',
      'Download individual images or bundled ZIP'
    ]
  },
  {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    name: 'Images to PDF Converter',
    description: 'Turn your photos, PNGs, and JPGs into a polished PDF document.',
    category: 'pdf',
    categoryLabel: 'PDF Utilities',
    icon: '📄',
    keywords: ['jpg to pdf', 'png to pdf', 'convert images to pdf', 'photo pdf binder'],
    features: [
      'Support for JPG, PNG, and WebP images',
      'Custom page orientation (Auto, Portrait, Landscape)',
      'Adjust page margin and image fit options',
      'Reorder images dynamically before conversion'
    ]
  },
  {
    id: 'pdf-rotate',
    slug: 'pdf-rotate',
    name: 'PDF Page Rotator',
    description: 'Rotate upside-down or sideways PDF pages 90°, 180°, or 270° clockwise.',
    category: 'pdf',
    categoryLabel: 'PDF Utilities',
    icon: '🔄',
    keywords: ['rotate pdf', 'turn pdf pages', 'fix upside down pdf'],
    features: [
      'Rotate all pages or individual target pages',
      'Choose 90°, 180°, 270° orientation adjustments',
      'Instant saving without quality loss',
      'Lightweight client-side processing'
    ]
  },
  {
    id: 'image-converter',
    slug: 'image-converter',
    name: 'Image Converter & Compressor',
    description: 'Convert and compress photos between WebP, PNG, JPG, and AVIF formats.',
    category: 'image',
    categoryLabel: 'Image Tools',
    icon: '🌄',
    keywords: ['compress image', 'png to webp', 'jpg to webp', 'image size reducer'],
    features: [
      'Convert between PNG, JPG, WebP formats',
      'Adjust compression quality slider (1% - 100%)',
      'Resize dimensions on-the-fly',
      'Live before & after file size comparison'
    ]
  }
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS_REGISTRY.find(tool => tool.slug === slug);
}
