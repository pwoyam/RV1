<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { lifeAreas, type LifeArea } from '$lib/stores/lifeAreas.svelte';

  let editingId = $state<string | null>(null);
  let draft = $state<{ name: string; icon: string; weight: number }>({ name: '', icon: '◆', weight: 20 });

  const icons = ['◆', '◇', '◈', '◎', '◉', '✦', '✧', '♡', '★', '☆', '♦', '●'];
  const totalWeight = $derived(lifeAreas.areas.reduce((s, a) => s + a.weight, 0));

  function startEdit(area: LifeArea) {
    editingId = area.id;
    draft = { name: area.name, icon: area.icon, weight: area.weight };
  }

  function cancelEdit() {
    editingId = null;
  }

  function saveEdit() {
    if (!editingId || !draft.name.trim()) return;
    lifeAreas.update(editingId, {
      name: draft.name.trim(),
      icon: draft.icon,
      weight: draft.weight,
    });
    editingId = null;
  }

  function addNew() {
    lifeAreas.add({
      name: 'New Area',
      icon: '◆',
      color: '#e5e5e8',
      weight: 10,
    });
  }

  function remove(id: string) {
    if (confirm('Delete this life area?')) {
      lifeAreas.remove(id);
    }
  }
</script>

<div class="h-full flex flex-col gap-3 overflow-hidden">
  <GlassPanel padding="p-6" class="flex items-center justify-between">
    <div>
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Settings</p>
      <h1 class="text-3xl font-light tracking-tight text-white mt-1">Life Areas</h1>
      <p class="text-xs text-white/40 mt-2">Define what matters to you. Weighted total: {totalWeight}%</p>
    </div>
    <button
      onclick={addNew}
      class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors"
    >
      + Add Area
    </button>
  </GlassPanel>

  <GlassPanel padding="p-2" class="flex-1 overflow-y-auto">
    <ul class="flex flex-col">
      {#each lifeAreas.areas as area, i (area.id)}
        <li class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 transition-colors">
          {#if editingId === area.id}
            <!-- حالت ویرایش -->
            <div class="flex-1 flex items-center gap-3">
              <input
                bind:value={draft.name}
                class="flex-1 bg-transparent border-b border-white/20 outline-none text-white/90 text-sm pb-1 focus:border-white/50 transition-colors"
                placeholder="Name"
              />
              <select
                bind:value={draft.icon}
                class="bg-transparent border border-white/15 rounded-md px-2 py-1 text-sm text-white/80 outline-none"
              >
                {#each icons as ic}
                  <option value={ic}>{ic}</option>
                {/each}
              </select>
              <input
                type="number"
                bind:value={draft.weight}
                min="0"
                max="100"
                class="w-16 bg-transparent border border-white/15 rounded-md px-2 py-1 text-sm text-white/80 outline-none"
              />
              <span class="text-xs text-white/40">%</span>
              <button onclick={saveEdit} class="text-xs text-white/80 hover:text-white px-2">Save</button>
              <button onclick={cancelEdit} class="text-xs text-white/40 hover:text-white/70 px-2">Cancel</button>
            </div>
          {:else}
            <!-- حالت نمایش -->
            <span class="text-xl w-6 text-center opacity-70">{area.icon}</span>
            <span class="flex-1 text-sm text-white/90">{area.name}</span>
            <span class="text-xs text-white/40 tabular-nums">{area.weight}%</span>
            <button onclick={() => startEdit(area)} class="text-xs text-white/40 hover:text-white/80 px-2 transition-colors">Edit</button>
            <button onclick={() => remove(area.id)} class="text-xs text-white/30 hover:text-red-300/70 px-2 transition-colors">Delete</button>
          {/if}
        </li>
      {/each}

      {#if lifeAreas.areas.length === 0}
        <li class="px-4 py-12 text-center text-sm text-white/30">
          No life areas yet. Add one to get started.
        </li>
      {/if}
    </ul>
  </GlassPanel>
</div>
