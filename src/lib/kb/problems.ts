// What #4471 actually holds: one entry per problem, not per subject line.
// Counted the desk's way (causes.ts): every report under the cause its tenant gives it. The reports the desk
// read as a one-day move (desk-notes.json) are a problem of their own, but they stay counted where they are
// filed, like the desk's footnote under CauseTable. So the one-day ticket overlaps the parser ticket.
import type { Report, Tenant } from '#lib/kb/causes';
import { causeOf, uniqueById } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export const PROBLEMS: Record<Problem, { title: string; why: string }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    why: 'Every tenant on file writes the day first. The shared parser reads month first, so day and month swap.',
  },
  hint: {
    title: 'booking-v3 form hints MM/DD/YYYY but reads the date day first',
    why: 'People type what the hint under the date field tells them; the form then reads it the tenant’s way.',
  },
  'one-day': {
    title: 'Invite date moves by one day',
    why: 'Day and month stay put; the date lands one day early or late, or differs by where the client is.',
  },
};

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  ids: string[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For one-day: the causes these reports stay filed and counted under.
  filedUnder?: string[];
};

function group(problem: ProblemGroup['problem'], rs: Report[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    ids: rs.map((r) => r.id).sort(),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const c = causeOf(r, tenantOf(r)) ?? 'unplaced';
    by.set(c, [...(by.get(c) ?? []), r]);
  }
  const groups = [...by.entries()].map(([p, rs]) => group(p, rs)).sort((a, b) => b.ids.length - a.ids.length);
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    groups.push({
      ...group('one-day', moved),
      filedUnder: [...new Set(moved.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced'))],
    });
  }
  return { merged: merged.length, groups };
}
