// What #4471 actually holds: one entry per problem, not per subject line.
// causes.ts places a report by its tenant. The desk's own notes (desk-notes.json) set apart the reports
// where the date moved by one day: no month and day swapped, so neither the parser nor the form hint.
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

export function problemOf(r: Report, t: Tenant | undefined, oneDay: readonly string[]): Problem | 'unplaced' {
  if (oneDay.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem | 'unplaced'; ids: string[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDay);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        ids: rs.map((r) => r.id).sort(),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.ids.length - a.ids.length);
  return { merged: merged.length, groups };
}
