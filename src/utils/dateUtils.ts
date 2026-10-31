export const DateUtils = {
  todayStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  nowTimeStr(): string {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  },

  daysAgoStr(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  daysFromNowStr(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getDayLabel(dateStr: string): string {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  },

  daysBetween(d1: string, d2: string): number {
    try {
      const p1 = d1.split('-').map(Number);
      const p2 = d2.split('-').map(Number);
      const date1 = new Date(p1[0], p1[1] - 1, p1[2]);
      const date2 = new Date(p2[0], p2[1] - 1, p2[2]);
      const diffMs = date2.getTime() - date1.getTime();
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  },

  getDatesBetween(startDateStr: string, endDateStr: string): string[] {
    const result: string[] = [];
    try {
      const p1 = startDateStr.split('-').map(Number);
      const p2 = endDateStr.split('-').map(Number);
      const cur = new Date(p1[0], p1[1] - 1, p1[2]);
      const end = new Date(p2[0], p2[1] - 1, p2[2]);
      if (cur > end) return [];
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        result.push(`${y}-${m}-${d}`);
        cur.setDate(cur.getDate() + 1);
      }
    } catch {
      // ignore
    }
    return result;
  },

  currentWeekMondayStr(): string {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  },

  daysRemainingInWeek(): number {
    const d = new Date().getDay();
    switch (d) {
      case 0: return 0;
      case 1: return 6;
      case 2: return 5;
      case 3: return 4;
      case 4: return 3;
      case 5: return 2;
      case 6: return 1;
      default: return 0;
    }
  }
};
