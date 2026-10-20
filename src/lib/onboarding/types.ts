export interface OnboardingQuestion {
  id: string;
  step: number;
  title: string;
  options: string[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "intent",
    step: 1,
    title: "What brings you to ReelForge AI?",
    options: [
      "Grow my content",
      "Analyze competitors",
      "Find viral content patterns",
      "Create better scripts and hooks",
      "Build a content strategy",
    ],
  },
  {
    id: "persona",
    step: 2,
    title: "What best describes you?",
    options: [
      "Content creator",
      "Digital marketer",
      "Agency or social media manager",
      "Business owner",
      "Other",
    ],
  },
  {
    id: "primary_platform",
    step: 3,
    title: "Which platform matters most to you?",
    options: [
      "Instagram",
      "TikTok",
      "YouTube",
      "Facebook",
      "Multiple platforms",
    ],
  },
  {
    id: "experience_level",
    step: 4,
    title: "What is your experience level?",
    options: [
      "Just getting started",
      "Growing my skills",
      "Experienced creator or marketer",
    ],
  },
];

export interface OnboardingAnswers {
  intent?: string;
  persona?: string;
  primary_platform?: string;
  experience_level?: string;
  [key: string]: string | undefined;
}

export interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  answers: OnboardingAnswers;
  completedAt?: string;
}
