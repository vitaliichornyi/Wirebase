import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  getClickFilterOptions,
  getClickStats,
} from '@/features/dashboard/actions/click-stats';
import { activeClientHolder } from '@/test-utils/mock-supabase-server';
import {
  createTestUser,
  deleteTestUser,
  type TestUser,
} from '@/test-utils/supabase';
import {
  createFlowRow,
  createInputNodeRow,
  insertClickRows,
} from '@/test-utils/flow-fixtures';

describe('getClickStats', () => {
  let owner: TestUser;
  let otherUser: TestUser;

  beforeAll(async () => {
    owner = await createTestUser();
    otherUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
    await deleteTestUser(otherUser.id);
  });

  it('breaks down clicks by country, link and referrer as top-6-plus-Other, and keeps "(No campaign)" separate from Other', async () => {
    activeClientHolder.client = owner.client;

    const flow = await createFlowRow(owner.id);
    const nodes = [];
    for (let index = 0; index < 8; index++) {
      nodes.push(
        await createInputNodeRow(owner.id, flow.id, { name: `Link ${index}` }),
      );
    }

    // Descending, all-distinct counts per group so top-6 vs. Other is
    // unambiguous, and every dimension (country/referrer/campaign/link)
    // shares the same [8,7,6,5,4,3,2,1] shape via the group index.
    const counts = [8, 7, 6, 5, 4, 3, 2, 1];
    const countries = ['US', 'DE', 'FR', 'GB', 'CA', 'AU', 'JP', 'IN'];
    const referrerHosts = [
      'a.example',
      'b.example',
      'c.example',
      'd.example',
      'e.example',
      'f.example',
      'g.example',
      'h.example',
    ];
    // The 8th (smallest) group is untagged, to land in "(No campaign)".
    const campaigns = [
      'camp-a',
      'camp-b',
      'camp-c',
      'camp-d',
      'camp-e',
      'camp-f',
      'camp-g',
      null,
    ];

    const rows = [];
    for (let group = 0; group < 8; group++) {
      for (let index = 0; index < counts[group]; index++) {
        rows.push({
          input_node_id: nodes[group].id,
          flow_id: flow.id,
          user_id: owner.id,
          country: countries[group],
          referrer: `https://${referrerHosts[group]}/path?ref=${index}`,
          utm_campaign: campaigns[group],
        });
      }
    }
    await insertClickRows(rows);

    const result = await getClickStats({ timeRange: 'all', flowId: flow.id });

    expect(result.error).toBeNull();
    expect(result.data?.totalClicks).toBe(36);

    expect(result.data?.byCountry).toHaveLength(7);
    expect(
      result.data?.byCountry.slice(0, 6).map((bucket) => bucket.label),
    ).toEqual(['US', 'DE', 'FR', 'GB', 'CA', 'AU']);
    expect(result.data?.byCountry[6]).toEqual({ label: 'Other', value: 3 });

    expect(result.data?.byReferrer).toHaveLength(7);
    expect(
      result.data?.byReferrer.slice(0, 6).map((bucket) => bucket.label),
    ).toEqual(referrerHosts.slice(0, 6));
    expect(result.data?.byReferrer[6]).toEqual({ label: 'Other', value: 3 });

    expect(result.data?.byLink).toHaveLength(7);
    expect(
      result.data?.byLink.slice(0, 6).map((bucket) => bucket.label),
    ).toEqual(['Link 0', 'Link 1', 'Link 2', 'Link 3', 'Link 4', 'Link 5']);
    expect(result.data?.byLink[6]).toEqual({ label: 'Other', value: 3 });

    expect(result.data?.byCampaign).toHaveLength(8);
    expect(
      result.data?.byCampaign.slice(0, 6).map((bucket) => bucket.label),
    ).toEqual(['camp-a', 'camp-b', 'camp-c', 'camp-d', 'camp-e', 'camp-f']);
    expect(result.data?.byCampaign[6]).toEqual({ label: 'Other', value: 2 });
    expect(result.data?.byCampaign[7]).toEqual({
      label: '(No campaign)',
      value: 1,
    });
  });

  it('treats clicks with no referrer as "(Direct)"', async () => {
    activeClientHolder.client = owner.client;

    const flow = await createFlowRow(owner.id);
    const node = await createInputNodeRow(owner.id, flow.id);
    await insertClickRows([
      {
        input_node_id: node.id,
        flow_id: flow.id,
        user_id: owner.id,
        referrer: null,
      },
    ]);

    const result = await getClickStats({ timeRange: 'all', flowId: flow.id });

    expect(result.data?.byReferrer).toEqual([{ label: '(Direct)', value: 1 }]);
  });

  it('combines time range, Flow, link and country filters', async () => {
    activeClientHolder.client = owner.client;

    const flowA = await createFlowRow(owner.id);
    const flowB = await createFlowRow(owner.id);
    const linkA1 = await createInputNodeRow(owner.id, flowA.id, { name: 'A1' });
    const linkA2 = await createInputNodeRow(owner.id, flowA.id, { name: 'A2' });
    const linkB1 = await createInputNodeRow(owner.id, flowB.id, { name: 'B1' });

    const now = new Date().toISOString();
    const fortyDaysAgo = new Date(
      Date.now() - 40 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await insertClickRows([
      {
        input_node_id: linkA1.id,
        flow_id: flowA.id,
        user_id: owner.id,
        country: 'US',
        created_at: now,
      },
      {
        input_node_id: linkA2.id,
        flow_id: flowA.id,
        user_id: owner.id,
        country: 'DE',
        created_at: now,
      },
      {
        input_node_id: linkB1.id,
        flow_id: flowB.id,
        user_id: owner.id,
        country: 'US',
        created_at: now,
      },
      {
        input_node_id: linkA1.id,
        flow_id: flowA.id,
        user_id: owner.id,
        country: 'US',
        created_at: fortyDaysAgo,
      },
    ]);

    const scopedToFlowA = await getClickStats({
      timeRange: 'all',
      flowId: flowA.id,
    });
    expect(scopedToFlowA.data?.totalClicks).toBe(3);

    const scopedToLinkA1 = await getClickStats({
      timeRange: 'all',
      inputNodeId: linkA1.id,
    });
    expect(scopedToLinkA1.data?.totalClicks).toBe(2);

    const scopedToCountry = await getClickStats({
      timeRange: 'all',
      flowId: flowA.id,
      country: 'DE',
    });
    expect(scopedToCountry.data?.totalClicks).toBe(1);

    const scopedToTimeRange = await getClickStats({
      timeRange: '30d',
      flowId: flowA.id,
    });
    expect(scopedToTimeRange.data?.totalClicks).toBe(2);
  });

  it("marks Archived/Disabled links in the by-link breakdown, and never counts another user's clicks", async () => {
    activeClientHolder.client = owner.client;

    const archivedFlow = await createFlowRow(owner.id, 'archived');
    const disabledLink = await createInputNodeRow(owner.id, archivedFlow.id, {
      name: 'Paused link',
      input_status: 'disabled',
    });
    await insertClickRows([
      {
        input_node_id: disabledLink.id,
        flow_id: archivedFlow.id,
        user_id: owner.id,
      },
    ]);

    const result = await getClickStats({
      timeRange: 'all',
      flowId: archivedFlow.id,
    });
    expect(result.data?.byLink).toEqual([
      { label: 'Paused link (Archived, Disabled)', value: 1 },
    ]);

    activeClientHolder.client = otherUser.client;
    const otherResult = await getClickStats({
      timeRange: 'all',
      flowId: archivedFlow.id,
    });
    expect(otherResult.data?.totalClicks).toBe(0);
  });
});

describe('getClickFilterOptions', () => {
  let owner: TestUser;

  beforeAll(async () => {
    owner = await createTestUser();
    activeClientHolder.client = owner.client;
  });

  afterAll(async () => {
    await deleteTestUser(owner.id);
  });

  it('includes Archived Flows and Disabled links, marked accordingly, plus every distinct Click country', async () => {
    const activeFlow = await createFlowRow(owner.id, 'active');
    const archivedFlow = await createFlowRow(owner.id, 'archived');
    const enabledLink = await createInputNodeRow(owner.id, activeFlow.id, {
      name: 'Enabled link',
    });
    const disabledLink = await createInputNodeRow(owner.id, archivedFlow.id, {
      name: 'Disabled link',
      input_status: 'disabled',
    });

    await insertClickRows([
      {
        input_node_id: enabledLink.id,
        flow_id: activeFlow.id,
        user_id: owner.id,
        country: 'US',
      },
      {
        input_node_id: enabledLink.id,
        flow_id: activeFlow.id,
        user_id: owner.id,
        country: 'FR',
      },
    ]);

    const result = await getClickFilterOptions();

    expect(result.error).toBeNull();

    const flowIds = result.data!.flows.map((flow) => flow.id);
    expect(flowIds).toContain(activeFlow.id);
    expect(flowIds).toContain(archivedFlow.id);
    expect(
      result.data!.flows.find((flow) => flow.id === archivedFlow.id)?.status,
    ).toBe('archived');

    const disabledOption = result.data!.links.find(
      (link) => link.id === disabledLink.id,
    );
    expect(disabledOption?.isDisabled).toBe(true);
    expect(disabledOption?.isArchived).toBe(true);

    const enabledOption = result.data!.links.find(
      (link) => link.id === enabledLink.id,
    );
    expect(enabledOption?.isDisabled).toBe(false);
    expect(enabledOption?.isArchived).toBe(false);

    expect(result.data!.countries).toEqual(
      expect.arrayContaining(['US', 'FR']),
    );
  });
});
