<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { notes } from '$lib/stores/notes.svelte';

  function onTitle(e: Event) {
    const note = notes.active;
    if (!note) return;
    notes.update(note.id, { title: (e.target as HTMLInputElement).value });
  }

  function onContent(e: Event) {
    const note = notes.active;
    if (!note) return;
    notes.update(note.id, { content: (e.target as HTMLTextAreaElement).value });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short',
    });
  }
</script>

<div class="h-full flex gap-3 overflow-hidden">
  <!-- لیست نوت‌ها -->
  <GlassPanel variant="strong" padding="p-3" class="w-[280px] flex flex-col">
    <div class="px-3 pt-3 pb-3 flex items-center justify-between">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Notes</p>
      <button
        onclick={() => notes.create()}
        class="text-xs text-white/60 hover:text-white transition-colors"
      >
        + New
      </button>
    </div>

    <input
      bind:value={notes.searchQuery}
      placeholder="Search…"
      class="mx-3 mb-3 glass glass-sm bg-transparent px-3 py-2 text-xs text-white/80 placeholder:text-white/30 outline-none"
    />

    <ul class="flex-1 overflow-y-auto flex flex-col gap-0.5">
      {#each notes.filtered as note (note.id)}
        <li>
          <button
            onclick={() => notes.activeId = note.id}
            class="w-full text-left px-3 py-2.5 rounded-xl transition-colors
                   {note.id === notes.activeId ? 'bg-white/10' : 'hover:bg-white/5'}"
          >
            <p class="text-sm text-white/85 truncate">{note.title}</p>
            <p class="text-[10px] text-white/35 mt-0.5">
              {formatDate(note.updatedAt)}
            </p>
          </button>
        </li>
      {/each}

      {#if notes.filtered.length === 0}
        <li class="px-3 py-6 text-center text-xs text-white/30">No notes</li>
      {/if}
    </ul>
  </GlassPanel>

  <!-- ویرایشگر -->
  <GlassPanel padding="p-8" class="flex-1 flex flex-col overflow-hidden">
    {#if notes.active}
      {@const note = notes.active}
      <div class="flex items-start justify-between mb-4">
        <input
          value={note.title}
          oninput={onTitle}
          placeholder="Untitled"
          class="flex-1 bg-transparent border-none outline-none text-2xl font-light text-white placeholder:text-white/20"
        />
        <button
          onclick={() => notes.remove(note.id)}
          class="text-xs text-white/25 hover:text-red-300/70 px-2 transition-colors"
        >
          Delete
        </button>
      </div>

      <p class="text-[10px] uppercase tracking-widest text-white/30 mb-4">
        Updated {formatDate(note.updatedAt)}
      </p>

      <textarea
        value={note.content}
        oninput={onContent}
        placeholder="Start writing… (Markdown supported later)"
        class="flex-1 w-full bg-transparent border-none outline-none resize-none text-white/85 text-base leading-relaxed placeholder:text-white/25 font-light"
      ></textarea>
    {:else}
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <p class="text-6xl opacity-10 mb-4">❐</p>
          <p class="text-sm text-white/40">Select a note or create a new one</p>
        </div>
      </div>
    {/if}
  </GlassPanel>
</div>
