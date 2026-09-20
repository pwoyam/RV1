<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { tasks, DEFAULT_CONTEXTS } from '$lib/stores/tasks.svelte';
  import { parseTask } from '$lib/utils/nlp';
  import RecurrencePicker from '$lib/components/ui/RecurrencePicker.svelte';
  import { describeRule } from '$lib/utils/recurrence';
  import type { Task, TaskContext } from '$lib/types';

  let newTitle = $state('');
  let filter = $state<'open' | 'done' | 'all'>('open');
  let expandedId = $state<string | null>(null);
  let preview = $state<ReturnType<typeof parseTask> | null>(null);

  const base = $derived(
    filter === 'open' ? tasks.open :
    filter === 'done' ? tasks.completed :
    tasks.items
  );
  const visible = $derived(tasks.filtered(base));

  function onInput(e: Event) {
    newTitle = (e.target as HTMLInputElement).value;
    preview = newTitle.trim() ? parseTask(newTitle) : null;
  }

  function addTask() {
    if (!newTitle.trim()) return;
    const p = parseTask(newTitle);
    tasks.create({
      title: p.title,
      dueDate: p.dueDate,
      priority: p.priority ?? 'medium',
      context: p.context,
      estimatedMin: p.estimatedMin ?? 0,
      waitingFor: p.waitingFor,
    });
    newTitle = '';
    preview = null;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') addTask();
    if (e.key === 'Escape') { newTitle = ''; preview = null; }
  }

  function toggleExpand(id: string) {
    expandedId = expandedId === id ? null : id;
  }

  const priorityColor: Record<Task['priority'], string> = {
    low:    'bg-white/15',
    medium: 'bg-white/30',
    high:   'bg-white/60',
  };

  function contextMeta(ctx: TaskContext | null) {
    return DEFAULT_CONTEXTS.find((c) => c.id === ctx);
  }
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6">
    <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Tasks</p>
    <h1 class="text-3xl font-light tracking-tight text-white mt-1">
      {tasks.open.length} open
      <span class="text-white/30 text-lg">· {tasks.completed.length} done</span>
    </h1>

    <div class="mt-5 relative">
      <div class="flex items-center gap-3">
        <input
          value={newTitle}
          oninput={onInput}
          onkeydown={onKey}
          placeholder="مامان زنگ بزن @phone فردا ۵ عصر !high 15m"
          class="flex-1 glass glass-sm bg-transparent px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
        />
        <button
          onclick={addTask}
          disabled={!newTitle.trim()}
          class="glass glass-sm px-4 py-2.5 text-sm text-white/80 hover:bg-white/8 disabled:opacity-30 transition-colors"
        >Add</button>
      </div>

      {#if preview && (preview.dueDate || preview.priority || preview.context || preview.estimatedMin || preview.waitingFor)}
        <div class="mt-2 flex flex-wrap items-center gap-2 px-1 text-[11px] text-white/55">
          <span class="text-white/30">تشخیص:</span>
          {#if preview.title}
            <span class="px-2 py-0.5 rounded bg-white/6 text-white/80">«{preview.title}»</span>
          {/if}
          {#if preview.dueDate}
            <span class="px-2 py-0.5 rounded bg-white/6">📅 {preview.dueDate}{preview.dueTime ? ' ' + preview.dueTime : ''}</span>
          {/if}
          {#if preview.priority}
            <span class="px-2 py-0.5 rounded bg-white/6">!{preview.priority}</span>
          {/if}
          {#if preview.context}
            <span class="px-2 py-0.5 rounded bg-white/6">@{preview.context}</span>
          {/if}
          {#if preview.estimatedMin}
            <span class="px-2 py-0.5 rounded bg-white/6">⏱ {preview.estimatedMin}m</span>
          {/if}
          {#if preview.waitingFor}
            <span class="px-2 py-0.5 rounded bg-amber-200/10 text-amber-200/80">⏳ {preview.waitingFor}</span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="mt-4 flex gap-1">
      {#each ['open', 'done', 'all'] as f}
        <button
          onclick={() => filter = f as typeof filter}
          class="px-3 py-1 rounded-md text-xs transition-colors
                 {filter === f ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80'}"
        >{f}</button>
      {/each}

      <span class="flex-1"></span>

      <button
        onclick={() => tasks.showWaitingOnly = !tasks.showWaitingOnly}
        class="px-3 py-1 rounded-md text-xs transition-colors
               {tasks.showWaitingOnly ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80'}"
      >⏳ Waiting ({tasks.waiting.length})</button>
    </div>

    <div class="mt-3 flex flex-wrap gap-1">
      <button
        onclick={() => tasks.activeContext = 'all'}
        class="px-3 py-1 rounded-md text-xs transition-colors
               {tasks.activeContext === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}"
      >همه</button>
      {#each DEFAULT_CONTEXTS as c}
        <button
          onclick={() => tasks.activeContext = c.id}
          class="px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5
                 {tasks.activeContext === c.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}"
        >
          <span class="opacity-60">{c.icon}</span>
          <span>{c.label}</span>
          {#if tasks.countByContext(c.id) > 0}
            <span class="text-white/30 tabular-nums">{tasks.countByContext(c.id)}</span>
          {/if}
        </button>
      {/each}
    </div>
  </GlassPanel>

  <GlassPanel padding="p-2" class="flex-1 overflow-y-auto">
    <ul class="flex flex-col">
      {#each visible as task (task.id)}
        <li class="group rounded-xl hover:bg-white/3 transition-colors">
          <div class="flex items-center gap-3 px-4 py-3">
            <button
              onclick={() => tasks.toggle(task.id)}
              class="w-4 h-4 rounded-md border flex items-center justify-center text-[10px] text-black transition-colors shrink-0
                     {task.done ? 'bg-white/90 border-white/90' : 'border-white/25 hover:border-white/50'}"
            >
              {task.done ? '✓' : ''}
            </button>

            <span class="w-1.5 h-1.5 rounded-full shrink-0 {priorityColor[task.priority]}"></span>

            <button
              onclick={() => toggleExpand(task.id)}
              class="flex-1 text-left text-sm {task.done ? 'text-white/35 line-through' : 'text-white/90'} truncate"
            >
              {task.title}
            </button>

            {#if task.dueDate}
              <span class="text-[10px] text-white/45 px-2 py-0.5 rounded-md bg-white/6 shrink-0 tabular-nums">
                📅 {task.dueDate.slice(5)}
              </span>
            {/if}

            {#if task.recurrence}
              <span class="text-[10px] text-white/45 px-2 py-0.5 rounded-md bg-white/6 shrink-0 flex items-center gap-1">
                🔁 {describeRule(task.recurrence)}
              </span>
            {/if}

            {#if task.context}
              {@const cm = contextMeta(task.context)}
              <span class="text-[10px] text-white/45 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/6 shrink-0">
                <span class="opacity-70">{cm?.icon ?? '@'}</span>
                <span>{cm?.label ?? task.context}</span>
              </span>
            {/if}

            {#if task.waitingFor}
              <span class="text-[10px] text-amber-200/70 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-200/10 shrink-0">
                ⏳ {task.waitingFor}
              </span>
            {/if}

            {#if task.estimatedMin > 0}
              <span class="text-xs text-white/35 tabular-nums shrink-0">{task.estimatedMin}m</span>
            {/if}

            <button
              onclick={() => tasks.remove(task.id)}
              class="opacity-0 group-hover:opacity-100 text-xs text-white/30 hover:text-red-300/70 transition-all px-2 shrink-0"
            >×</button>
          </div>

          {#if expandedId === task.id}
            <div class="px-4 pb-3 flex flex-col gap-3 border-t border-white/5 pt-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] uppercase tracking-widest text-white/40 w-16">Context</span>
                {#each DEFAULT_CONTEXTS as c}
                  <button
                    onclick={() => tasks.setContext(task.id, task.context === c.id ? null : c.id)}
                    class="px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5
                           {task.context === c.id
                             ? 'bg-white/15 text-white'
                             : 'text-white/45 hover:text-white/80 hover:bg-white/5'}"
                  >
                    <span class="opacity-70">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                {/each}
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase tracking-widest text-white/40 w-16">Waiting</span>
                <input
                  type="text"
                  value={task.waitingFor ?? ''}
                  oninput={(e) => tasks.setWaiting(task.id, (e.target as HTMLInputElement).value || null)}
                  placeholder="منتظر کی / چی؟"
                  class="flex-1 glass glass-sm bg-transparent px-3 py-1.5 text-xs text-white/85 placeholder:text-white/25 outline-none"
                />
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase tracking-widest text-white/40 w-16">Repeat</span>
                <RecurrencePicker
                  value={task.recurrence}
                  onChange={(r) => tasks.setRecurrence(task.id, r)}
                />
              </div>


            </div>
          {/if}
        </li>
      {/each}

      {#if visible.length === 0}
        <li class="px-4 py-12 text-center text-sm text-white/30">
          {#if tasks.showWaitingOnly}
            هیچ تسکی در انتظار نیست ✨
          {:else if tasks.activeContext !== 'all'}
            تسکی توی این context نیست
          {:else if filter === 'open'}
            تسک بازی نداری. عالیه.
          {:else}
            چیزی اینجا نیست
          {/if}
        </li>
      {/if}
    </ul>
  </GlassPanel>
</div>
