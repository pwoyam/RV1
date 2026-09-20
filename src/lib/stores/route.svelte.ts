export type RouteId =
  | 'today'
  | 'habits'
  | 'tasks'
  | 'journal'
  | 'notes'
  | 'goals'
  | 'insights'
  | 'settings';

class RouteStore {
  current = $state<RouteId>('today');

  go(id: RouteId) {
    this.current = id;
  }
}

export const route = new RouteStore();
