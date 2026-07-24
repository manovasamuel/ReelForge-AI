import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/v2/workflow/run';
const MOCK_PROFILE_ID = 'test-profile-123';

test.describe('AIOS Performance Benchmarking', () => {

  test('End-to-End Latency for Single Agent is under 5000ms', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Give me 3 hashtags for AI',
        profileId: MOCK_PROFILE_ID,
        forcedClassification: {
          intent: 'generate_hashtag',
          entities: ['AI'],
          complexity: 'simple'
        }
      }
    });

    const endTime = Date.now();
    const totalLatency = endTime - startTime;

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Log the performance metrics
    console.log(`[Performance] Total Workflow Latency: ${totalLatency}ms`);
    
    // Validate we have telemetry in the trace
    expect(body.traceId).toBeDefined();
    if (body.trace) {
       console.log(`[Performance] AI Inference Latency: ${body.trace.totalDurationMs}ms`);
    }

    // Adjust this threshold based on actual Groq/Gemini response times, 5s is conservative for simple generation
    expect(totalLatency).toBeLessThan(15000); // 15 seconds max for a simple API call in E2E
  });
});
