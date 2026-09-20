import { tasks } from './tasks.svelte';
import { habits } from './habits.svelte';
import { journal } from './journal.svelte';
import { notes } from './notes.svelte';
import { goals } from './goals.svelte';
import { route, type RouteId } from './route.svelte';

export type SearchResult = {
  id: string;
  kind: 'task' | 'habit' | 'journal' | 'note' | 'goal';
  title: string;
  subtitle: string;
  icon: string;
  goTo: RouteId;
  action?: () => void;
};

class SearchStore {
  open = $state(false);

  show()  { this.open = true; }
  hide()  { this.open = false; }
  toggle() { this.open = !this.open; }

  query(q: string): SearchResult[] {
    const term = q.trim().toLowerCase();
    if (term.length < 1) return [];

    const results: SearchResult[] = [];

    for (const t of tasks.items) {
      if (t.title.toLowerCase().includes(term)) {
        results.push({
          id: t.id, kind: 'task', icon: '☑',
          title: t.title,
          subtitle: t.done ? 'Task · done' : 'Task · open',
          goTo: 'tasks',
        });
      }
    }

    for (const h of habits.habits) {
      if (h.title.toLowerCase().includes(term)) {
        results.push({
          id: h.id, kind: 'habit', icon: '◎',
          title: h.title,
          subtitle: 'Habit',
          goTo: 'habits',
        });
      }
    }

    for (const j of journal.items) {
      if (j.content.toLowerCase().includes(term)) {
        const idx = j.content.toLowerCase().indexOf(term);
        const snippet = j.content.slice(Math.max(0, idx - 20), idx + 60);
        results.push({
          id: j.id, kind: 'journal', icon: '✎',
          title: j.date,
          subtitle: '…' + snippet.replace(/\n/g, ' ') + '…',
          goTo: 'journal',
        });
      }
    }

    for (const n of notes.items) {
      if (n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)) {
        results.push({
          id: n.id, kind: 'note', icon: '❐',
          title: n.title,
          subtitle: 'Note',
          goTo: 'notes',
        });
      }
    }

    for (const g of goals.items) {
      if (g.title.toLowerCase().includes(term) || g.description.toLowerCase().includes(term)) {
        results.push({
          id: g.id, kind: 'goal', icon: '◇',
          title: g.title,
          subtitle: `Goal · ${g.horizon}`,
          goTo: 'goals',
        });
      }
    }

    return results.slice(0, 30);
  }

  run(result: SearchResult) {
    route.go(result.goTo);
    this.hide();
  }
}

export const search = new SearchStore();
