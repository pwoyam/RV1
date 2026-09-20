<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { stats } from '$lib/stores/stats.svelte';

  const scores = $derived(stats.dailyScores);
  const areas = $derived(stats.areaStats);
  const heatmap = $derived(stats.yearlyHeatmap);
  const maxScore = 100;

  // مسیر SVG برای نمودار خطی
  const pathData = $derived.by(() => {
    const w = 100, h = 100;
    const step = scores.length > 1 ? w / (scores.length - 1) : w;
    return scores
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${h - (p.score / maxScore) * h}`)
      .join(' ');
  });

  // ناحیه زیر نمودار
  const areaPath = $derived.by(() => {
    if (scores.length === 0) return '';
    const w = 100, h = 100;
    const step = scores.length > 1 ? w / (scores.length - 1) : w;
    const line = scores
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${h - (p.score / maxScore) * h}`)
      .join(' ');
    return `${line} L ${w},${h} L 0,${h} Z`;
  });

  function heatColor(score: number) {
    if (score === 0) return 'bg-white/4';
    const a = score / 100;
    return `bg-white/${Math.round(a * 90)}`;
  }

  // چیدن heatmap در هفته‌ها
  const weeks = $derived.by(() => {
    const out: { date: string; score: number }[][] = [];
    let week: { date: string; score: number }[] = [];
    heatmap.forEach((d, i) => {
      week.push(d);
      if (week.length === 7 || i === heatmap.length - 1) {
        out.push(week);
        week = [];
      }
    });
    return out;
  });
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <!-- هدر + Life Score -->
  <GlassPanel padding="p-6" class="flex items-center justify-between">
    <div>
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Insights</p>
      <h1 class="text-3xl font-light tracking-tight text-white mt-1">
        Life Score
        <span class="text-white/30 text-lg ml-2">today</span>
      </h1>
    </div>
    <div class="flex items-baseline gap-1">
      <span class="text-5xl font-light text-white tabular-nums">{stats.lifeScore}</span>
      <span class="text-white/30 text-lg">/100</span>
    </div>
  </GlassPanel>

  <div class="grid grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
    <!-- نمودار ۳۰ روز -->
    <GlassPanel padding="p-5" class="col-span-2 flex flex-col overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Last 30 days</p>
      <div class="flex-1 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-full">
          <defs>
            <linearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="white" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#fadeGrad)"/>
          <path d={pathData} fill="none" stroke="white" stroke-width="0.6" stroke-opacity="0.85" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>
      <div class="flex justify-between text-[10px] text-white/30 mt-2 uppercase tracking-widest">
        <span>30d ago</span>
        <span>Today</span>
      </div>
    </GlassPanel>

    <!-- Life Areas -->
    <GlassPanel padding="p-5" class="overflow-hidden flex flex-col">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Areas</p>
      <ul class="flex-1 overflow-y-auto flex flex-col gap-3">
        {#each areas as a}
          <li class="flex items-center gap-3">
            <span class="text-base w-5 text-center opacity-70">{a.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-white/85 truncate">{a.name}</span>
                <span class="text-[10px] text-white/40 tabular-nums">{a.score}%</span>
              </div>
              <div class="h-1 rounded-full bg-white/6 overflow-hidden">
                <div class="h-full bg-white/70 transition-all" style="width: {a.score}%"></div>
              </div>
            </div>
          </li>
        {/each}

        {#if areas.length === 0}
          <li class="text-xs text-white/30 text-center py-4">No areas</li>
        {/if}
      </ul>
    </GlassPanel>

    <!-- Heatmap سالانه -->
    <GlassPanel padding="p-5" class="col-span-3 overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Year in review</p>
      <div class="flex gap-[3px] overflow-x-auto pb-1">
        {#each weeks as week}
          <div class="flex flex-col gap-[3px]">
            {#each week as day}
              <div
                class="w-[9px] h-[9px] rounded-[2px] {heatColor(day.score)}"
                title="{day.date} · {day.score}"
              ></div>
            {/each}
          </div>
        {/each}
      </div>
    </GlassPanel>
  </div>
</div>
