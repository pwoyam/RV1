<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import EnergyCheck from '$lib/components/ui/EnergyCheck.svelte';
  import DailyShutdown from '$lib/components/ui/DailyShutdown.svelte';
  import WeeklyReview from '$lib/components/ui/WeeklyReview.svelte';
  import { rituals } from '$lib/stores/rituals.svelte';
  import { tasks } from '$lib/stores/tasks.svelte';
  import { habits, todayStr } from '$lib/stores/habits.svelte';
  import { lifeAreas } from '$lib/stores/lifeAreas.svelte';
  import { journal } from '$lib/stores/journal.svelte';
  import { stats } from '$lib/stores/stats.svelte';

  const today = todayStr();
  const MOODS = ['😔', '😐', '🙂', '😊', '🤩'];

  const todaysTasks = $derived(tasks.today);
  const todaysHabits = $derived(habits.habits);

  const greeting = $derived.by(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  function setMood(v: number) {
    let entry = journal.forDate(today);
    if (!entry) entry = journal.create({ date: today });
    journal.update(entry.id, { mood: entry.mood === v ? null : v });
  }

  const currentEntry = $derived(journal.forDate(today));
  let shutdownOpen = $state(false);
  let reviewOpen = $state(false);
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <!-- هدر -->
  <GlassPanel padding="p-6" class="flex items-center justify-between">
    <div>
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Today</p>
      <h1 class="text-3xl font-light tracking-tight text-white mt-1">{greeting}, Ali</h1>
    </div>
    <div class="text-right">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Life Score</p>
      <p class="text-3xl font-light text-white mt-1 tabular-nums">
        {stats.lifeScore}<span class="text-white/30 text-lg">/100</span>
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button
        onclick={() => reviewOpen = true}
        class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors flex items-center gap-2"
      >
        <span>🗓️</span>
        <span>{rituals.reviewThisWeek ? 'مرور هفته (انجام‌شده)' : 'مرور هفته'}</span>
      </button>
      <button
        onclick={() => shutdownOpen = true}
        class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors flex items-center gap-2"
      >
        <span>🌙</span>
        <span>{rituals.shutdownToday ? 'پایان روز (انجام‌شده)' : 'پایان روز'}</span>
      </button>
    </div>
  </GlassPanel>

  <DailyShutdown open={shutdownOpen} onClose={() => shutdownOpen = false} />
  <WeeklyReview open={reviewOpen} onClose={() => reviewOpen = false} />

  <EnergyCheck />

  <div class="grid grid-cols-3 gap-3 flex-1 min-h-0">
    <!-- Life Areas -->
    <GlassPanel padding="p-5" class="col-span-2 overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Life Areas</p>
      {#if lifeAreas.areas.length === 0}
        <p class="text-xs text-white/30 py-2">No areas yet. Go to Settings to create them.</p>
      {:else}
        <div class="flex flex-wrap gap-2">
          {#each stats.areaStats as a}
            <div class="glass glass-sm flex items-center gap-2 px-3 py-1.5 text-xs text-white/85">
              <span class="text-sm opacity-70">{a.icon}</span>
              <span>{a.name}</span>
              <span class="text-white/40 tabular-nums">{a.score}%</span>
            </div>
          {/each}
        </div>
      {/if}
    </GlassPanel>

    <!-- Mood -->
    <GlassPanel padding="p-5" class="overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Mood</p>
      <div class="flex gap-2">
        {#each [1,2,3,4,5] as i}
          <button
            onclick={() => setMood(i)}
            class="flex-1 aspect-square rounded-full glass glass-sm flex items-center justify-center text-lg transition-all
                   {currentEntry?.mood === i ? 'ring-1 ring-white/40 opacity-100' : 'opacity-40 hover:opacity-80'}"
          >
            {MOODS[i - 1]}
          </button>
        {/each}
      </div>
    </GlassPanel>

    <!-- Habits امروز -->
    <GlassPanel padding="p-5" class="overflow-hidden">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Habits</p>
      {#if todaysHabits.length === 0}
        <p class="text-xs text-white/30">No habits yet.</p>
      {:else}
        <ul class="flex flex-col gap-2 max-h-[120px] overflow-y-auto">
          {#each todaysHabits as h (h.id)}
            <li>
              <button
                onclick={() => habits.toggle(h.id)}
                class="w-full flex items-center gap-2 text-left"
              >
                <div class="w-4 h-4 rounded-md border flex items-center justify-center text-[10px] text-black transition-colors
                            {habits.isDone(h.id, today)
                              ? 'bg-white/90 border-white/90'
                              : 'border-white/25'}">
                  {habits.isDone(h.id, today) ? '✓' : ''}
                </div>
                <span class="flex-1 text-xs {habits.isDone(h.id, today) ? 'text-white/40 line-through' : 'text-white/85'} truncate">
                  {h.title}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </GlassPanel>

    <!-- تودوهای امروز -->
    <GlassPanel padding="p-5" class="col-span-2 overflow-hidden flex flex-col">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">Today's Focus</p>
      {#if todaysTasks.length === 0}
        <p class="text-xs text-white/30 py-4 text-center">No tasks for today. Enjoy.</p>
      {:else}
        <ul class="flex flex-col divide-y divide-white/5 overflow-y-auto">
          {#each todaysTasks.slice(0, 6) as t (t.id)}
            <li class="flex items-center gap-3 py-2.5">
              <button
                onclick={() => tasks.toggle(t.id)}
                class="w-4 h-4 rounded-md border flex items-center justify-center text-[10px] text-black transition-colors
                       {t.done ? 'bg-white/90 border-white/90' : 'border-white/25 hover:border-white/50'}"
              >
                {t.done ? '✓' : ''}
              </button>
              <span class="flex-1 text-sm {t.done ? 'text-white/35 line-through' : 'text-white/90'}">
                {t.title}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
    </GlassPanel>
  </div>
</div>
