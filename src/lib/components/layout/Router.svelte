<script lang="ts">
  import { route } from '$lib/stores/route.svelte';

  import Today from '$lib/routes/Today.svelte';
  import Habits from '$lib/routes/Habits.svelte';
  import Tasks from '$lib/routes/Tasks.svelte';
  import Journal from '$lib/routes/Journal.svelte';
  import Notes from '$lib/routes/Notes.svelte';
  import Goals from '$lib/routes/Goals.svelte';
  import Insights from '$lib/routes/Insights.svelte';
  import Settings from '$lib/routes/Settings.svelte';

  const pages = {
    today: Today,
    habits: Habits,
    tasks: Tasks,
    journal: Journal,
    notes: Notes,
    goals: Goals,
    insights: Insights,
    settings: Settings,
  };
</script>

{#key route.current}
  {@const Page = pages[route.current]}
  <div class="h-full" style="animation: fadeIn 0.25s ease-out;">
    <Page />
  </div>
{/key}

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
