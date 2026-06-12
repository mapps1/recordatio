import { randomUUID } from 'crypto';
import {
  Achievement,
  BurnoutAlert,
  CheckInEntry,
  CheckInInput,
  CommunityStats,
  DashboardPayload,
  Goal,
  Insight,
  JournalEntry,
  LifeEvent,
  MoodCalendarDay,
  NotificationItem,
  ResourceItem,
  TrendPoint,
  TrendSummary,
  UserProfile,
  WeeklyReport,
} from '../types';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

class RecordatioService {
  private profile: UserProfile = {
    name: 'Recordatio Student',
    grade: '11th Grade',
    age: 17,
    joinDate: new Date().toISOString(),
    streak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    totalJournalEntries: 0,
    goalsCompleted: 0,
    xp: 0,
    level: 1,
  };

  private goals: Goal[] = [
    { id: randomUUID(), title: 'Sleep 8 hours on school nights', progress: 0, target: 7 },
    { id: randomUUID(), title: 'Journal 3 times this week', progress: 0, target: 3 },
    { id: randomUUID(), title: 'Move 120 minutes weekly', progress: 0, target: 120 },
  ];

  private achievements: Achievement[] = [
    { id: randomUUID(), title: 'First Check-In', unlocked: false, progress: 0 },
    { id: randomUUID(), title: '7 Day Streak', unlocked: false, progress: 0 },
    { id: randomUUID(), title: 'Journal Explorer', unlocked: false, progress: 0 },
  ];

  private resources: ResourceItem[] = [
    { id: randomUUID(), title: 'Stress reset in 3 minutes', category: 'Stress', type: 'guide', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/' },
    { id: randomUUID(), title: 'Student sleep habits', category: 'Sleep', type: 'article', url: 'https://www.sleepfoundation.org/school-and-sleep' },
  ];

  private videos: ResourceItem[] = [
    { id: randomUUID(), title: '2-minute breathing reset', category: 'Mental Wellness', type: 'video', url: 'https://www.youtube.com/watch?v=nmFUDkj1Aq0' },
  ];

  private events: LifeEvent[] = [];
  private notifications: NotificationItem[] = [
    { id: randomUUID(), title: 'Daily check-in reminder', message: 'Take 60 seconds to reflect today.', type: 'reminder' },
  ];

  private journalPrompts: string[] = [
    'What went well today?',
    'What challenged you?',
    'What are you grateful for?',
  ];

  private entries: CheckInEntry[] = [];
  private journalEntries: JournalEntry[] = [];

  public validateInput(payload: Partial<CheckInInput>): string[] {
    const errors: string[] = [];

    const scoreFields: Array<keyof CheckInInput> = [
      'mood',
      'stress',
      'energy',
      'motivation',
      'socialConnection',
      'academicPressure',
    ];

    for (const field of scoreFields) {
      const value = payload[field] as number | undefined;
      if (value === undefined || !Number.isFinite(value) || value < 1 || value > 10) {
        errors.push(`${field} must be between 1 and 10`);
      }
    }

    if (!Number.isFinite(payload.sleepHours) || (payload.sleepHours as number) < 0 || (payload.sleepHours as number) > 14) {
      errors.push('sleepHours must be between 0 and 14');
    }

    if (!payload.biggestStressor || payload.biggestStressor.trim().length === 0) {
      errors.push('biggestStressor is required');
    }

    return errors;
  }

  private calculateWellnessScore(payload: CheckInInput): number {
    const sleep = clamp((payload.sleepHours / 8) * 10, 1, 10);
    const movement = clamp((payload.physicalActivity ?? 0) / 12, 1, 10);

    const weighted =
      payload.mood * 0.2 +
      (11 - payload.stress) * 0.18 +
      sleep * 0.16 +
      payload.energy * 0.13 +
      payload.motivation * 0.1 +
      payload.socialConnection * 0.08 +
      (11 - payload.academicPressure) * 0.07 +
      movement * 0.08;

    return Math.round(clamp(weighted * 10, 0, 100));
  }

  private recomputeProfile(): void {
    this.profile.totalCheckIns = this.entries.length;
    this.profile.totalJournalEntries = this.journalEntries.length;
    this.profile.xp = this.entries.length * 25 + this.journalEntries.length * 15;
    this.profile.level = Math.max(1, Math.floor(this.profile.xp / 200) + 1);

    this.achievements[0].unlocked = this.entries.length > 0;
    this.achievements[0].progress = this.entries.length > 0 ? 100 : 0;
    this.achievements[1].progress = Math.min(100, Math.round((this.profile.streak / 7) * 100));
    this.achievements[1].unlocked = this.profile.streak >= 7;
    this.achievements[2].progress = Math.min(100, Math.round((this.journalEntries.length / 3) * 100));
    this.achievements[2].unlocked = this.journalEntries.length >= 3;

    this.profile.goalsCompleted = this.goals.filter((goal) => goal.progress >= goal.target).length;
  }

  public addCheckIn(payload: CheckInInput): CheckInEntry {
    const entry: CheckInEntry = {
      ...payload,
      id: randomUUID(),
      date: payload.date ?? new Date().toISOString(),
      physicalActivity: payload.physicalActivity ?? 0,
      reflection: payload.reflection?.trim() || undefined,
      eventTag: payload.eventTag?.trim() || undefined,
      wellnessScore: this.calculateWellnessScore(payload),
    };

    this.entries.unshift(entry);
    this.profile.streak += 1;
    this.profile.longestStreak = Math.max(this.profile.longestStreak, this.profile.streak);
    this.goals[0].progress = Math.min(this.goals[0].target, this.goals[0].progress + (payload.sleepHours >= 8 ? 1 : 0));
    this.goals[2].progress = Math.min(this.goals[2].target, this.goals[2].progress + (payload.physicalActivity ?? 0));
    this.recomputeProfile();

    return entry;
  }

  public deleteCheckIn(id: string): boolean {
    const before = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.id !== id);
    const deleted = this.entries.length !== before;
    if (deleted) {
      this.profile.streak = Math.max(0, this.profile.streak - 1);
      this.recomputeProfile();
    }
    return deleted;
  }

