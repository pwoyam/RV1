<script lang="ts">
  import AppShell from '$lib/components/layout/AppShell.svelte';
  import CommandPalette from '$lib/components/layout/CommandPalette.svelte';
  import QuickCapture from '$lib/components/layout/QuickCapture.svelte';
  import SearchPalette from '$lib/components/layout/SearchPalette.svelte';
  import AutoPlanModal from '$lib/components/ui/AutoPlanModal.svelte';
  import { command } from '$lib/stores/command.svelte';
  import { capture } from '$lib/stores/capture.svelte';
  import { search } from '$lib/stores/search.svelte';

  function onKeydown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      command.toggle();
      return;
    }
    if (mod && !e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      search.toggle();
      return;
    }
    if (mod && e.shiftKey && e.code === 'Space') {
      e.preventDefault();
      capture.toggle();
      return;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="aurora-bg">
  <div class="blob-3"></div>
  <div class="blob-4"></div>
  <div class="veil"></div>
</div>

<AppShell />
<CommandPalette />
<QuickCapture />
<SearchPalette />
<AutoPlanModal />
