<script lang="ts">
  import { tasks } from '$lib/stores/tasks.svelte';
  import { habits, todayStr } from '$lib/stores/habits.svelte';
  import { journal } from '$lib/stores/journal.svelte';
  import { goals } from '$lib/stores/goals.svelte';
  import { rituals } from '$lib/stores/rituals.svelte';
  import { lastNDays } from '$lib/stores/stats.svelte';

  let {
    open = false,
    onClose,
  }: { open?: boolean; onClose: () => void } = $props();

  let step = $state(1);
  let win = $state('');
  let hard = $state('');
  let nextFocus = $state('');

  const weekDays = $derived(lastNDays(7));
  const weekSet = $derived(new Set(weekDays));

  // آمار
  const doneThisWeek = $derived(
    tasks.items.filter((t) => {
      if (!t.completedAt) return false;
      const key = new Date(t.completedAt).toISOString().slice(0, 10);
      return weekSet.has(key);
    })
  );

  const habitsDone = $derived(
    habits.habits.map((h) => ({
      habit: h,
      done: weekDays.filter((d) => habits.isDone(h.id, d)).length,
    }))
  );

  const avgMood = $derived.by(() => {
    const moods = weekDays
      .map((d) => journal.forDate(d)?.mood)
      .filter((m): m is number => typeof m === 'number');
    if (moods.length === 0) return null;
    return Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10;
  });

  const activeGoals = $derived(goals.active);

  const MOODS = ['😔', '😐', '🙂', '😊', '🤩'];

  function close() {
    onClose();
    step = 1;
    win = '';
    hard = '';
    nextFocus = '';
  }

  function finish() {
    const today = todayStr();
    let e = journal.forDate(today);
    if (!e) e = journal.create({ date: today });

    const block = [
      e.content ?? '',
      '',
      '--- Weekly Review ---',
      win ? `✅ خوب بود: ${win}` : '',
      hard ? `⚠ سخت بود: ${hard}` : '',
      nextFocus ? `🎯 هفته بعد: ${nextFocus}` : '',
    ].filter(Boolean).join('\n');

    journal.update(e.id, { content: block });
    rituals.markReviewDone();
    close();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center"
    style="background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
    role="presentation"
  >
    <div
      class="glass glass-lg w-[620px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col"
      style="animation: none;"
      role="dialog"
      aria-modal="true"
    >
      <div class="p-6 border-b border-white/8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-white/40">Weekly Review</p>
            <h2 class="text-2xl font-light text-white mt-1">مرور هفته</h2>
            <p class="text-xs text-white/40 mt-1">مرحله {step} از ۳ · {rituals.currentWeekKey}</p>
          </div>
          <button onclick={close} class="text-white/40 hover:text-white/80 text-lg">×</button>
        </div>
        <div class="mt-4 flex gap-1.5">
          {#each [1, 2, 3] as i}
            <div class="h-0.5 flex-1 rounded-full {step >= i ? 'bg-white/70' : 'bg-white/10'}"></div>
          {/each}
        </div>
      </div>

      <!-- مرحله ۱: آمار -->
      {#if step === 1}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div class="grid grid-cols-3 gap-3">
            <div class="glass glass-sm p-3">
              <p class="text-[10px] uppercase tracking-widest text-white/40">تسک‌ها</p>
              <p class="text-2xl font-light text-white mt-1 tabular-nums">{doneThisWeek.length}</p>
              <p class="text-[10px] text-white/40 mt-0.5">انجام‌شده</p>
            </div>
            <div class="glass glass-sm p-3">
              <p class="text-[10px] uppercase tracking-widest text-white/40">Mood</p>
              <p class="text-2xl font-light text-white mt-1 tabular-nums">
                {avgMood ?? '—'}
              </p>
              <p class="text-[10px] text-white/40 mt-0.5">میانگین هفته</p>
            </div>
            <div class="glass glass-sm p-3">
              <p class="text-[10px] uppercase tracking-widest text-white/40">Shutdown</p>
              <p class="text-2xl font-light text-white mt-1 tabular-nums">{rituals.shutdownStreak}</p>
              <p class="text-[10px] text-white/40 mt-0.5">روز متوالی</p>
            </div>
          </div>

          {#if habitsDone.length > 0}
            <div>
              <p class="text-xs uppercase tracking-widest text-white/40 mb-3">عادت‌ها</p>
              <ul class="flex flex-col gap-2">
                {#each habitsDone as h}
                  <li class="flex items-center gap-3 text-xs">
                    <span class="opacity-60 w-5 text-center">{h.habit.icon}</span>
                    <span class="flex-1 text-white/80">{h.habit.title}</span>
                    <span class="text-white/40 tabular-nums">{h.done}/7</span>
                    <div class="w-20 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div class="h-full bg-white/70" style="width: {(h.done / 7) * 100}%"></div>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if activeGoals.length > 0}
            <div>
              <p class="text-xs uppercase tracking-widest text-white/40 mb-3">اهداف فعال</p>
              <ul class="flex flex-col gap-1.5">
                {#each activeGoals.slice(0, 5) as g}
                  <li class="text-xs text-white/65 flex items-center gap-2">
                    <span class="text-white/30">◇</span>
                    <span class="truncate">{g.title}</span>
                    <span class="text-white/35 tabular-nums ml-auto">{Math.round(goals.progress(g) * 100)}%</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}

      <!-- مرحله ۲: بازتاب -->
      {#if step === 2}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div>
            <p class="text-sm text-white/85 mb-2">✅ این هفته چی خوب بود؟</p>
            <textarea bind:value={win} rows="3" placeholder="پیروزی‌ها، پیشرفت‌ها..."
              class="w-full glass glass-sm bg-transparent px-3 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none resize-none"></textarea>
          </div>
          <div>
            <p class="text-sm text-white/85 mb-2">⚠ چی سخت بود؟</p>
            <textarea bind:value={hard} rows="3" placeholder="موانع، شکست‌ها..."
              class="w-full glass glass-sm bg-transparent px-3 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none resize-none"></textarea>
          </div>
          <div>
            <p class="text-sm text-white/85 mb-2">🎯 تمرکز اصلی هفته‌ی بعد</p>
            <input type="text" bind:value={nextFocus} placeholder="یه چیز مهم..."
              class="w-full glass glass-sm bg-transparent px-3 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none" />
          </div>
        </div>
      {/if}

      <!-- مرحله ۳ -->
      {#if step === 3}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4">
          <p class="text-5xl">🗓️</p>
          <p class="text-lg font-light text-white">هفته مرور شد</p>
          <p class="text-xs text-white/45 max-w-[80%]">
            یه هفته‌ی دیگه با آگاهی بیشتر شروع می‌کنی.
          </p>
        </div>
      {/if}

      <div class="p-5 border-t border-white/8 flex justify-between">
        <button onclick={() => step > 1 ? step-- : close()}
          class="text-xs text-white/50 hover:text-white/80 px-3 py-1.5 transition-colors"
        >{step === 1 ? 'لغو' : 'قبلی'}</button>

        {#if step < 3}
          <button onclick={() => step++}
            class="text-xs text-white px-5 py-2 rounded-md bg-white/15 hover:bg-white/25 transition-colors"
          >بعدی →</button>
        {:else}
          <button onclick={finish}
            class="text-xs text-white px-5 py-2 rounded-md bg-white/25 hover:bg-white/35 transition-colors"
          >پایان</button>
        {/if}
      </div>
    </div>
  </div>
{/if}
