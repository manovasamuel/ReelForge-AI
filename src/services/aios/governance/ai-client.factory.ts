/**
 * AIOS AI Client Factory
 *
 * Bridges the gap between the AIOS Model Router and the raw Provider SDKs.
 * Ensures the exact model selected by the router is instantiated and executed,
 * abstracting SDK details from the agents.
 */

import { GroqProvider } from '../../ai/providers/groq.provider';
import { GeminiProvider } from '../../ai/providers/gemini.provider';
import type { IAIProvider } from '../../ai/provider.interface';
import type { CandidateModel } from './model-router';

export class AIClientFactory {
  /**
   * Instantiates a raw AI Provider SDK wrapper based on the routed CandidateModel.
   */
  static createClient(model: CandidateModel): IAIProvider {
    switch (model.provider.toLowerCase()) {
      case 'groq':
        return new GroqProvider(model.id);
      
      case 'gemini':
        return new GeminiProvider(model.id);
        
      // Future OpenRouter / Claude integration
      // case 'openrouter':
      //   return new OpenRouterProvider(model.id);
        
      default:
        throw new Error(`[AIClientFactory] Unsupported provider: ${model.provider}`);
    }
  }
}
