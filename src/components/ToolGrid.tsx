import { createSignal, For, Show } from "solid-js";
import { TOOLS_REGISTRY, CATEGORIES, type ToolMeta } from "../utils/toolsRegistry";
import { 
  MusicIcon, 
  ScissorsIcon, 
  CompressIcon, 
  RefreshIcon, 
  BookOpenIcon, 
  FileTextIcon, 
  ImageIcon, 
  RotateIcon,
  SearchIcon 
} from "./Icons";

export default function ToolGrid() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [activeCategory, setActiveCategory] = createSignal<string>("all");

  const renderIcon = (iconName: ToolMeta['iconName']) => {
    switch (iconName) {
      case 'music': return <MusicIcon class="w-5 h-5 text-[#FA9A85]" />;
      case 'scissors': return <ScissorsIcon class="w-5 h-5 text-[#E6986C]" />;
      case 'compress': return <CompressIcon class="w-5 h-5 text-[#B0A6DF]" />;
      case 'refresh': return <RefreshIcon class="w-5 h-5 text-[#E6986C]" />;
      case 'book': return <BookOpenIcon class="w-5 h-5 text-[#FA9A85]" />;
      case 'file': return <FileTextIcon class="w-5 h-5 text-[#E6986C]" />;
      case 'image': return <ImageIcon class="w-5 h-5 text-[#B0A6DF]" />;
      case 'rotate': return <RotateIcon class="w-5 h-5 text-[#FA9A85]" />;
      default: return <FileTextIcon class="w-5 h-5 text-[#FA9A85]" />;
    }
  };

  const filteredTools = () => {
    return TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory = activeCategory() === "all" || tool.category === activeCategory();
      const q = searchQuery().toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  };

  return (
    <div class="space-y-6">
      {/* Search Bar & Category Filter Controls */}
      <div class="space-y-3 max-w-4xl mx-auto">
        
        {/* Search Bar */}
        <div class="relative">
          <input
            type="text"
            placeholder="Search tools (e.g. video to mp3, pdf merge, compress, split)..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full px-4 py-3 pl-10 rounded-md bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-[#FA9A85] shadow-sm transition-all"
          />
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon class="w-4 h-4" />
          </div>
          <Show when={searchQuery()}>
            <button
              onClick={() => setSearchQuery("")}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800"
            >
              Clear
            </button>
          </Show>
        </div>

        {/* Category Tabs */}
        <div class="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <For each={CATEGORIES}>
            {(cat) => (
              <button
                onClick={() => setActiveCategory(cat.id)}
                class={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory() === cat.id
                    ? "accent-bg-peach text-slate-950 font-bold shadow-sm"
                    : "bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            )}
          </For>
        </div>

      </div>

      {/* Grid of Tools */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For
          each={filteredTools()}
          fallback={
            <div class="col-span-full text-center py-10 text-slate-500 dark:text-slate-400 glass-card rounded-md p-6">
              <p class="font-bold text-slate-900 dark:text-white text-sm">No matching tools found</p>
              <p class="text-xs text-slate-500 mt-1">Try searching for "pdf", "video", or "audio"</p>
            </div>
          }
        >
          {(tool: ToolMeta) => (
            <a
              href={`/tools/${tool.slug}`}
              class="glass-card rounded-md p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Row: Icon & Badge */}
              <div class="flex items-start justify-between mb-3">
                <div class="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {renderIcon(tool.iconName)}
                </div>
                <Show when={tool.badge}>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FA9A85]/20 text-[#FA9A85] border border-[#FA9A85]/30">
                    {tool.badge}
                  </span>
                </Show>
              </div>

              {/* Title & Description */}
              <div class="space-y-1.5 mb-4">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#FA9A85] transition-colors">
                  {tool.name}
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              {/* Bottom Action Row */}
              <div class="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-[#FA9A85] font-semibold">
                <span>Open Tool</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          )}
        </For>
      </div>
    </div>
  );
}
