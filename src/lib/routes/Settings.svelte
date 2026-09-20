<script lang="ts">
  import GlassPanel from '$lib/components/glass/GlassPanel.svelte';
  import { lifeAreas, type LifeArea } from '$lib/stores/lifeAreas.svelte';
  import { backupStore } from '$lib/stores/backup.svelte';

  let editingId = $state<string | null>(null);
  let draft = $state<{ name: string; icon: string; weight: number }>({ name: '', icon: '◆', weight: 20 });
  let snapshots = $state<{ name: string; path: string; date: string }[]>([]);

  const icons = ['◆', '◇', '◈', '◎', '◉', '✦', '✧', '♡', '★', '☆', '♦', '●'];
  const totalWeight = $derived(lifeAreas.areas.reduce((s, a) => s + a.weight, 0));

  async function loadSnapshots() {
    snapshots = await backupStore.listSnapshots();
  }

  $effect(() => {
    loadSnapshots();
  });

  function startEdit(area: LifeArea) {
    editingId = area.id;
    draft = { name: area.name, icon: area.icon, weight: area.weight };
  }

  function cancelEdit() { editingId = null; }

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
    lifeAreas.add({ name: 'New Area', icon: '◆', color: '#e5e5e8', weight: 10 });
  }

  function remove(id: string) {
    if (confirm('این حوزه حذف بشه؟')) lifeAreas.remove(id);
  }
</script>

<div class="h-full flex flex-col gap-3 overflow-y-auto pr-1">
  <!-- هدر -->
  <GlassPanel padding="p-6">
    <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Settings</p>
    <h1 class="text-3xl font-light tracking-tight text-white mt-1">تنظیمات</h1>
  </GlassPanel>

  <!-- Life Areas -->
  <GlassPanel padding="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Life Areas</p>
        <p class="text-xs text-white/40 mt-1">مجموع وزن‌ها: {totalWeight}%</p>
      </div>
      <button
        onclick={addNew}
        class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors"
      >+ Add Area</button>
    </div>

    <ul class="flex flex-col divide-y divide-white/5">
      {#each lifeAreas.areas as area (area.id)}
        <li class="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
          {#if editingId === area.id}
            <input
              bind:value={draft.name}
              class="flex-1 bg-transparent border-b border-white/20 outline-none text-white/90 text-sm pb-1 focus:border-white/50 transition-colors"
              placeholder="Name"
            />
            <select
              bind:value={draft.icon}
              class="bg-transparent border border-white/15 rounded-md px-2 py-1 text-sm text-white/80 outline-none"
            >
              {#each icons as ic}<option value={ic}>{ic}</option>{/each}
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
          {:else}
            <span class="text-xl w-6 text-center opacity-70">{area.icon}</span>
            <span class="flex-1 text-sm text-white/90">{area.name}</span>
            <span class="text-xs text-white/40 tabular-nums">{area.weight}%</span>
            <button onclick={() => startEdit(area)} class="text-xs text-white/40 hover:text-white/80 px-2 transition-colors">Edit</button>
            <button onclick={() => remove(area.id)} class="text-xs text-white/30 hover:text-red-300/70 px-2 transition-colors">Delete</button>
          {/if}
        </li>
      {/each}
    </ul>
  </GlassPanel>

  <!-- Backup -->
  <GlassPanel padding="p-6">
    <div class="mb-4">
      <p class="text-[11px] uppercase tracking-[0.25em] text-white/40">Backup</p>
      <p class="text-xs text-white/40 mt-1">
        snapshot روزانه خودکار · {backupStore.lastSnapshotAt ? 'امروز گرفته شد' : 'اولین snapshot این اجرا گرفته می‌شه'}
      </p>
    </div>

    <div class="flex gap-2 mb-5">
      <button
        onclick={() => backupStore.exportToFile()}
        class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors"
      >Export to file…</button>
      <button
        onclick={() => backupStore.importFromFile()}
        class="glass glass-sm px-4 py-2 text-xs text-white/80 hover:bg-white/8 transition-colors"
      >Import from file…</button>
      <button
        onclick={() => loadSnapshots()}
        class="glass glass-sm px-4 py-2 text-xs text-white/60 hover:bg-white/8 transition-colors"
      >Refresh</button>
    </div>

    {#if backupStore.message}
      <p class="text-xs mb-4 {backupStore.status === 'error' ? 'text-red-300' : 'text-emerald-300'}">
        {backupStore.message}
      </p>
    {/if}

    <p class="text-[11px] uppercase tracking-widest text-white/30 mb-2">Snapshots ({snapshots.length})</p>
    <ul class="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
      {#each snapshots.slice(0, 10) as s}
        <li class="flex items-center gap-3 py-1.5 text-xs">
          <span class="text-white/70 tabular-nums">{s.date}</span>
          <span class="flex-1 text-white/30 truncate">{s.name}</span>
        </li>
      {/each}
      {#if snapshots.length === 0}
        <li class="text-xs text-white/30 py-2">هنوز snapshot نیست</li>
      {/if}
    </ul>
  </GlassPanel>
</div>
