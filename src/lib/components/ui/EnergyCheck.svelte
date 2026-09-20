<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { energy } from '$lib/stores/energy.svelte';

  const LEVELS = [
    { v: 1, icon: '😴', label: 'خسته' },
    { v: 2, icon: '😕', label: 'کم' },
    { v: 3, icon: '😐', label: 'متوسط' },
    { v: 4, icon: '🙂', label: 'خوب' },
    { v: 5, icon: '🚀', label: 'اوج' },
  ];

  let hidden = $state(false);

  const current = $derived(energy.today);
  const showCard = $derived(!hidden && current === null);
</script>

{#if showCard}
  <GlassPanel padding="p-4">
    <div class="flex items-center gap-3">
      <span class="text-xs uppercase tracking-widest text-white/40">Energy</span>
      <span class="text-xs text-white/35">الان چقدر انرژی داری؟</span>
      <span class="flex-1"></span>
      <button
        onclick={() => hidden = true}
        class="text-xs text-white/30 hover:text-white/60 transition-colors"
      >×</button>
    </div>

    <div class="flex gap-2 mt-3">
      {#each LEVELS as l}
        <button
          onclick={() => energy.set(l.v)}
          class="flex-1 glass glass-sm py-2.5 flex flex-col items-center gap-1 hover:bg-white/8 transition-colors"
        >
          <span class="text-xl">{l.icon}</span>
          <span class="text-[10px] text-white/45">{l.label}</span>
        </button>
      {/each}
    </div>
  </GlassPanel>
{/if}

{#if current !== null}
  <GlassPanel padding="p-4">
    <div class="flex items-center gap-3">
      <span class="text-xs uppercase tracking-widest text-white/40">Energy</span>
      <span class="text-base">{LEVELS[current - 1].icon}</span>
      <span class="text-xs text-white/70">{LEVELS[current - 1].label}</span>
      <span class="flex-1"></span>
      <button
        onclick={() => energy.clear()}
        class="text-[10px] text-white/30 hover:text-white/60 transition-colors"
      >تغییر</button>
    </div>
  </GlassPanel>
{/if}
