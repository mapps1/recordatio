export interface UserProfile {
  name: string;
  grade: string;
  age?: number;
  joinDate: string;
  streak: number;
  longestStreak: number;
  totalCheckIns: number;
  totalJournalEntries: number;
  goalsCompleted: number;
  xp: number;
  level: number;
}

export interface CheckInInput {
  date?: string;
  mood: number;
  stress: number;
  sleepHours: number;
  energy: number;
  motivation: number;
  socialConnection: number;
  academicPressure: number;
  physicalActivity?: number;
  biggestStressor: string;
  eventTag?: string;
  reflection?: string;
}

export interface CheckInEntry extends CheckInInput {
  id: string;
  date: string;
  wellnessScore: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
}

export interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
  progress: number;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  type: 'guide' | 'article' | 'video';
  url: string;
}

export interface LifeEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  impact: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'report' | 'achievement';
}

export interface Insight {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendSummary {
  mood: TrendPoint[];
  stress: TrendPoint[];
  sleep: TrendPoint[];
}

export interface MoodCalendarDay {
  date: string;
  mood: number;
  stress: number;
  sleepHours: number;
  color: 'green' | 'yellow' | 'red';
  eventTitle?: string;
}

export interface BurnoutAlert {
  risk: 'low' | 'moderate' | 'high';
  message: string;
}

export interface WeeklyReport {
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  biggestImprovement: string;
  biggestChallenge: string;
  recommendation: string;
  weeklyWellnessScore: number;
}

export interface CommunityStats {
  averageStress: number;
  averageSleep: number;
  averageMood: number;
  topStressors: string[];
  monthlyTrend: string;
}

export interface DashboardPayload {
  welcomeMessage: string;
  todayFocus: string;
  profile: UserProfile;
  wellnessScore: {
    current: number;
    trend: number;
    history: TrendPoint[];
  };
  trends: TrendSummary;
  insights: Insight[];
  burnoutAlert: BurnoutAlert;
  weeklyReport: WeeklyReport;
  moodCalendar: MoodCalendarDay[];
  goals: Goal[];
  achievements: Achievement[];
  resources: ResourceItem[];
  videos: ResourceItem[];
  events: LifeEvent[];
  notifications: NotificationItem[];
}
