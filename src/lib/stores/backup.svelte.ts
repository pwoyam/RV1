import { db } from '$lib/utils/db';
import { backup as backupUtil } from '$lib/utils/backup';

const COLLECTIONS = ['life_areas', 'tasks', 'habits', 'habit_logs', 'journal', 'notes', 'goals'];

class BackupStore {
  lastSnapshotAt = $state<number | null>(null);
  status = $state<'idle' | 'working' | 'ok' | 'error'>('idle');
  message = $state('');

  /**
   * گرفتن snapshot خودکار در start اپ
   */
  async autoSnapshot() {
    try {
      const data: Record<string, unknown[]> = {};
      for (const c of COLLECTIONS) {
        data[c] = db.all(c);
      }
      const result = await backupUtil.takeSnapshot(data);
      if (result.created) {
        this.lastSnapshotAt = Date.now();
        console.log('[backup] snapshot روزانه ذخیره شد');
      }
    } catch (e) {
      console.error('[backup] auto snapshot failed', e);
    }
  }

  /**
   * خروجی گرفتن با dialog
   */
  async exportToFile() {
    this.status = 'working';
    this.message = 'در حال آماده‌سازی…';
    try {
      const data: Record<string, unknown[]> = {};
      for (const c of COLLECTIONS) data[c] = db.all(c);
      const path = await backupUtil.exportToFile(data);
      if (path) {
        this.status = 'ok';
        this.message = 'ذخیره شد: ' + path.split('/').pop();
      } else {
        this.status = 'idle';
        this.message = '';
      }
    } catch (e) {
      this.status = 'error';
      this.message = 'خطا در ذخیره‌سازی';
      console.error(e);
    }
  }

  /**
   * بازگردانی از فایل
   */
  async importFromFile() {
    if (!confirm('داده‌های فعلی جایگزین می‌شن. ادامه؟')) return;
    this.status = 'working';
    this.message = 'در حال بازگردانی…';
    try {
      const payload = await backupUtil.importFromFile();
      if (!payload) {
        this.status = 'idle';
        this.message = '';
        return;
      }
      for (const c of COLLECTIONS) {
        db.clear(c);
        const items = (payload.data[c] ?? []) as { id: string }[];
        for (const item of items) {
          db.put(c, item);
        }
      }
      this.status = 'ok';
      this.message = 'بازگردانی شد. لطفاً اپ رو دوباره اجرا کن.';
      setTimeout(() => location.reload(), 1500);
    } catch (e) {
      this.status = 'error';
      this.message = 'فایل نامعتبره';
      console.error(e);
    }
  }

  async listSnapshots() {
    return backupUtil.listSnapshots();
  }
}

export const backupStore = new BackupStore();
