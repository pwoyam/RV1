<script lang="ts">
  import { tasks } from '$lib/stores/tasks.svelte';
  import { energy } from '$lib/stores/energy.svelte';
  import { autoSchedule } from '$lib/utils/scheduler';
  import { autoplan } from '$lib/stores/autoplan.svelte';

  function run() {
    const e = energy.today ?? 3;
    const result = autoSchedule(tasks.open, e, 9, 18);
    autoplan.show(result);
  }
</script>

<button
  onclick={run}
  class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors flex items-center gap-2"
>
  <span>✨</span>
  <span>برنامه امروز رو بچین</span>
</button>
