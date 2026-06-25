import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import type { Hackathon } from './useDashboardData';

export function useShowcaseData() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const fetchPublicShowcase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/hackathons/public');
      if (response.data && response.data.data) {
        setHackathons(response.data.data);
        setIsUsingMock(false);
      } else {
        throw new Error('Invalid showcase payload returned by server');
      }
    } catch (err: any) {
      console.warn('[useShowcaseData] Server fallback to localStorage');
      
      // Fallback: Read mock data from localStorage (or fallback to empty if missing)
      const local = localStorage.getItem('hacktrack_hackathons');
      if (local) {
        const parsedList = JSON.parse(local) as Hackathon[];
        // Filter concluded campaigns with outcomes 'Won' or 'Learned'
        const publicFallback = parsedList
          .filter((h) => h.globalStatus === 'Past' && (h.outcome === 'Won' || h.outcome === 'Learned'))
          .map((h) => {
            // Strip sensitive notes (rounds' internalNotes except for the last round of Learned outcomes)
            const cleanRounds = h.rounds.map((r, idx) => {
              const isLastRound = idx === h.rounds.length - 1;
              if (h.outcome === 'Learned' && isLastRound) {
                return r; // Keep post-mortem takeaways
              }
              const { internalNotes, ...cleanRound } = r;
              return cleanRound as any;
            });
            return {
              ...h,
              rounds: cleanRounds,
            };
          });

        setHackathons(publicFallback);
      } else {
        setHackathons([]);
      }
      
      setIsUsingMock(true);
      setError(err.message || 'Connecting to public server failed. Showing offline offline fallback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicShowcase();
  }, []);

  return {
    hackathons,
    loading,
    error,
    isUsingMock,
    refetch: fetchPublicShowcase,
  };
}
