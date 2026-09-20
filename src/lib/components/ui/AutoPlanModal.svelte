<script lang="ts">
  import { autoplan } from '$lib/stores/autoplan.svelte';
  import { formatTime } from '$lib/utils/scheduler';
  import { tasks } from '$lib/stores/tasks.svelte';
  import { energy } from '$lib/stores/energy.svelte';
  import { autoSchedule } from '$lib/utils/scheduler';

  const result = $derived(autoplan.result);
  const totalHours = $derived(result ? Math.round(result.totalMin / 60 * 10) / 10 : 0);

  function rerun() {
    const e = energy.today ?? 3;
    autoplan.show(autoSchedule(tasks.open, e, 9, 18));
  }
</script>

{#if autoplan.open && result}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center"
    style="background: rgba(0,0,0,0.65); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
    onclick={() => autoplan.hide()}
    role="presentation"
  >
    <div
      class="glass glass-lg w-[560px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      style="animation: none;"
    >
      <div class="p-5 border-b border-white/8 flex items-center justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-widest text-white/40">Auto-plan</p>
          <p class="text-lg font-light text-white mt-1">
            {result.slots.length} تسک · {totalHours} ساعت
          </p>
          <p class="text-xs text-white/45 mt-1">بر اساس انرژی امروز (سطح {result.energyLevel})</p>
        </div>
        <button onclick={() => autoplan.hide()} class="text-white/40 hover:text-white/80 text-lg">×</button>
      </div>

      <ul class="flex-1 overflow-y-auto p-4">
        {#each result.slots as s}
          <li class="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
            <span class="text-xs text-white/45 tabular-nums w-12 pt-0.5">{formatTime(s.startMin)}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white/90 truncate">{s.title}</p>
              <p class="text-[10px] text-white/35 mt-0.5">{s.reason} · {s.durationMin} دقیقه</p>
            </div>
          </li>
        {/each}

        {#if result.overflow.length > 0}
          <li class="pt-4">
            <p class="text-[10px] uppercase tracking-widest text-white/35 mb-2">
              جا نشد ({result.overflow.length})
            </p>
            {#each result.overflow as t}
              <div class="flex items-center gap-2 py-1.5 text-xs text-white/50">
                <span>·</span>
                <span class="truncate">{t.title}</span>
                <span class="text-white/30">{t.estimatedMin}m</span>
              </div>
            {/each}
          </li>
        {/if}

        {#if result.slots.length === 0}
          <li class="text-center py-8 text-sm text-white/30">
            تسکی با زمان تخمینی نداری. اول زمان تخمینی بعضی تسک‌ها رو تنظیم کن.
          </li>
        {/if}
      </ul>

      <div class="p-4 border-t border-white/8 flex justify-end gap-2">
        <button
          onclick={() => autoplan.hide()}
          class="text-xs text-white/50 hover:text-white/80 px-3 py-1.5 transition-colors"
        >بستن</button>
        <button
          onclick={rerun}
          class="text-xs text-white px-4 py-1.5 rounded-md bg-white/15 hover:bg-white/25 transition-colors"
        >🔄 دوباره</button>
      </div>
    </div>
  </div>
{/if}
