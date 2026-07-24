/**
 * AIOS Request Classifier
 *
 * Analyzes an incoming user message and classifies it into:
 * - taskType: What kind of task is being requested
 * - complexity: simple | moderate | complex
 * - priority: low | normal | high
 * - requiredAgents: Which agents are needed
 * - isMultiStep: Whether this requires DAG planning
 *
 * Rule: The Classifier is lightweight and fast. It routes requests — it does NOT generate content.
 * For MVP, it uses heuristic pattern matching. In Sprint 3 it will be upgraded to use
 * the AI executeCapability('classify') for ambiguous requests.
 */

import type { TaskType } from './agent-registry';

export interface ClassificationResult {
  taskType: TaskType | 'multi_step';
  complexity: 'simple' | 'moderate' | 'complex';
  priority: 'low' | 'normal' | 'high';
  requiredTaskTypes: TaskType[];
  isMultiStep: boolean;
  confidence: number; // 0-1
  rawInput: string;
}

// Heuristic intent patterns per task type
const TASK_PATTERNS: { pattern: RegExp; taskType: TaskType; priority?: 'high' }[] = [
  { pattern: /\b(audit|analyze my profile|profile analysis|growth analysis)\b/i, taskType: 'audit', priority: 'high' },
  { pattern: /\b(competitor|competitors|spy|what is .+ doing|rival)\b/i, taskType: 'competitor_analysis' },
  { pattern: /\b(strategy|plan|roadmap|content strategy|game plan)\b/i, taskType: 'strategy' },
  { pattern: /\b(hook|opening line|attention|first 3 seconds|scroll-stopper)\b/i, taskType: 'generate_hook' },
  { pattern: /\b(script|reel script|video script|write a reel|full script)\b/i, taskType: 'generate_script' },
  { pattern: /\b(caption|post copy|caption for|write a caption)\b/i, taskType: 'generate_caption' },
  { pattern: /\b(hashtag|tags|hashtags for|which hashtags)\b/i, taskType: 'generate_hashtags' },
  { pattern: /\b(seo|search|keyword|optimize for search|discoverability)\b/i, taskType: 'seo_analysis' },
  { pattern: /\b(content plan|content calendar|monthly plan|weekly plan)\b/i, taskType: 'content_planning' },
];

// Multi-step indicator: user wants several things in one request
const MULTI_STEP_KEYWORDS = /\b(and|also|plus|with|including|then|after that)\b/i;
const MULTI_STEP_TASK_COMBOS: TaskType[][] = [
  ['generate_hook', 'generate_script'],
  ['generate_script', 'generate_caption'],
  ['generate_hook', 'generate_script', 'generate_caption'],
  ['generate_script', 'generate_caption', 'generate_hashtags'],
  ['strategy', 'generate_script'],
  ['competitor_analysis', 'strategy'],
];

export class ClassifierService {
  private static instance: ClassifierService;

  static getInstance(): ClassifierService {
    if (!ClassifierService.instance) {
      ClassifierService.instance = new ClassifierService();
    }
    return ClassifierService.instance;
  }

  classify(userMessage: string): ClassificationResult {
    const matched: { taskType: TaskType; priority?: 'high' }[] = [];

    for (const { pattern, taskType, priority } of TASK_PATTERNS) {
      if (pattern.test(userMessage)) {
        matched.push({ taskType, priority });
      }
    }

    const requiredTaskTypes: TaskType[] = [...new Set(matched.map(m => m.taskType))];
    const hasPriorityTask = matched.some(m => m.priority === 'high');

    // Multi-step detection
    const isMultiStep = requiredTaskTypes.length > 1 && MULTI_STEP_KEYWORDS.test(userMessage);

    // Complexity scoring
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (requiredTaskTypes.length >= 3 || requiredTaskTypes.includes('audit')) {
      complexity = 'complex';
    } else if (requiredTaskTypes.length === 2 || requiredTaskTypes.includes('strategy')) {
      complexity = 'moderate';
    }

    // If nothing matched specifically, treat as a general copilot request (generate_script default)
    if (requiredTaskTypes.length === 0) {
      requiredTaskTypes.push('generate_script');
    }

    const primaryTaskType = isMultiStep ? 'multi_step' : requiredTaskTypes[0];
    const confidence = matched.length > 0 ? Math.min(0.6 + matched.length * 0.1, 0.99) : 0.5;

    return {
      taskType: primaryTaskType,
      complexity,
      priority: hasPriorityTask ? 'high' : 'normal',
      requiredTaskTypes,
      isMultiStep,
      confidence,
      rawInput: userMessage,
    };
  }
}

export const classifierService = ClassifierService.getInstance();
