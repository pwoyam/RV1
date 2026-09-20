<script lang="ts">
  import { capture } from '$lib/stores/capture.svelte';

  let text = $state('');

  function close() {
    capture.hide();
    text = '';
  }

  function submit() {
    if (!text.trim()) return;
    // TODO: در فاز بعد به دیتابیس وصل می‌شه
    console.log('Captured:', text);
    close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
  }
</script>

{#if capture.open}
  <div
    class="fixed inset-0 z-50 flex items-end justify-center pb-[15vh]"
    style="background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);"
    onclick={close}
    role="presentation"
  >
    <div
      class="glass glass-lg w-[600px] max-w-[90vw] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div class="px-5 py-3 border-b border-white/8 flex items-center gap-3">
        <span class="text-white/40 text-sm">⚡</span>
        <span class="text-xs uppercase tracking-[0.2em] text-white/40">Quick Capture</span>
      </div>

      <textarea
        bind:value={text}
        onkeydown={onKeydown}
        placeholder="What's on your mind?"
        rows="3"
        class="w-full bg-transparent border-none outline-none text-white/90 text-base placeholder:text-white/30 px-5 py-4 resize-none"
        autofocus
      />

      <div class="px-5 py-3 border-t border-white/8 flex items-center justify-between text-[11px] text-white/35">
        <span>⌘ + Enter to save · Esc to cancel</span>
        <button
          onclick={submit}
          disabled={!text.trim()}
          class="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}
