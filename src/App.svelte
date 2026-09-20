<script lang="ts">
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import CommandPalette from '$lib/components/layout/CommandPalette.svelte';
  import QuickCapture from '$lib/components/layout/QuickCapture.svelte';
  import { command } from '$lib/stores/command.svelte';
  import { capture } from '$lib/stores/capture.svelte';

  function onKeydown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;

    // ⌘K — Command Palette
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      command.toggle();
      return;
    }

    // ⌘⇧Space — Quick Capture
    if (mod && e.shiftKey && e.code === 'Space') {
      e.preventDefault();
      capture.toggle();
      return;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="aurora-bg"></div>
<AppShell />
<CommandPalette />
<QuickCapture />
