<script lang="ts">
  import type { RecurrenceRule } from '$lib/types';
  import { describeRule } from '$lib/utils/recurrence';

  let {
    value = null,
    onChange,
  }: {
    value?: RecurrenceRule | null;
    onChange: (r: RecurrenceRule | null) => void;
  } = $props();

  let open = $state(false);
  let mode = $state<'none' | 'daily' | 'weekly' | 'monthly'>(
    value?.type === 'yearly' ? 'monthly' : (value?.type ?? 'none')
  );
  let interval = $state(
    value?.type === 'daily' || value?.type === 'weekly' || value?.type === 'monthly'
      ? value.interval
      : 1
  );
  let days = $state<number[]>(value?.type === 'weekly' ? [...value.days] : []);
  let dayOfMonth = $state<number>(value?.type === 'monthly' && value.dayOfMonth !== 'last' ? value.dayOfMonth : 1);

  const WEEK = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];

  function apply() {
    let rule: RecurrenceRule | null = null;
    if (mode === 'daily') {
      rule = { type: 'daily', interval };
    } else if (mode === 'weekly') {
      rule = { type: 'weekly', days: days.length ? days : [new Date().getDay()], interval };
    } else if (mode === 'monthly') {
      rule = { type: 'monthly', dayOfMonth, interval };
    }
    onChange(rule);
    open = false;
  }

  function clear() {
    onChange(null);
    open = false;
  }

  function toggleDay(d: number) {
    days = days.includes(d)
      ? days.filter((x) => x !== d)
      : [...days, d].sort((a, b) => a - b);
  }

  const label = $derived(value ? describeRule(value) : 'بدون تکرار');
</script>

<div class="relative">
  <button
    onclick={() => open = !open}
    class="glass glass-sm px-3 py-1.5 text-xs text-white/75 hover:bg-white/8 transition-colors flex items-center gap-2"
  >
    <span class="opacity-60">🔁</span>
    <span>{label}</span>
  </button>

  {#if open}
    <div class="absolute top-full mt-2 left-0 glass glass-lg p-4 z-50 w-[280px]">
      <p class="text-[10px] uppercase tracking-widest text-white/40 mb-3">تکرار</p>

      <div class="flex flex-col gap-1 mb-3">
        <button
          onclick={() => mode = 'none'}
          class="text-left text-xs px-3 py-1.5 rounded-md transition-colors
                 {mode === 'none' ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}"
        >بدون تکرار</button>
        <button
          onclick={() => mode = 'daily'}
          class="text-left text-xs px-3 py-1.5 rounded-md transition-colors
                 {mode === 'daily' ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}"
        >روزانه</button>
        <button
          onclick={() => mode = 'weekly'}
          class="text-left text-xs px-3 py-1.5 rounded-md transition-colors
                 {mode === 'weekly' ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}"
        >هفتگی</button>
        <button
          onclick={() => mode = 'monthly'}
          class="text-left text-xs px-3 py-1.5 rounded-md transition-colors
                 {mode === 'monthly' ? 'bg-white/12 text-white' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}"
        >ماهانه</button>
      </div>

      {#if mode === 'daily'}
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs text-white/50">هر</span>
          <input type="number" min="1" max="30" bind:value={interval}
            class="w-14 bg-transparent border border-white/15 rounded px-2 py-1 text-xs text-white/85 outline-none text-center" />
          <span class="text-xs text-white/50">روز</span>
        </div>
      {/if}

      {#if mode === 'weekly'}
        <div class="mb-3">
          <div class="flex gap-1 mb-2">
            <button onclick={() => toggleDay(6)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(6) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">ش</button>
            <button onclick={() => toggleDay(0)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(0) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">ی</button>
            <button onclick={() => toggleDay(1)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(1) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">د</button>
            <button onclick={() => toggleDay(2)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(2) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">س</button>
            <button onclick={() => toggleDay(3)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(3) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">چ</button>
            <button onclick={() => toggleDay(4)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(4) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">پ</button>
            <button onclick={() => toggleDay(5)} class="w-7 h-7 rounded-md text-[10px] transition-colors {days.includes(5) ? 'bg-white/85 text-black' : 'bg-white/6 text-white/50 hover:bg-white/12'}">ج</button>
          </div>
        </div>
      {/if}

      {#if mode === 'monthly'}
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs text-white/50">روز</span>
          <input type="number" min="1" max="28" bind:value={dayOfMonth}
            class="w-14 bg-transparent border border-white/15 rounded px-2 py-1 text-xs text-white/85 outline-none text-center" />
          <span class="text-xs text-white/50">هر</span>
          <input type="number" min="1" max="12" bind:value={interval}
            class="w-14 bg-transparent border border-white/15 rounded px-2 py-1 text-xs text-white/85 outline-none text-center" />
          <span class="text-xs text-white/50">ماه</span>
        </div>
      {/if}

      <div class="flex justify-between pt-2 border-t border-white/8">
        <button onclick={clear} class="text-xs text-white/45 hover:text-white/80 transition-colors">پاک کن</button>
        <div class="flex gap-2">
          <button onclick={() => open = false} class="text-xs text-white/45 hover:text-white/80 px-2 transition-colors">لغو</button>
          <button onclick={apply} class="text-xs text-white px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors">ذخیره</button>
        </div>
      </div>
    </div>
  {/if}
</div>
