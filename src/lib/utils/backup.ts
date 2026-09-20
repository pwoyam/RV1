import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile, exists, mkdir, readDir } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

export type BackupData = {
  version: number;
  createdAt: number;
  app: 'aura';
  data: Record<string, unknown[]>;
};

const BACKUP_VERSION = 1;
const SNAPSHOT_DIR = 'snapshots';
const KEEP_DAILY = 30;
const KEEP_MONTHLY = 12;

async function getBackupDir(): Promise<string> {
  const base = await appDataDir();
  const dir = await join(base, SNAPSHOT_DIR);
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

export const backup = {
  /**
   * خروجی کامل داده به صورت JSON
   */
  exportAll(collections: Record<string, unknown[]>) {
    const payload: BackupData = {
      version: BACKUP_VERSION,
      createdAt: Date.now(),
      app: 'aura',
      data: collections,
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * ذخیره‌ی خروجی روی دیسک (با dialog)
   */
  async exportToFile(collections: Record<string, unknown[]>) {
    const json = backup.exportAll(collections);
    const path = await save({
      defaultPath: `aura-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'AURA Backup', extensions: ['json'] }],
    });
    if (!path) return null;
    await writeTextFile(path, json);
    return path;
  },

  /**
   * بازگردانی از فایل
   */
  async importFromFile(): Promise<BackupData | null> {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'AURA Backup', extensions: ['json'] }],
    });
    if (!selected || typeof selected !== 'string') return null;
    const raw = await readTextFile(selected);
    const parsed = JSON.parse(raw) as BackupData;
    if (parsed.app !== 'aura') {
      throw new Error('این فایل backup AURA نیست');
    }
    return parsed;
  },

  /**
   * snapshot خودکار روزانه
   */
  async takeSnapshot(collections: Record<string, unknown[]>) {
    const dir = await getBackupDir();
    const today = new Date().toISOString().slice(0, 10);
    const file = await join(dir, `${today}.json`);

    if (await exists(file)) {
      return { created: false, file };
    }

    const json = backup.exportAll(collections);
    await writeTextFile(file, json);
    await backup.pruneOld(dir);
    return { created: true, file };
  },

  /**
   * حذف snapshotهای قدیمی (نگه‌داری ۳۰ روزانه)
   */
  async pruneOld(dir: string) {
    const entries = await readDir(dir);
    const files = entries
      .filter((e) => e.name?.endsWith('.json'))
      .map((e) => e.name!)
      .sort()
      .reverse();

    const toDelete = files.slice(KEEP_DAILY);
    const { remove } = await import('@tauri-apps/plugin-fs');
    for (const f of toDelete) {
      const p = await join(dir, f);
      await remove(p).catch(() => {});
    }
  },

  /**
   * لیست snapshotهای موجود
   */
  async listSnapshots(): Promise<{ name: string; path: string; date: string }[]> {
    const dir = await getBackupDir();
    const entries = await readDir(dir);
    const files = entries.filter((e) => e.name?.endsWith('.json'));
    const out = [];
    for (const f of files) {
      out.push({
        name: f.name!,
        path: await join(dir, f.name!),
        date: f.name!.replace('.json', ''),
      });
    }
    return out.sort((a, b) => b.date.localeCompare(a.date));
  },

  async restoreFromSnapshot(path: string): Promise<BackupData> {
    const raw = await readTextFile(path);
    const parsed = JSON.parse(raw) as BackupData;
    if (parsed.app !== 'aura') throw new Error('snapshot نامعتبره');
    return parsed;
  },
};
