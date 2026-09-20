<script lang="ts">
  import { selection } from '$lib/stores/selection.svelte';
  import { tasks, DEFAULT_CONTEXTS } from '$lib/stores/tasks.svelte';

  let showContextMenu = $state(false);
  let showPriorityMenu = $state(false);

  function applyContext(ctx: string | null) {
    for (const id of selection.list) {
      tasks.setContext(id, ctx);
    }
    showContextMenu = false;
  }

  function applyPriority(p: 'low' | 'medium' | 'high') {
    for (const id of selection.list) {
      tasks.update(id, { priority: p });
    }
    showPriorityMenu = false;
  }

  function deleteAll() {
    if (!confirm(`${selection.count} تسک حذف بشن؟`)) return;
    for (const id of selection.list) tasks.remove(id);
    selection.clear();
  }

  function markDone() {
    for (const id of selection.list) {
      const t = tasks.items.find((x) => x.id === id);
      if (t && !t.done) tasks.toggle(id);
    }
    selection.clear();
  }

  function markOpen() {
    for (const id of selection.list) {
      const t = tasks.items.find((x) => x.id === id);
      if (t && t.done) tasks.toggle(id);
    }
    selection.clear();
  }

  function snoozeTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const ymd = tomorrow.toISOString().slice(0, 10);
    for (const id of selection.list) {
      tasks.update(id, { dueDate: ymd });
    }
    selection.clear();
  }
</script>

{#if selection.active}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass glass-lg px-4 py-2.5 flex items-center gap-3 shadow-2xl">
    <span class="text-xs text-white/60 tabular-nums px-2">
      {selection.count} انتخاب‌شده
    </span>

    <div class="w-px h-5 bg-white/10"></div>

    <button
      onclick={markDone}
      class="text-xs text-white/75 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 transition-colors"
    >✓ انجام شد</button>

    <button
      onclick={markOpen}
      class="text-xs text-white/75 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 transition-colors"
    >↺ باز کن</button>

    <button
      onclick={snoozeTomorrow}
      class="text-xs text-white/75 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 transition-colors"
    >📅 فردا</button>

    <div class="relative">
      <button
        onclick={() => { showContextMenu = !showContextMenu; showPriorityMenu = false; }}
        class="text-xs text-white/75 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 transition-colors"
      >@ Context</button>

      {#if showContextMenu}
        <div class="absolute bottom-full mb-2 left-0 glass glass-lg p-2 z-50 w-[180px]">
          {#each DEFAULT_CONTEXTS as c}
            <button
              onclick={() => applyContext(c.id)}
              class="w-full text-left text-xs px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/8 transition-colors flex items-center gap-2"
            >
              <span class="opacity-60">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          {/each}
          <button
            onclick={() => applyContext(null)}
            class="w-full text-left text-xs px-3 py-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors border-t border-white/5 mt-1 pt-2"
          >بدون Context</button>
        </div>
      {/if}
    </div>

    <div class="relative">
      <button
        onclick={() => { showPriorityMenu = !showPriorityMenu; showContextMenu = false; }}
        class="text-xs text-white/75 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 transition-colors"
      >! Priority</button>

      {#if showPriorityMenu}
        <div class="absolute bottom-full mb-2 left-0 glass glass-lg p-2 z-50 w-[140px]">
          <button onclick={() => applyPriority('high')} class="w-full text-left text-xs px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/8">بالا</button>
          <button onclick={() => applyPriority('medium')} class="w-full text-left text-xs px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/8">متوسط</button>
          <button onclick={() => applyPriority('low')} class="w-full text-left text-xs px-3 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/8">پایین</button>
        </div>
      {/if}
    </div>

    <div class="w-px h-5 bg-white/10"></div>

    <button
      onclick={deleteAll}
      class="text-xs text-red-300/80 hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
    >حذف</button>

    <button
      onclick={() => selection.clear()}
      class="text-xs text-white/40 hover:text-white/70 px-2 transition-colors"
    >×</button>
  </div>
{/if}
