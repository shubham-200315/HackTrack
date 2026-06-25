import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axios';

export interface Round {
  roundNumber: number;
  title: string;
  date: string;
  deadlineTime: string;
  isCompleted: boolean;
  mode: 'Remote' | 'Offline';
  location?: string;
  internalNotes?: string;
}

export interface Hackathon {
  _id?: string;
  name: string;
  websiteLink?: string;
  globalStatus?: 'Upcoming' | 'Ongoing' | 'Past';
  registrationDeadline: string;
  requiresPrototype: boolean;
  prototypeDetails?: string;
  outcome: 'Pending' | 'Won' | 'Learned';
  totalRoundsCount: number;
  rounds: Round[];
  createdAt?: string;
  updatedAt?: string;
}

export type ActiveView = 'dashboard' | 'trackers' | 'portfolio';
export type StatusTab = 'Ongoing' | 'Upcoming' | 'Past';

// Initial mock data for fallback
const INITIAL_MOCK_HACKATHONS: Hackathon[] = [];

export function useDashboardData() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('Ongoing');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all hackathons
  const fetchHackathons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/hackathons');
      if (response.data && response.data.data) {
        setHackathons(response.data.data);
        setIsUsingMock(false);
      } else {
        throw new Error('Invalid database format returned by server');
      }
    } catch (err: any) {
      console.warn('[useDashboardData] Server connection issue. Falling back to local storage.');
      const local = localStorage.getItem('hacktrack_hackathons');
      if (local) {
        setHackathons(JSON.parse(local));
      } else {
        localStorage.setItem('hacktrack_hackathons', JSON.stringify(INITIAL_MOCK_HACKATHONS));
        setHackathons(INITIAL_MOCK_HACKATHONS);
      }
      setIsUsingMock(true);
      setError(err.message || 'Server connection failed. Switched to offline localStorage mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  // helper to recompute status for mock items
  const recomputeMockStatus = (regDeadlineStr: string, roundsList: Round[]): 'Upcoming' | 'Ongoing' | 'Past' => {
    const now = new Date();
    const regDeadline = new Date(regDeadlineStr);
    
    if (now < regDeadline) {
      return 'Upcoming';
    }

    let latestDate = regDeadline;
    roundsList.forEach(r => {
      const d = r.deadlineTime ? new Date(r.deadlineTime) : (r.date ? new Date(r.date) : regDeadline);
      if (d > latestDate) {
        latestDate = d;
      }
    });

    if (now > latestDate) {
      return 'Past';
    }

    return 'Ongoing';
  };

  // Sync state back to storage in mock mode
  const updateList = (newList: Hackathon[]) => {
    setHackathons(newList);
    if (isUsingMock) {
      localStorage.setItem('hacktrack_hackathons', JSON.stringify(newList));
    }
  };

  // CRUD Wrapper methods
  const addHackathon = async (payload: Omit<Hackathon, '_id'>) => {
    if (isUsingMock) {
      const computedStatus = recomputeMockStatus(payload.registrationDeadline, payload.rounds);
      const newMockItem: Hackathon = {
        ...payload,
        _id: 'mock-' + Date.now(),
        globalStatus: computedStatus,
      };
      updateList([...hackathons, newMockItem]);
      return newMockItem;
    } else {
      const response = await apiClient.post('/hackathons', payload);
      const created = response.data.data;
      setHackathons([created, ...hackathons]);
      return created;
    }
  };

  const editHackathon = async (id: string, payload: Partial<Hackathon>) => {
    if (isUsingMock) {
      const existing = hackathons.find(h => h._id === id);
      if (!existing) throw new Error('Hackathon not found');
      
      const merged = { ...existing, ...payload };
      const computedStatus = recomputeMockStatus(merged.registrationDeadline, merged.rounds);
      const updatedItem: Hackathon = {
        ...merged,
        globalStatus: computedStatus,
      };
      const updatedList = hackathons.map(h => h._id === id ? updatedItem : h);
      updateList(updatedList);
      return updatedItem;
    } else {
      const response = await apiClient.put(`/hackathons/${id}`, payload);
      const updated = response.data.data;
      setHackathons(hackathons.map(h => h._id === id ? updated : h));
      return updated;
    }
  };

  const deleteHackathon = async (id: string) => {
    if (isUsingMock) {
      const updatedList = hackathons.filter(h => h._id !== id);
      updateList(updatedList);
    } else {
      await apiClient.delete(`/hackathons/${id}`);
      setHackathons(hackathons.filter(h => h._id !== id));
    }
  };

  const toggleRoundComplete = async (hackathon: Hackathon, roundIndex: number) => {
    const updatedRounds = [...hackathon.rounds];
    updatedRounds[roundIndex] = {
      ...updatedRounds[roundIndex],
      isCompleted: !updatedRounds[roundIndex].isCompleted,
    };

    if (isUsingMock) {
      const computedStatus = recomputeMockStatus(hackathon.registrationDeadline, updatedRounds);
      const updatedItem: Hackathon = {
        ...hackathon,
        rounds: updatedRounds,
        globalStatus: computedStatus,
      };
      const updatedList = hackathons.map(h => h._id === hackathon._id ? updatedItem : h);
      updateList(updatedList);
    } else {
      const response = await apiClient.put(`/hackathons/${hackathon._id}`, { rounds: updatedRounds });
      const updated = response.data.data;
      setHackathons(hackathons.map(h => h._id === hackathon._id ? updated : h));
    }
  };

  // Dynamic Metrics Analytics Calculation
  const metrics = useMemo(() => {
    const totalBattles = hackathons.length;
    
    // Win Rate: percentage of completed hackathons marked as 'Won'
    // Completed means Outcome is either 'Won' or 'Learned' (non-Pending)
    const completedHackathons = hackathons.filter(h => h.outcome !== 'Pending');
    const wonHackathons = hackathons.filter(h => h.outcome === 'Won');
    const winRate = completedHackathons.length > 0 
      ? Math.round((wonHackathons.length / completedHackathons.length) * 100)
      : 0;

    // Active Campaigns: Ongoing or Upcoming
    const activeCampaigns = hackathons.filter(
      h => h.globalStatus === 'Ongoing' || h.globalStatus === 'Upcoming'
    ).length;

    // Knowledge Return: Total 'Learned' outcomes
    const knowledgeReturn = hackathons.filter(h => h.outcome === 'Learned').length;

    return {
      totalBattles,
      winRate,
      activeCampaigns,
      knowledgeReturn,
    };
  }, [hackathons]);

  return {
    activeView,
    setActiveView,
    activeStatusTab,
    setActiveStatusTab,
    hackathons,
    loading,
    isUsingMock,
    error,
    metrics,
    fetchHackathons,
    addHackathon,
    editHackathon,
    deleteHackathon,
    toggleRoundComplete,
  };
}
