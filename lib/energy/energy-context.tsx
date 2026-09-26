'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/app/components/ui/toast';
import { useUser } from '@/lib/auth/use-user';

export interface EnergyTask {
  id: string;
  title: string;
  description: string;
  energyReward: number;
  category: 'daily' | 'browse' | 'read' | 'share';
  target: number;
  current: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: 'sun' | 'timer' | 'book' | 'share';
}

interface EnergyState {
  currentEnergy: number;
  maxEnergy: number;
  loginStreak: number;
  lastActiveDate: string;
  tasks: EnergyTask[];
}

interface EnergyContextType {
  energy: number;
  maxEnergy: number;
  availableVotes: number;
  loginStreak: number;
  tasks: EnergyTask[];
  claimTask: (taskId: string) => void;
  incrementScrollSeconds: (seconds?: number) => void;
  recordIdeaView: (ideaId: string) => void;
  recordIdeaShare: (ideaId: string) => void;
  consumeEnergyForVote: () => boolean;
  isHubOpen: boolean;
  setIsHubOpen: (open: boolean) => void;
  scrollSeconds: number;
  hasUnclaimedRewards: boolean;
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

const STORAGE_KEY = 'ideapulse_voting_energy_v1';
const ENERGY_PER_VOTE = 20;
const MAX_ENERGY = 100;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

const DEFAULT_TASKS: EnergyTask[] = [
  {
    id: 'daily_login',
    title: 'Daily Check-in & Login',
    description: 'Log in each day to recharge voting energy and keep your streak alive',
    energyReward: 20,
    category: 'daily',
    target: 1,
    current: 1,
    isCompleted: true,
    isClaimed: false,
    icon: 'sun',
  },
  {
    id: 'scroll_30s',
    title: 'Feed Explorer (30s Browsing)',
    description: 'Scroll through community proposals on the feed for at least 30 seconds',
    energyReward: 20,
    category: 'browse',
    target: 30,
    current: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'timer',
  },
  {
    id: 'read_ideas',
    title: 'Proposal Deep Dive',
    description: 'Inspect and read through 2 full idea proposal briefs',
    energyReward: 20,
    category: 'read',
    target: 2,
    current: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'book',
  },
  {
    id: 'share_idea',
    title: 'Idea Scout & Share',
    description: 'Share or copy a proposal link to invite community collaborators',
    energyReward: 20,
    category: 'share',
    target: 1,
    current: 0,
    isCompleted: false,
    isClaimed: false,
    icon: 'share',
  },
];

export function EnergyProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { user } = useUser();
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [readIdeaIds, setReadIdeaIds] = useState<Set<string>>(new Set());

  // Core Energy State
  const [energy, setEnergy] = useState<number>(MAX_ENERGY);
  const [loginStreak, setLoginStreak] = useState<number>(1);
  const [lastDate, setLastDate] = useState<string>(getTodayString());
  const [tasks, setTasks] = useState<EnergyTask[]>(DEFAULT_TASKS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const today = getTodayString();

      if (stored) {
        const parsed: EnergyState = JSON.parse(stored);

        // Check if date changed (new day reset)
        if (parsed.lastActiveDate !== today) {
          // Increment streak if yesterday was active
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
          const newStreak = parsed.lastActiveDate === yesterday ? parsed.loginStreak + 1 : 1;

          setLoginStreak(newStreak);
          setLastDate(today);
          // Retain energy, refresh daily tasks
          setEnergy((prev) => Math.min(MAX_ENERGY, Math.max(parsed.currentEnergy, 40)));
          setTasks(
            DEFAULT_TASKS.map((t) =>
              t.id === 'daily_login' ? { ...t, isCompleted: true, isClaimed: false } : t,
            ),
          );
        } else {
          setEnergy(parsed.currentEnergy ?? MAX_ENERGY);
          setLoginStreak(parsed.loginStreak ?? 1);
          setLastDate(parsed.lastActiveDate ?? today);
          setTasks(parsed.tasks ?? DEFAULT_TASKS);
        }
      } else {
        // First visit setup
        setEnergy(MAX_ENERGY);
        setLoginStreak(1);
        setLastDate(today);
        setTasks(DEFAULT_TASKS);
      }
    } catch {
      // Fallback
      setEnergy(MAX_ENERGY);
      setTasks(DEFAULT_TASKS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave: EnergyState = {
        currentEnergy: energy,
        maxEnergy: MAX_ENERGY,
        loginStreak,
        lastActiveDate: lastDate,
        tasks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore storage errors
    }
  }, [energy, loginStreak, lastDate, tasks, isLoaded]);

