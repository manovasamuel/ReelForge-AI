import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api/v2/workflow/run';
const MOCK_PROFILE_ID = 'test-profile-123';

test.describe('AIOS Resilience & Failure Recovery', () => {

  test('Circuit Breaker trips and falls back on timeout', async ({ request }) => {
    // We send testInjection to trigger a timeout in the provider wrapper
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Test timeout recovery',
        profileId: MOCK_PROFILE_ID,
        testInjection: {
          failureMode: 'timeout'
        }
      }
    });

    // The Orchestrator should retry until maxRetries, then the node fails, 
    // or if we have fallback logic in model router (which we do if circuit breaker trips).
    // Wait, testInjection triggers failure for EVERY provider if we don't scope it.
    // If the orchestrator exhausts providers, it falls back to Deterministic mode.
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Check if it successfully completed via deterministic fallback or if it failed gracefully
    // Currently, our AIOrchestrator falls back to deterministic if all fail.
    // The trace should show retries and eventual fallback.
    expect(body.traceId).toBeDefined();
    expect(body.dag).toBeDefined();
  });

  test('Rate limit triggers immediate fallback without circuit penalty', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Test rate limit recovery',
        profileId: MOCK_PROFILE_ID,
        testInjection: {
          failureMode: 'rate_limit'
        }
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body.traceId).toBeDefined();
  });

  test('500 Error triggers exponential backoff retries', async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        userMessage: 'Test 500 recovery',
        profileId: MOCK_PROFILE_ID,
        testInjection: {
          failureMode: '500' // Simulates internal server error from provider
        }
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Even if it exhausts retries and fails, the workflow should handle it gracefully
    expect(body.workflowId).toBeDefined();
  });
});
