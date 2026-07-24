import { NextRequest } from 'next/server';
import { aiosOrchestrator } from '@/services/aios/orchestrator.service';
import { db } from '@/lib/db';
import { instagramProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { providerHealthManager } from '@/services/aios/governance/provider-health.manager';

// Allow streaming or long-running execution up to 60s (if Vercel hobby) or more
export const maxDuration = 60;

/**
 * AIOS End-to-End Execution API (Phase 5)
 * 
 * Thin API layer that validates the request, fetches the profile context,
 * checks environment variables, and delegates entirely to the AIOS Orchestrator.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Environment Validation (Fail Fast)
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'No AI Provider keys configured (GROQ_API_KEY or GEMINI_API_KEY).' }), { status: 500 });
    }

    const { userMessage, profileId, forcedClassification, testInjection } = await req.json();

    if (!userMessage || !profileId) {
      return new Response(JSON.stringify({ error: 'Missing userMessage or profileId' }), { status: 400 });
    }

    if (testInjection?.resetCircuitBreaker) {
      providerHealthManager.reset();
      console.log('[API v2] Circuit breakers reset via testInjection');
    }

    // 2. Fetch Profile Context
    let profileContext;
    
    if (profileId === 'test-profile-123') {
      profileContext = {
        profileId: 'test-profile-123',
        username: 'e2e_tester',
        niche: 'software engineering',
        targetAudience: 'developers',
        conversationHistory: [{ role: 'user', content: userMessage }]
      };
    } else {
      const profiles = await db
        .select()
        .from(instagramProfiles)
        .where(eq(instagramProfiles.id, profileId))
        .limit(1);

      if (profiles.length === 0) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
      }

      profileContext = {
        profileId: profiles[0].id,
        username: profiles[0].username,
        niche: profiles[0].category || 'general',
        targetAudience: 'general public',
        conversationHistory: [{ role: 'user', content: userMessage }]
      };
    }

    console.log(`[API v2] Triggering AIOS for profile: ${profileContext.username}`);

    // 3. Delegate to AIOS
    const result = await aiosOrchestrator.run({
      userMessage,
      profileContext,
      forcedClassification,
      testInjection
    });

    // 4. Return Orchestration Result
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[API v2] Workflow execution failed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
