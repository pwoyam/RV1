import { mount } from 'svelte';
import './app.css';
import { db } from '$lib/utils/db';
import { backupStore } from '$lib/stores/backup.svelte';

async function bootstrap() {
  try {
    await db.init();
    await backupStore.autoSnapshot();
  } catch (e) {
    console.error('[bootstrap] failed', e);
  }

  const { default: App } = await import('./App.svelte');
  mount(App, { target: document.getElementById('app')! });
}

bootstrap();
