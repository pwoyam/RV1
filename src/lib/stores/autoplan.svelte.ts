import type { ScheduleResult } from '$lib/utils/scheduler';

class AutoPlanStore {
  open = $state(false);
  result = $state<ScheduleResult | null>(null);

  show(r: ScheduleResult) {
    this.result = r;
    this.open = true;
  }

  hide() {
    this.open = false;
  }
}

export const autoplan = new AutoPlanStore();
