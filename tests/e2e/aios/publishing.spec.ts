import { test, expect } from '@playwright/test';
import { InstagramConnector } from '../../../src/services/publishing/connectors/instagram.connector';
import { MockConnector } from '../../../src/services/publishing/connectors/mock.connector';

test.describe('Publishing Connectors', () => {
  const hasInstagramCreds = process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ID;

  test.beforeAll(() => {
    if (!hasInstagramCreds) {
      console.log('Instagram publishing is disabled.');
      console.log('Reason: Missing INSTAGRAM_ACCESS_TOKEN and/or INSTAGRAM_BUSINESS_ID.');
    }
  });

  test('MockConnector succeeds deterministically', async () => {
    const connector = new MockConnector();
    
    const result = await connector.publish({
      account: { id: '1', platform: 'instagram', platformAccountId: '123', accessToken: 'mock' } as any,
      post: { id: 'post1', content: 'test', mediaUrls: ['http://mock.com/video.mp4'] } as any,
      content: 'Hello World',
      mediaUrls: ['http://mock.com/video.mp4']
    });

    expect(result.success).toBe(true);
    expect(result.platformPostId).toMatch(/^mock_post_/);
    expect(result.metrics?.latencyMs).toBeGreaterThan(0);
  });

  test('InstagramConnector handles missing tokens gracefully', async () => {
    const connector = new InstagramConnector();

    const result = await connector.publish({
      account: { id: '1', platform: 'instagram', platformAccountId: '', accessToken: '' } as any,
      post: { id: 'post1' } as any,
      content: 'Hello World',
      mediaUrls: ['http://mock.com/video.mp4']
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing access token');
  });

  test('InstagramConnector validation fails on invalid token', async () => {
    const connector = new InstagramConnector();
    const isValid = await connector.validateAccount({
      account: { id: '1', platform: 'instagram', platformAccountId: 'invalid', accessToken: 'invalid_token' } as any
    });
    
    expect(isValid).toBe(false);
  });

  test('InstagramConnector live publishing', async () => {
    test.skip(!hasInstagramCreds, 'Missing Instagram credentials');
    
    // Placeholder for future live publishing test
    expect(true).toBe(true);
  });
});
