<script lang="ts">
  import { command } from '$lib/stores/command.svelte';
  import { route, type RouteId } from '$lib/stores/route.svelte';

  const commands: { id: RouteId; label: string; hint: string; icon: string }[] = [
    { id: 'today',    label: 'Go to Today',    hint: 'dashboard',  icon: '◐' },
    { id: 'habits',   label: 'Go to Habits',   hint: 'track',      icon: '◎' },
    { id: 'tasks',    label: 'Go to Tasks',    hint: 'todo',       icon: '☑' },
    { id: 'journal',  label: 'Go to Journal',  hint: 'write',      icon: '✎' },
    { id: 'notes',    label: 'Go to Notes',    hint: 'notes',      icon: '❐' },
    { id: 'goals',    label: 'Go to Goals',    hint: 'objectives', icon: '◇' },
    { id: 'insights', label: 'Go to Insights', hint: 'stats',      icon: '◈' },
    { id: 'settings', label: 'Go to Settings', hint: 'preferences',icon: '⚙' },
  ];

  let query = $state('');
  let selected = $state(0);

  const filtered = $derived(
    query.trim() === ''
      ? commands
      : commands.filter((c) =>
          c.label.toLowerCase().includes(query.toLowerCase())
        )
  );

  function close() {
    command.hide();
    query = '';
    selected = 0;
  }

  function run(id: RouteId) {
    route.go(id);
    close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected = Math.min(selected + 1, filtered.length - 1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected = Math.max(selected - 1, 0);
    }
    if (e.key === 'Enter' && filtered[selected]) {
      run(filtered[selected].id);
    }
  }
</script>

{#if command.open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    style="background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);"
    onclick={close}
    role="presentation"
  >
    <div
      class="glass glass-lg w-[560px] max-w-[90vw] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Input -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <span class="text-white/40 text-lg">⌕</span>
        <input
          bind:value={query}
          onkeydown={onKeydown}
          placeholder="Type a command or search…"
          class="flex-1 bg-transparent border-none outline-none text-white/90 text-base placeholder:text-white/30"
          autofocus
        />
        <kbd class="text-[10px] text-white/30 border border-white/15 rounded px-1.5 py-0.5">ESC</kbd>
      </div>

      <!-- Results -->
      <ul class="max-h-[400px] overflow-y-auto py-2">
        {#each filtered as cmd, i}
          <li>
            <button
              onclick={() => run(cmd.id)}
              onmouseenter={() => selected = i}
              class="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors
                     {i === selected ? 'bg-white/8' : 'hover:bg-white/5'}"
            >
              <span class="w-5 text-center text-base opacity-60">{cmd.icon}</span>
              <span class="flex-1 text-sm text-white/90">{cmd.label}</span>
              <span class="text-[11px] text-white/30">{cmd.hint}</span>
            </button>
          </li>
        {/each}

        {#if filtered.length === 0}
          <li class="px-5 py-8 text-center text-sm text-white/30">
            No commands found
          </li>
        {/if}
      </ul>
    </div>
  </div>
{/if}