  public getCheckIns(): CheckInEntry[] {
    return this.entries;
  }

  public getTrendSummary(): TrendSummary {
    const points = this.entries.slice(0, 7).reverse();
    const mapPoints = (values: number[]): TrendPoint[] => values.map((value, idx) => ({ label: `D${idx + 1}`, value }));
    return {
      mood: mapPoints(points.map((entry) => entry.mood)),
      stress: mapPoints(points.map((entry) => entry.stress)),
      sleep: mapPoints(points.map((entry) => Number(entry.sleepHours.toFixed(1)))),
    };
  }

  public getInsights(): Insight[] {
    if (this.entries.length === 0) {
      return [{ id: randomUUID(), message: 'No check-ins yet. Start with today to unlock insights.', severity: 'low' }];
    }

    const latest = this.entries[0];
    const insights: Insight[] = [];
    if (latest.stress >= 8) insights.push({ id: randomUUID(), message: 'Stress is elevated. Try a short break and breathing reset.', severity: 'high' });
    if (latest.sleepHours < 6.5) insights.push({ id: randomUUID(), message: 'Sleep has been low. Consider an earlier wind-down routine tonight.', severity: 'medium' });
    if (latest.mood >= 7) insights.push({ id: randomUUID(), message: 'Mood looks steady. Keep the habits that helped this week.', severity: 'low' });
    if (insights.length === 0) insights.push({ id: randomUUID(), message: 'Keep tracking daily to reveal stronger trends.', severity: 'low' });

    return insights;
  }

  public getBurnoutAlert(): BurnoutAlert {
    const latest = this.entries[0];
    if (!latest) {
      return { risk: 'low', message: 'No burnout signals yet. Start logging to monitor changes.' };
    }

    if (latest.stress >= 8 && latest.sleepHours < 6) {
      return { risk: 'high', message: 'High stress with low sleep detected. Schedule recovery time today.' };
    }

    if (latest.stress >= 6) {
      return { risk: 'moderate', message: 'Stress is above baseline. Reduce workload where possible.' };
    }

    return { risk: 'low', message: 'Current trend is stable.' };
  }

  public getWeeklyReport(): WeeklyReport {
    const points = this.entries.slice(0, 7);
    const avg = (values: number[]): number => (values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0);
    const avgMood = avg(points.map((entry) => entry.mood));
    const avgStress = avg(points.map((entry) => entry.stress));
    const avgSleep = avg(points.map((entry) => entry.sleepHours));
    const avgScore = avg(points.map((entry) => entry.wellnessScore));

    return {
      averageMood: avgMood,
      averageStress: avgStress,
      averageSleep: avgSleep,
      biggestImprovement: avgMood >= 7 ? 'Mood consistency' : 'Daily reflection habit',
      biggestChallenge: avgStress >= 7 ? 'Stress management' : 'Maintaining momentum',
      recommendation: avgSleep < 7 ? 'Aim for a consistent sleep window this week.' : 'Keep current routine and journal after check-ins.',
      weeklyWellnessScore: avgScore,
    };
  }

