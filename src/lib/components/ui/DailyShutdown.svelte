<script lang="ts">
  import { tasks } from '$lib/stores/tasks.svelte';
  import { journal, todayStr } from '$lib/stores/journal.svelte';
  import { rituals } from '$lib/stores/rituals.svelte';

  let {
    open = false,
    onClose,
  }: { open?: boolean; onClose: () => void } = $props();

  const today = todayStr();
  const openTasks = $derived(tasks.open.filter((t) => !t.done).slice(0, 8));
  const doneToday = $derived(
    tasks.items.filter((t) => t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === today)
  );
  const entry = $derived(journal.forDate(today));

  let gratitude = $state('');
  let tomorrowFocus = $state('');
  let step = $state(1);

  function close() {
    onClose();
    step = 1;
    gratitude = '';
    tomorrowFocus = '';
  }

  function finish() {
    // ذخیره در ژورنال
    let e = journal.forDate(today);
    if (!e) e = journal.create({ date: today });

    const existing = e.content ?? '';
    const block = [
      existing,
      '',
      '--- Shutdown ---',
      gratitude ? `🙏 ${gratitude}` : '',
      tomorrowFocus ? `🎯 فردا: ${tomorrowFocus}` : '',
    ].filter(Boolean).join('\n');

    journal.update(e.id, { content: block });
    rituals.markShutdownDone();
    close();
  }

  function snoozeAll() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const ymd = tomorrow.toISOString().slice(0, 10);
    for (const t of openTasks) {
      tasks.update(t.id, { dueDate: ymd });
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center"
    style="background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
    role="presentation"
  >
    <div
      class="glass glass-lg w-[600px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col"
      style="animation: none;"
      role="dialog"
      aria-modal="true"
    >
      <!-- هدر -->
      <div class="p-6 border-b border-white/8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-white/40">Daily Shutdown</p>
            <h2 class="text-2xl font-light text-white mt-1">پایان روز</h2>
            <p class="text-xs text-white/40 mt-1">مرحله {step} از ۳</p>
          </div>
          <button onclick={close} class="text-white/40 hover:text-white/80 text-lg">×</button>
        </div>

        <!-- پیشرفت -->
        <div class="mt-4 flex gap-1.5">
          {#each [1, 2, 3] as i}
            <div class="h-0.5 flex-1 rounded-full {step >= i ? 'bg-white/70' : 'bg-white/10'}"></div>
          {/each}
        </div>
      </div>

      <!-- مرحله ۱: مرور امروز -->
      {#if step === 1}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div>
            <p class="text-sm text-white/85 mb-3">✅ امروز {doneToday.length} کار انجام دادی</p>
            {#if doneToday.length > 0}
              <ul class="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pl-1">
                {#each doneToday.slice(0, 10) as t}
                  <li class="text-xs text-white/55 flex items-center gap-2">
                    <span class="text-white/30">✓</span>
                    <span class="truncate">{t.title}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          {#if openTasks.length > 0}
            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm text-white/85">⏳ {openTasks.length} کار ناتمام</p>
                <button
                  onclick={snoozeAll}
                  class="text-[10px] text-white/50 hover:text-white/85 px-2 py-1 rounded hover:bg-white/8 transition-colors"
                >همه رو ببر فردا</button>
              </div>
              <ul class="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pl-1">
                {#each openTasks as t}
                  <li class="text-xs text-white/55 flex items-center gap-2">
                    <span class="text-white/30">·</span>
                    <span class="truncate">{t.title}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}

      <!-- مرحله ۲: ژورنال -->
      {#if step === 2}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div>
            <p class="text-sm text-white/85 mb-3">🙏 یه چیز که امروز بابتش سپاسگزاری</p>
            <textarea
              bind:value={gratitude}
              rows="3"
              placeholder="امروز بابت چی خوب بود؟"
              class="w-full glass glass-sm bg-transparent px-3 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <p class="text-sm text-white/85 mb-3">🎯 تمرکز اصلی فردا</p>
            <input
              type="text"
              bind:value={tomorrowFocus}
              placeholder="یه چیز مهم برای فردا..."
              class="w-full glass glass-sm bg-transparent px-3 py-2.5 text-sm text-white/85 placeholder:text-white/25 outline-none"
            />
          </div>

          {#if entry?.mood == null}
            <p class="text-[10px] text-white/30">
              می‌تونی از تب Journal حالت رو ثبت کنی
            </p>
          {/if}
        </div>
      {/if}

      <!-- مرحله ۳: آماده -->
      {#if step === 3}
        <div class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4">
          <p class="text-5xl">🌙</p>
          <p class="text-lg font-light text-white">روز بسته شد</p>
          <p class="text-xs text-white/45 max-w-[80%]">
            فردا با ذهن آروم‌تر شروع می‌کنی. حالا وقت استراحته.
          </p>
        </div>
      {/if}

      <!-- فوتر -->
      <div class="p-5 border-t border-white/8 flex justify-between">
        <button
          onclick={() => step > 1 ? step-- : close()}
          class="text-xs text-white/50 hover:text-white/80 px-3 py-1.5 transition-colors"
        >{step === 1 ? 'لغو' : 'قبلی'}</button>

        {#if step < 3}
          <button
            onclick={() => step++}
            class="text-xs text-white px-5 py-2 rounded-md bg-white/15 hover:bg-white/25 transition-colors"
          >بعدی →</button>
        {:else}
          <button
            onclick={finish}
            class="text-xs text-white px-5 py-2 rounded-md bg-white/25 hover:bg-white/35 transition-colors"
          >پایان</button>
        {/if}
      </div>
    </div>
  </div>
{/if}
