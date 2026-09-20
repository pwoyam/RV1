<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Router from './Router.svelte';
</script>

<div class="h-screen w-screen p-8 flex gap-3">
  <Sidebar />
  <main class="flex-1 min-w-0 overflow-hidden">
    <Router />
  </main>
</div>
