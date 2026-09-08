import { describe, expect, it } from 'vitest';

import { parseClickStatsSearchParams } from './parse-click-stats-search-params';

const VALID_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('parseClickStatsSearchParams', () => {
  it('defaults timeRange to 7d and leaves the rest unset when nothing is in the URL', () => {
    expect(parseClickStatsSearchParams({})).toEqual({
      timeRange: '7d',
      flowId: undefined,
      inputNodeId: undefined,
      country: undefined,
    });
  });

  it('carries over every valid value from the URL', () => {
    expect(
      parseClickStatsSearchParams({
        timeRange: '30d',
        flowId: VALID_UUID,
        inputNodeId: VALID_UUID,
        country: 'US',
      }),
    ).toEqual({
      timeRange: '30d',
      flowId: VALID_UUID,
      inputNodeId: VALID_UUID,
      country: 'US',
    });
  });

  it('falls back only the invalid field, keeping the rest of the same link intact', () => {
    expect(
      parseClickStatsSearchParams({
        timeRange: 'not-a-range',
        flowId: 'not-a-uuid',
        country: 'DE',
      }),
    ).toEqual({
      timeRange: '7d',
      flowId: undefined,
      inputNodeId: undefined,
      country: 'DE',
    });
  });

  it('falls back a repeated query param (string[]) to the default instead of throwing', () => {
    expect(
      parseClickStatsSearchParams({
        flowId: [VALID_UUID, VALID_UUID],
      }),
    ).toEqual({
      timeRange: '7d',
      flowId: undefined,
      inputNodeId: undefined,
      country: undefined,
    });
  });
});
