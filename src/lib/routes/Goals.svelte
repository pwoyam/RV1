<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { goals, type Goal } from '$lib/stores/goals.svelte';

  const HORIZONS: { id: Goal['horizon']; label: string }[] = [
    { id: 'year',    label: 'Year' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'month',   label: 'Month' },
  ];

  const grouped = $derived(goals.byHorizon);

  function addGoal(horizon: Goal['horizon']) {
    goals.create({ title: 'New goal', horizon });
  }

  function onTitle(e: Event, id: string) {
    goals.update(id, { title: (e.target as HTMLInputElement).value });
  }

  function onDescription(e: Event, id: string) {
    goals.update(id, { description: (e.target as HTMLTextAreaElement).value });
  }

  function onTarget(e: Event, id: string) {
    const v = Number((e.target as HTMLInputElement).value);
    if (!isNaN(v) && v > 0) goals.update(id, { targetValue: v });
  }

  function bumpProgress(g: Goal, delta: number) {
    goals.setProgress(g.id, g.currentValue + delta);
  }

  function markDone(id: string) {
    goals.update(id, { status: 'done' });
  }
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6">
    <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Goals</p>
    <h1 class="text-3xl font-light tracking-tight text-white mt-1">
      {goals.active.length} active
      <span class="text-white/30 text-lg">· {goals.items.filter(g => g.status === 'done').length} done</span>
    </h1>
  </GlassPanel>

  <div class="flex-1 overflow-y-auto flex flex-col gap-3">
    {#each HORIZONS as h}
      <GlassPanel padding="p-5">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">{h.label}</p>
          <button
            onclick={() => addGoal(h.id)}
            class="text-xs text-white/55 hover:text-white transition-colors"
          >+ Add</button>
        </div>

        {#if grouped[h.id].length === 0}
          <p class="text-xs text-white/25 py-3">No {h.label.toLowerCase()} goals yet.</p>
        {:else}
          <ul class="flex flex-col gap-3">
            {#each grouped[h.id] as goal (goal.id)}
              <li class="glass glass-sm p-4 flex flex-col gap-3">
                <div class="flex items-start gap-3">
                  <input
                    value={goal.title}
                    oninput={(e) => onTitle(e, goal.id)}
                    class="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white/90 placeholder:text-white/30"
                  />
                  <span class="text-[10px] text-white/35 tabular-nums whitespace-nowrap">
                    {goals.daysLeft(goal)}d left
                  </span>
                  <button
                    onclick={() => goals.remove(goal.id)}
                    class="text-xs text-white/25 hover:text-red-300/70 px-1 transition-colors"
                  >×</button>
                </div>

                <textarea
                  value={goal.description}
                  oninput={(e) => onDescription(e, goal.id)}
                  placeholder="Why does this matter?"
                  rows="1"
                  class="w-full bg-transparent border-none outline-none resize-none text-xs text-white/60 placeholder:text-white/25"
                ></textarea>

                <!-- Progress bar -->
                <div>
                  <div class="flex items-center justify-between text-[10px] text-white/40 mb-1.5">
                    <span class="tabular-nums">
                      {goal.currentValue} / {goal.targetValue}
                      ({Math.round(goals.progress(goal) * 100)}%)
                    </span>
                    <div class="flex items-center gap-1">
                      <input
                        type="number"
                        value={goal.targetValue}
                        oninput={(e) => onTarget(e, goal.id)}
                        class="w-14 bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/70 outline-none text-center"
                      />
                      <span class="text-white/30">target</span>
                    </div>
                  </div>
                  <div class="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <div
                      class="h-full bg-white/75 transition-all"
                      style="width: {goals.progress(goal) * 100}%"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <button
                    onclick={() => bumpProgress(goal, -1)}
                    class="glass glass-sm px-2.5 py-1 text-xs text-white/60 hover:bg-white/8 transition-colors"
                  >−</button>
                  <button
                    onclick={() => bumpProgress(goal, 1)}
                    class="glass glass-sm px-2.5 py-1 text-xs text-white/60 hover:bg-white/8 transition-colors"
                  >+</button>
                  <button
                    onclick={() => bumpProgress(goal, 5)}
                    class="glass glass-sm px-2.5 py-1 text-xs text-white/60 hover:bg-white/8 transition-colors"
                  >+5</button>
                  <span class="flex-1"></span>
                  <button
                    onclick={() => markDone(goal.id)}
                    class="text-[11px] text-white/45 hover:text-white/80 transition-colors"
                  >Mark done</button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </GlassPanel>
    {/each}
  </div>
</div>
