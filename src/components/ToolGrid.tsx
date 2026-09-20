import { createSignal, For, Show } from "solid-js";
import { TOOLS_REGISTRY, CATEGORIES, type ToolMeta } from "../utils/toolsRegistry";

export default function ToolGrid() {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [activeCategory, setActiveCategory] = createSignal<string>("all");

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
    <div class="space-y-8">
      {/* Search Bar & Category Filter Controls */}
      <div class="space-y-4 max-w-4xl mx-auto">
        
        {/* Search Bar */}
        <div class="relative">
          <input
            type="text"
            placeholder="Search tools (e.g. video to mp3, pdf merge, compress, split)..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full px-5 py-4 pl-12 rounded-2xl bg-slate-900/90 border border-purple-500/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-xl backdrop-blur-xl transition-all"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </div>
          <Show when={searchQuery()}>
            <button
              onClick={() => setSearchQuery("")}
              class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800"
            >
              Clear
            </button>
          </Show>
        </div>

        {/* Category Tabs */}
        <div class="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <For each={CATEGORIES}>
            {(cat) => (
              <button
                onClick={() => setActiveCategory(cat.id)}
                class={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory() === cat.id
                    ? "gradient-bg text-white shadow-lg shadow-purple-600/25"
                    : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {cat.label}
              </button>
            )}
          </For>
        </div>

      </div>

      {/* Grid of Tools */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For
          each={filteredTools()}
          fallback={
            <div class="col-span-full text-center py-12 text-slate-400 glass-card rounded-2xl p-8">
              <div class="text-3xl mb-2">🔍</div>
              <p class="font-semibold text-white">No matching tools found</p>
              <p class="text-xs text-slate-500 mt-1">Try searching for "pdf", "video", or "audio"</p>
            </div>
          }
        >
          {(tool: ToolMeta) => (
            <a
              href={`/tools/${tool.slug}`}
              class="glass-card rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Row: Icon & Badge */}
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <Show when={tool.badge}>
                  <span class="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {tool.badge}
                  </span>
                </Show>
              </div>

              {/* Title & Description */}
              <div class="space-y-2 mb-6">
                <h3 class="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              {/* Bottom Action Row */}
              <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-semibold group-hover:text-purple-300">
                <span>Use Tool Free</span>
                <span class="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </a>
          )}
        </For>
      </div>
    </div>
  );
}