  public getCommunityStats(): CommunityStats {
    return {
      averageStress: 6.2,
      averageSleep: 6.9,
      averageMood: 6.8,
      topStressors: ['Exams', 'Deadlines', 'Time management'],
      monthlyTrend: 'Students with regular check-ins report more stable mood over four weeks.',
    };
  }

  public getMoodCalendar(): MoodCalendarDay[] {
    return this.entries.slice(0, 28).map((entry) => ({
      date: entry.date,
      mood: entry.mood,
      stress: entry.stress,
      sleepHours: entry.sleepHours,
      color: entry.mood >= 7 ? 'green' : entry.mood >= 5 ? 'yellow' : 'red',
      eventTitle: entry.eventTag,
    }));
  }

  public createJournalEntry(title: string, content: string): JournalEntry {
    const lower = content.toLowerCase();
    const sentiment: JournalEntry['sentiment'] = /good|lighter|grateful|win|better/.test(lower)
      ? 'positive'
      : /bad|worse|anxious|drained|overwhelmed/.test(lower)
        ? 'negative'
        : 'neutral';

    const entry: JournalEntry = {
      id: randomUUID(),
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      sentiment,
    };

    this.journalEntries.unshift(entry);
    this.goals[1].progress = Math.min(this.goals[1].target, this.goals[1].progress + 1);
    this.recomputeProfile();
    return entry;
  }

  public updateJournalEntry(id: string, title: string, content: string): JournalEntry | null {
    const index = this.journalEntries.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    const current = this.journalEntries[index];
    const updated: JournalEntry = {
      ...current,
      title: title.trim(),
      content: content.trim(),
    };
    this.journalEntries[index] = updated;
    return updated;
  }

  public deleteJournalEntry(id: string): boolean {
    const before = this.journalEntries.length;
    this.journalEntries = this.journalEntries.filter((entry) => entry.id !== id);
    const deleted = this.journalEntries.length !== before;
    if (deleted) this.recomputeProfile();
    return deleted;
  }

  public getJournalEntries(search?: string): JournalEntry[] {
    if (!search) return this.journalEntries;
    const needle = search.toLowerCase();
    return this.journalEntries.filter((entry) => entry.title.toLowerCase().includes(needle) || entry.content.toLowerCase().includes(needle));
  }

  public getDashboardData(): DashboardPayload {
    const latest = this.entries[0];
    const prev = this.entries[1];

    return {
      welcomeMessage: 'Welcome back',
      todayFocus: latest ? 'Review today\'s check-in and maintain your routine.' : 'Start with your first check-in today.',
      profile: this.profile,
      wellnessScore: {
        current: latest?.wellnessScore ?? 0,
        trend: latest && prev ? latest.wellnessScore - prev.wellnessScore : 0,
        history: this.entries.slice(0, 7).reverse().map((entry, idx) => ({ label: `D${idx + 1}`, value: entry.wellnessScore })),
      },
      trends: this.getTrendSummary(),
      insights: this.getInsights(),
      burnoutAlert: this.getBurnoutAlert(),
      weeklyReport: this.getWeeklyReport(),
      moodCalendar: this.getMoodCalendar(),
      goals: this.goals,
      achievements: this.achievements,
      resources: this.resources,
      videos: this.videos,
      events: this.events,
      notifications: this.notifications,
    };
  }

  public getPrediction(): { prediction: string; confidence: string } {
    const latest = this.entries[0];
    if (!latest) {
      return { prediction: 'Not enough data yet. Add daily check-ins for prediction trends.', confidence: 'low' };
    }
    if (latest.stress >= 7) {
      return { prediction: 'Stress may remain elevated over the next two days without recovery actions.', confidence: 'medium' };
    }
    return { prediction: 'Wellness trend appears stable for the next two days.', confidence: 'medium' };
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public getGoals(): Goal[] {
    return this.goals;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public getResources(): ResourceItem[] {
    return this.resources;
  }

  public getVideos(): ResourceItem[] {
    return this.videos;
  }

  public getEvents(): LifeEvent[] {
    return this.events;
  }

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public getJournalPrompts(): string[] {
    return this.journalPrompts;
  }
}

export const recordatioService = new RecordatioService();
