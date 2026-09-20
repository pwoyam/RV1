<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { journal, todayStr } from '$lib/stores/journal.svelte';
  import type { JournalEntry } from '$lib/types';

  const today = todayStr();

  // اطمینان از وجود ورودی امروز
  $effect(() => {
    if (!journal.forDate(today)) {
      journal.create({ date: today, type: 'daily' });
    }
  });

  const current = $derived(journal.forDate(today));
  const prompt = $derived(journal.promptFor(today));

  const MOODS = ['😔', '😐', '🙂', '😊', '🤩'];

  function onContentInput(e: Event) {
    if (!current) return;
    const value = (e.target as HTMLTextAreaElement).value;
    journal.update(current.id, { content: value });
  }

  function setMood(v: number) {
    if (!current) return;
    journal.update(current.id, { mood: current.mood === v ? null : v });
  }

  function setEnergy(v: number) {
    if (!current) return;
    journal.update(current.id, { energy: current.energy === v ? null : v });
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  }

  function preview(e: JournalEntry) {
    const first = e.content.split('\n').find((l) => l.trim()) ?? '—';
    return first.slice(0, 60);
  }
</script>

<div class="h-full flex gap-3 overflow-hidden">
  <!-- لیست ورودی‌ها -->
  <GlassPanel variant="strong" padding="p-3" class="w-[280px] flex flex-col">
    <div class="px-3 pt-3 pb-4">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Journal</p>
      <p class="text-xs text-white/55 mt-1">{journal.items.length} entries</p>
    </div>

    <ul class="flex-1 overflow-y-auto flex flex-col gap-0.5">
      {#each journal.recent as entry (entry.id)}
        <li>
          <button
            class="w-full text-left px-3 py-2.5 rounded-xl transition-colors
                   {entry.date === today ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <div class="flex items-center gap-2 mb-1">
              {#if entry.mood}
                <span class="text-xs">{MOODS[entry.mood - 1]}</span>
              {/if}
              <span class="text-xs text-white/85">{formatDate(entry.date)}</span>
            </div>
            <p class="text-[11px] text-white/40 truncate">{preview(entry)}</p>
          </button>
        </li>
      {/each}
    </ul>
  </GlassPanel>

  <!-- ورودی امروز -->
  <GlassPanel padding="p-8" class="flex-1 flex flex-col overflow-hidden">
    <div class="flex items-start justify-between mb-6">
      <div>
        <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Today</p>
        <h2 class="text-2xl font-light text-white mt-1">{formatDate(today)}</h2>
      </div>

      <div class="flex flex-col gap-3 items-end">
        <!-- Mood -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase tracking-widest text-white/35 mr-1">Mood</span>
          {#each [1,2,3,4,5] as i}
            <button
              onclick={() => setMood(i)}
              class="text-lg transition-all
                     {current?.mood === i ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-70'}"
            >
              {MOODS[i - 1]}
            </button>
          {/each}
        </div>

        <!-- Energy -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase tracking-widest text-white/35 mr-1">Energy</span>
          {#each [1,2,3,4,5] as i}
            <button
              onclick={() => setEnergy(i)}
              class="w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all
                     {current?.energy === i
                       ? 'bg-white/85 text-black'
                       : 'bg-white/8 text-white/40 hover:bg-white/15'}"
            >
              {i}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Prompt -->
    <p class="text-sm italic text-white/50 mb-4 font-light">{prompt}</p>

    <!-- Content -->
    <textarea
      value={current?.content ?? ''}
      oninput={onContentInput}
      placeholder="Write freely…"
      class="flex-1 w-full bg-transparent border-none outline-none resize-none text-white/90 text-base leading-relaxed placeholder:text-white/25 font-light"
    ></textarea>

    <div class="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/30">
      <span>{current?.content.split(/\s+/).filter(Boolean).length ?? 0} words</span>
      <span>{current ? 'Saved' : ''}</span>
    </div>
  </GlassPanel>
</div>
