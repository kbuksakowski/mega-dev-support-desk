<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket, type Problem } from '#lib/kb/problems';

  // tickets: problem → URL of the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const ticketNo = (url?: string) => (url ? `#${url.split('/').pop()}` : 'not filed');
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong> problems · each needs its own ticket
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td>
          {#if g.problem === 'unplaced'}<code>unplaced</code>{:else}<b>{PROBLEMS[g.problem].title}</b><br /><span class="why">{PROBLEMS[g.problem].why}</span>{/if}
        </td>
        <td>{g.ids.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if g.problem !== 'unplaced' && tickets[g.problem]}<a href={tickets[g.problem]}>{ticketNo(tickets[g.problem])}</a>{:else}not filed{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .why { color: var(--muted); font-size: 0.85em; }
</style>
