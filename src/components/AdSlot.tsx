import { onMount, createSignal, Show } from 'solid-js';

interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  class?: string;
}

export default function AdSlot(props: AdSlotProps) {
  const [adLoaded, setAdLoaded] = createSignal(false);

  const adClient = () => props.client || 'ca-pub-0000000000000000'; // Default placeholder client ID
  const isProductionAd = () => adClient() !== 'ca-pub-0000000000000000' && !!props.slot;

  onMount(() => {
    if (isProductionAd()) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.warn('AdSense load error:', err);
      }
    }
  });

  return (
    <div class={`my-6 text-center overflow-hidden rounded-xl ${props.class || ''}`}>
      <Show
        when={isProductionAd()}
        fallback={
          <div class="p-4 border border-dashed border-purple-900/40 bg-purple-950/10 rounded-xl flex flex-col items-center justify-center min-h-[90px] text-xs text-purple-400/70">
            <span class="font-mono text-[10px] uppercase tracking-wider text-purple-400 mb-1">AdSense Placement Slot</span>
            <span>Format: {props.format || 'auto'} • Non-intrusive Client-side Ads</span>
          </div>
        }
      >
        <ins
          class="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient()}
          data-ad-slot={props.slot}
          data-ad-format={props.format || 'auto'}
          data-full-width-responsive={props.responsive !== false ? 'true' : 'false'}
        />
      </Show>
    </div>
  );
}
