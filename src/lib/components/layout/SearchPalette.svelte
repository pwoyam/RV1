<script lang="ts">
  import { search, type SearchResult } from '$lib/stores/search.svelte';

  let query = $state('');
  let selected = $state(0);

  const results = $derived(search.query(query));

  function close() {
    search.hide();
    query = '';
    selected = 0;
  }

  function run(r: SearchResult) {
    search.run(r);
    close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected = Math.min(selected + 1, results.length - 1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected = Math.max(selected - 1, 0);
    }
    if (e.key === 'Enter' && results[selected]) {
      run(results[selected]);
    }
  }
</script>

{#if search.open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    style="background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);"
    onclick={close}
    role="presentation"
  >
    <div
      class="glass glass-lg w-[600px] max-w-[90vw] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <span class="text-white/40 text-lg">⌕</span>
        <input
          bind:value={query}
          onkeydown={onKeydown}
          placeholder="Search everything…"
          class="flex-1 bg-transparent border-none outline-none text-white/90 text-base placeholder:text-white/30"
          autofocus
        />
        <kbd class="text-[10px] text-white/30 border border-white/15 rounded px-1.5 py-0.5">ESC</kbd>
      </div>

      {#if query.trim().length === 0}
        <div class="px-5 py-8 text-center text-xs text-white/35">
          تایپ کن تا در تسک‌ها، عادت‌ها، ژورنال، نوت‌ها و اهداف جستجو کنه
        </div>
      {:else if results.length === 0}
        <div class="px-5 py-8 text-center text-sm text-white/30">
          No results for "{query}"
        </div>
      {:else}
        <ul class="max-h-[400px] overflow-y-auto py-2">
          {#each results as r, i (r.kind + r.id)}
            <li>
              <button
                onclick={() => run(r)}
                onmouseenter={() => selected = i}
                class="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors
                       {i === selected ? 'bg-white/8' : 'hover:bg-white/5'}"
              >
                <span class="w-5 text-center text-base opacity-60">{r.icon}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white/90 truncate">{r.title}</p>
                  <p class="text-[11px] text-white/40 truncate">{r.subtitle}</p>
                </div>
                <span class="text-[10px] uppercase tracking-widest text-white/25">{r.kind}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}
