<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Today from '$lib/routes/Today.svelte';
</script>

<div class="h-screen w-screen p-3 flex gap-3">
  <Sidebar />
  <main class="flex-1 min-w-0 overflow-hidden">
    <Today />
  </main>
</div>
