<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { route, type RouteId } from '$lib/stores/route.svelte';

  const items: { id: RouteId; label: string; icon: string }[] = [
    { id: 'today',    label: 'Today',    icon: '◐' },
    { id: 'habits',   label: 'Habits',   icon: '◎' },
    { id: 'tasks',    label: 'Tasks',    icon: '☑' },
    { id: 'journal',  label: 'Journal',  icon: '✎' },
    { id: 'notes',    label: 'Notes',    icon: '❐' },
    { id: 'goals',    label: 'Goals',    icon: '◇' },
    { id: 'insights', label: 'Insights', icon: '◈' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];
</script>

<GlassPanel variant="strong" padding="p-3" class="w-[220px] h-full flex flex-col">
  <div class="flex items-center gap-2 px-3 pt-3 pb-6">
    <div class="w-7 h-7 rounded-full glass-sm glass flex items-center justify-center text-xs">◉</div>
    <span class="text-sm font-medium tracking-[0.2em] text-white/90">AURA</span>
  </div>

  <nav class="flex flex-col gap-0.5 flex-1">
    {#each items as item}
      <button
        onclick={() => route.go(item.id)}
        class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
               {route.current === item.id
                 ? 'bg-white/10 text-white'
                 : 'text-white/55 hover:text-white/90 hover:bg-white/5'}"
      >
        <span class="w-4 text-center text-base opacity-70">{item.icon}</span>
        <span class="tracking-wide">{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="flex items-center gap-3 px-3 pt-4 border-t border-white/5">
    <div class="w-8 h-8 rounded-full glass-strong flex items-center justify-center text-xs">A</div>
    <div class="flex flex-col">
      <span class="text-xs text-white/85">Ali</span>
      <span class="text-[10px] text-white/40">Free plan</span>
    </div>
  </div>
</GlassPanel>
