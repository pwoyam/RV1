<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { tasks } from '$lib/stores/tasks.svelte';
  import type { Task } from '$lib/types';

  let newTitle = $state('');
  let filter = $state<'open' | 'done' | 'all'>('open');

  const visible = $derived(
    filter === 'open' ? tasks.open :
    filter === 'done' ? tasks.completed :
    tasks.items
  );

  function addTask() {
    if (!newTitle.trim()) return;
    tasks.create({ title: newTitle.trim() });
    newTitle = '';
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') addTask();
  }

  const priorityColor: Record<Task['priority'], string> = {
    low:    'bg-white/15',
    medium: 'bg-white/30',
    high:   'bg-white/60',
  };
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6">
    <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Tasks</p>
    <h1 class="text-3xl font-light tracking-tight text-white mt-1">
      {tasks.open.length} open
      <span class="text-white/30 text-lg">· {tasks.completed.length} done</span>
    </h1>

    <div class="mt-5 flex items-center gap-3">
      <input
        bind:value={newTitle}
        onkeydown={onKey}
        placeholder="Add a task…"
        class="flex-1 glass glass-sm bg-transparent px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
      />
      <button
        onclick={addTask}
        disabled={!newTitle.trim()}
        class="glass glass-sm px-4 py-2.5 text-sm text-white/80 hover:bg-white/8 disabled:opacity-30 transition-colors"
      >
        Add
      </button>
    </div>

    <div class="mt-4 flex gap-1">
      {#each ['open', 'done', 'all'] as f}
        <button
          onclick={() => filter = f as typeof filter}
          class="px-3 py-1 rounded-md text-xs transition-colors
                 {filter === f ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80'}"
        >
          {f}
        </button>
      {/each}
    </div>
  </GlassPanel>

  <GlassPanel padding="p-2" class="flex-1 overflow-y-auto">
    <ul class="flex flex-col">
      {#each visible as task (task.id)}
        <li class="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 transition-colors">
          <button
            onclick={() => tasks.toggle(task.id)}
            class="w-4 h-4 rounded-md border flex items-center justify-center text-[10px] text-black transition-colors
                   {task.done ? 'bg-white/90 border-white/90' : 'border-white/25 hover:border-white/50'}"
          >
            {task.done ? '✓' : ''}
          </button>

          <span class="w-1.5 h-1.5 rounded-full {priorityColor[task.priority]}"></span>

          <span class="flex-1 text-sm {task.done ? 'text-white/35 line-through' : 'text-white/90'}">
            {task.title}
          </span>

          {#if task.estimatedMin > 0}
            <span class="text-xs text-white/35 tabular-nums">{task.estimatedMin}m</span>
          {/if}

          <button
            onclick={() => tasks.remove(task.id)}
            class="opacity-0 group-hover:opacity-100 text-xs text-white/30 hover:text-red-300/70 transition-all px-2"
          >
            ×
          </button>
        </li>
      {/each}

      {#if visible.length === 0}
        <li class="px-4 py-12 text-center text-sm text-white/30">
          {filter === 'open' ? 'No open tasks. Nice.' : 'Nothing here yet.'}
        </li>
      {/if}
    </ul>
  </GlassPanel>
</div>
