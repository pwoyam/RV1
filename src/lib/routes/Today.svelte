<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';

  const tasks = [
    { done: true,  title: 'Deep work — طراحی معماری پروژه', time: '09:00' },
    { done: true,  title: 'جلسه با تیم محصول',              time: '11:30' },
    { done: false, title: 'مطالعه ۳۰ صفحه از کتاب',          time: '14:00' },
    { done: false, title: 'ورزش — برنامه پا و شکم',          time: '18:00' },
  ];

  const areas = [
    { name: 'Mind',   pct: 72 },
    { name: 'Health', pct: 85 },
    { name: 'Money',  pct: 40 },
    { name: 'Love',   pct: 90 },
    { name: 'Craft',  pct: 66 },
  ];
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6" class="flex items-center justify-between">
    <div>
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Today</p>
      <h1 class="text-3xl font-light tracking-tight text-white mt-1">Good morning, Ali</h1>
    </div>
    <div class="text-right">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Life Score</p>
      <p class="text-3xl font-light text-white mt-1">82<span class="text-white/30 text-lg">/100</span></p>
    </div>
  </GlassPanel>

  <div class="grid grid-cols-3 gap-3 flex-1 min-h-0">
    <GlassPanel padding="p-5" class="col-span-2 overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Life Areas</p>
      <div class="flex flex-wrap gap-2">
        {#each areas as a}
          <div class="glass glass-sm flex items-center gap-2 px-3 py-1.5 text-xs text-white/85">
            <span class="w-1.5 h-1.5 rounded-full bg-white/70"></span>
            <span>{a.name}</span>
            <span class="text-white/40">{a.pct}%</span>
          </div>
        {/each}
      </div>
    </GlassPanel>

    <GlassPanel padding="p-5" class="overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Mood</p>
      <div class="flex gap-2">
        {#each [1,2,3,4,5] as i}
          <div class="flex-1 aspect-square rounded-full glass glass-sm flex items-center justify-center
                      {i === 4 ? 'ring-1 ring-white/40' : 'opacity-60'} text-xs">
            {i}
          </div>
        {/each}
      </div>
    </GlassPanel>

    <GlassPanel padding="p-5" class="col-span-3 overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Today's Focus</p>
      <ul class="flex flex-col divide-y divide-white/5">
        {#each tasks as t}
          <li class="flex items-center gap-3 py-3">
            <div class="w-4 h-4 rounded-md border {t.done
              ? 'bg-white/90 border-white/90'
              : 'border-white/25'} flex items-center justify-center text-[10px] text-black">
              {t.done ? '✓' : ''}
            </div>
            <span class="flex-1 text-sm {t.done ? 'text-white/35 line-through' : 'text-white/90'}">
              {t.title}
            </span>
            <span class="text-xs text-white/40 tabular-nums">{t.time}</span>
          </li>
        {/each}
      </ul>
    </GlassPanel>
  </div>
</div>
