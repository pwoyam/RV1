<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { habits, todayStr } from '$lib/stores/habits.svelte';

  let newTitle = $state('');
  const today = todayStr();

  function addHabit() {
    if (!newTitle.trim()) return;
    habits.create({ title: newTitle.trim() });
    newTitle = '';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') addHabit();
  }

  const last7 = $derived(habits.lastNDays(7));
  const last365 = $derived(habits.lastNDays(365));

  function dayLetter(d: string) {
    return ['S','M','T','W','T','F','S'][new Date(d + 'T00:00:00').getDay()];
  }

  function heatColor(done: boolean) {
    return done ? 'bg-white/80' : 'bg-white/6';
  }
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6">
    <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Habits</p>
    <h1 class="text-3xl font-light tracking-tight text-white mt-1">
      {habits.habits.length} habits
    </h1>

    <div class="mt-5 flex items-center gap-3">
      <input
        bind:value={newTitle}
        onkeydown={onKey}
        placeholder="New habit…"
        class="flex-1 glass glass-sm bg-transparent px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
      />
      <button
        onclick={addHabit}
        disabled={!newTitle.trim()}
        class="glass glass-sm px-4 py-2.5 text-sm text-white/80 hover:bg-white/8 disabled:opacity-30 transition-colors"
      >
        Add
      </button>
    </div>
  </GlassPanel>

  <GlassPanel padding="p-5" class="flex-1 overflow-y-auto">
    {#if habits.habits.length === 0}
      <div class="h-full flex items-center justify-center">
        <p class="text-sm text-white/30">No habits yet. Add one above.</p>
      </div>
    {:else}
      <ul class="flex flex-col divide-y divide-white/5">
        {#each habits.habits as habit (habit.id)}
          <li class="py-5 first:pt-0 last:pb-0">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-lg w-6 text-center opacity-70">{habit.icon}</span>
              <span class="flex-1 text-sm text-white/90 font-medium">{habit.title}</span>
              <span class="text-xs text-white/40 tabular-nums">
                🔥 {habits.streak(habit.id)} · {Math.round(habits.completionRate(habit.id) * 100)}%
              </span>
              <button
                onclick={() => habits.remove(habit.id)}
                class="text-xs text-white/25 hover:text-red-300/70 px-2 transition-colors"
              >
                ×
              </button>
            </div>

            <!-- ۷ روز اخیر -->
            <div class="flex items-center gap-1.5 mb-3">
              {#each last7 as d}
                <button
                  onclick={() => habits.toggle(habit.id, d)}
                  class="w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[10px] transition-all
                         {habits.isDone(habit.id, d)
                           ? 'bg-white/85 text-black'
                           : 'bg-white/5 text-white/45 hover:bg-white/10'}"
                >
                  <span class="opacity-70">{dayLetter(d)}</span>
                </button>
              {/each}
              <span class="ml-3 text-[10px] text-white/30 uppercase tracking-wider">last 7 days</span>
            </div>

            <!-- Heatmap سالانه -->
            <div class="flex flex-wrap gap-[3px]">
              {#each last365 as d}
                <div
                  class="w-[6px] h-[6px] rounded-[1px] {heatColor(habits.isDone(habit.id, d))}"
                  title={d}
                ></div>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </GlassPanel>
</div>
