/**
 * Instagram Publishing Connector
 *
 * Implements the PublishingConnector interface using the official Facebook Graph API.
 * Handles creating a media container, polling until processing is complete, and publishing.
 */

import type { PublishingConnector, PublishParams, PublishingResult, ValidateAccountParams } from './connector.interface';

export class InstagramConnector implements PublishingConnector {
  public readonly platform = 'instagram';

  private readonly API_VERSION = 'v19.0';
  private readonly BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;

  async validateAccount(params: ValidateAccountParams): Promise<boolean> {
    if (!params.account.encryptedAccessToken || !params.account.accountName) {
      return false;
    }
    
    try {
      const url = `${this.BASE_URL}/${params.account.accountName}?access_token=${params.account.encryptedAccessToken}`;
      const response = await fetch(url);
      return response.ok;
    } catch (e) {
      console.error('[InstagramConnector] Validation failed:', e);
      return false;
    }
  }

  async publish(params: PublishParams): Promise<PublishingResult> {
    const start = Date.now();
    const { account, content, mediaUrls } = params;

    if (!account.encryptedAccessToken || !account.accountName) {
      return { success: false, error: 'Missing access token or platform ID for Instagram.' };
    }

    if (mediaUrls.length === 0) {
      return { success: false, error: 'Instagram Reels require exactly 1 video URL.' };
    }

    const igUserId = account.accountName;
    const token = account.encryptedAccessToken;
    const videoUrl = mediaUrls[0];

    try {
      // 1. Create Media Container
      const createContainerUrl = new URL(`${this.BASE_URL}/${igUserId}/media`);
      createContainerUrl.searchParams.append('media_type', 'REELS');
      createContainerUrl.searchParams.append('video_url', videoUrl);
      createContainerUrl.searchParams.append('caption', content);
      createContainerUrl.searchParams.append('access_token', token);

      console.log(`[InstagramConnector] Creating media container for ${igUserId}...`);
      const containerRes = await fetch(createContainerUrl.toString(), { method: 'POST' });
      const containerData = await containerRes.json();

      if (!containerRes.ok || !containerData.id) {
        throw new Error(containerData.error?.message || 'Failed to create media container');
      }

      const creationId = containerData.id;
      console.log(`[InstagramConnector] Container created: ${creationId}. Polling status...`);

      // 2. Poll for FINISHED status
      const isReady = await this.pollContainerStatus(creationId, token);
      if (!isReady) {
        throw new Error('Video processing timed out or failed on Instagram servers.');
      }

      // 3. Publish Media
      const publishUrl = new URL(`${this.BASE_URL}/${igUserId}/media_publish`);
      publishUrl.searchParams.append('creation_id', creationId);
      publishUrl.searchParams.append('access_token', token);

      console.log(`[InstagramConnector] Publishing creation ${creationId}...`);
      const publishRes = await fetch(publishUrl.toString(), { method: 'POST' });
      const publishData = await publishRes.json();

      if (!publishRes.ok || !publishData.id) {
        throw new Error(publishData.error?.message || 'Failed to publish media');
      }

      console.log(`[InstagramConnector] Published successfully: ${publishData.id}`);

      return {
        success: true,
        platformPostId: publishData.id,
        metrics: {
          latencyMs: Date.now() - start
        }
      };
    } catch (e: any) {
      console.error(`[InstagramConnector] Publish failed: ${e.message}`);
      return {
        success: false,
        error: e.message,
        metrics: {
          latencyMs: Date.now() - start
        }
      };
    }
  }

  /**
   * Polls the Graph API until the media container is FINISHED.
   * Max 5 minutes (30 attempts * 10 seconds).
   */
  private async pollContainerStatus(creationId: string, token: string): Promise<boolean> {
    const maxAttempts = 30;
    const intervalMs = 10000;

    for (let i = 0; i < maxAttempts; i++) {
      const url = `${this.BASE_URL}/${creationId}?fields=status_code&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status_code === 'FINISHED') {
        return true;
      }
      
      if (data.status_code === 'ERROR') {
        console.error(`[InstagramConnector] Processing error on container ${creationId}`);
        return false;
      }

      // 'IN_PROGRESS' or 'PUBLISHED' (shouldn't be published yet, but just in case)
      await new Promise(r => setTimeout(r, intervalMs));
    }

    return false; // Timed out
  }
}
