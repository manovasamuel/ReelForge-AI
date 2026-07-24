import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/v2/workflow/run';
const MOCK_PROFILE_ID = 'test-profile-123';

test.describe('AIOS Capability & JSON Schema Validation', () => {

  test('Script Generation strictly follows schema', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Generate a short 15-second script for a new AI coding tool.',
        profileId: MOCK_PROFILE_ID,
        forcedClassification: {
          intent: 'generate_script',
          entities: ['AI coding tool'],
          complexity: 'simple'
        },
        testInjection: {
          resetCircuitBreaker: true
        }
      }
    });
    
    if (response.status() !== 200) {
      console.log('Error Body:', await response.text());
    }
    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("capabilities debug script body:", JSON.stringify(body, null, 2));
    
    // Validate output structure
    const content = body.composed.primary;
    expect(content).toBeDefined();
    expect(content).toHaveProperty('hook');
    expect(content).toHaveProperty('body');
    expect(content).toHaveProperty('cta');
    expect(content.body.length).toBeGreaterThan(0);
    
    // Check Observability metrics
    expect(body.traceId).toBeDefined();
  });

  test('Caption Generation returns valid structure', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Write a caption for a video about deep learning.',
        profileId: MOCK_PROFILE_ID,
        forcedClassification: {
          intent: 'generate_caption',
          entities: ['deep learning'],
          complexity: 'simple'
        },
        testInjection: {
          resetCircuitBreaker: true
        }
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log("capabilities debug caption body:", JSON.stringify(body, null, 2));
    
    const content = body.composed.primary;
    expect(content).toBeDefined();
    expect(content).toHaveProperty('caption');
    expect(content).toHaveProperty('cta');
  });
});