  // Synchronize with external vote events (e.g. from VoteButton)
  useEffect(() => {
    const handleVoteCast = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: 'vote' | 'retract' }>;
      if (customEvent.detail?.action === 'vote') {
        setEnergy((prev) => Math.max(0, prev - ENERGY_PER_VOTE));
      }
    };

    window.addEventListener('ideapulse:vote-update', handleVoteCast);
    return () => window.removeEventListener('ideapulse:vote-update', handleVoteCast);
  }, []);

  // Claim Task Reward
  const claimTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.isCompleted || task.isClaimed) return;

      const reward = task.energyReward;
      const newEnergy = Math.min(MAX_ENERGY, energy + reward);
      setEnergy(newEnergy);

      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, isClaimed: true } : t)));

      toast.success(
        `+${reward} Energy claimed! (${newEnergy}/${MAX_ENERGY} Energy)`,
        '⚡ Energy Recharged',
      );

      // Play joyful visual notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ideapulse:energy-claimed', {
            detail: { taskId, reward, newEnergy },
          }),
        );
      }
    },
    [tasks, energy, toast],
  );

  // Increment 30s scroll tracker
  const incrementScrollSeconds = useCallback((sec = 1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== 'scroll_30s' || t.isCompleted) return t;
        const updated = Math.min(t.target, t.current + sec);
        const completed = updated >= t.target;
        return {
          ...t,
          current: updated,
          isCompleted: completed,
        };
      }),
    );
  }, []);

  // Record idea proposal reading
  const recordIdeaView = useCallback(
    (ideaId: string) => {
      if (!ideaId || readIdeaIds.has(ideaId)) return;
      setReadIdeaIds((prev) => new Set(prev).add(ideaId));

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== 'read_ideas' || t.isCompleted) return t;
          const updated = Math.min(t.target, t.current + 1);
          return {
            ...t,
            current: updated,
            isCompleted: updated >= t.target,
          };
        }),
      );
    },
    [readIdeaIds],
  );

  // Record idea sharing
  const recordIdeaShare = useCallback((_ideaId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== 'share_idea' || t.isCompleted) return t;
        return {
          ...t,
          current: 1,
          isCompleted: true,
        };
      }),
    );
  }, []);

  // Consume Energy when casting a vote
  const consumeEnergyForVote = useCallback((): boolean => {
    if (energy < ENERGY_PER_VOTE) {
      toast.error(
        'Insufficient voting energy! Complete daily tasks (like 30s browsing) to recharge.',
        '⚡ Low Energy',
      );
      setIsHubOpen(true);
      return false;
    }

    setEnergy((prev) => Math.max(0, prev - ENERGY_PER_VOTE));
    return true;
  }, [energy, toast]);

  const availableVotes = Math.floor(energy / ENERGY_PER_VOTE);

  const scrollTask = tasks.find((t) => t.id === 'scroll_30s');
  const scrollSeconds = scrollTask?.current ?? 0;

  const hasUnclaimedRewards = useMemo(
    () => tasks.some((t) => t.isCompleted && !t.isClaimed),
    [tasks],
  );

  const value = useMemo(
    () => ({
      energy,
      maxEnergy: MAX_ENERGY,
      availableVotes,
      loginStreak,
      tasks,
      claimTask,
      incrementScrollSeconds,
      recordIdeaView,
      recordIdeaShare,
      consumeEnergyForVote,
      isHubOpen,
      setIsHubOpen,
      scrollSeconds,
      hasUnclaimedRewards,
    }),
    [
      energy,
      availableVotes,
      loginStreak,
      tasks,
      claimTask,
      incrementScrollSeconds,
      recordIdeaView,
      recordIdeaShare,
      consumeEnergyForVote,
      isHubOpen,
      scrollSeconds,
      hasUnclaimedRewards,
    ],
  );

  return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
}

export function useEnergy(): EnergyContextType {
  const context = useContext(EnergyContext);
  if (!context) {
    return {
      energy: 100,
      maxEnergy: 100,
      availableVotes: 5,
      loginStreak: 1,
      tasks: DEFAULT_TASKS,
      claimTask: () => {},
      incrementScrollSeconds: () => {},
      recordIdeaView: () => {},
      recordIdeaShare: () => {},
      consumeEnergyForVote: () => true,
      isHubOpen: false,
      setIsHubOpen: () => {},
      scrollSeconds: 0,
      hasUnclaimedRewards: false,
    };
  }
  return context;
}
