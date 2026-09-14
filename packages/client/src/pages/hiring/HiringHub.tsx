import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiringRequirement } from '../../types/hiring';
import {
  getLastHiringSearch,
  saveLastHiringSearch,
} from '../../utils/hiringStorage';
import HiringDashboardView from './HiringDashboardView';
import RequirementsView from './RequirementsView';
import CandidateDiscoveryView from './CandidateDiscoveryView';
import GetHiredView from './GetHiredView';
import ShortlistedView from './ShortlistedView';

export type HiringSubView =
  | 'DASHBOARD'
  | 'REQUIREMENTS'
  | 'DISCOVERY'
  | 'GET_HIRED'
  | 'SHORTLISTED';

export default function HiringHub() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState<HiringSubView>('DASHBOARD');

  // Active requirement (restored from localStorage if available)
  const [activeRequirement, setActiveRequirement] = useState<HiringRequirement>(() => {
    return (
      getLastHiringSearch() || {
        role: 'Backend Developer',
        requiredSkills: ['Python', 'SQL', 'Node.js'],
        experience: 'Any',
        location: 'Nearby',
        jobType: 'Full-time',
      }
    );
  });

  // Sync with searchParams & route
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (location.pathname === '/verification') {
      setCurrentView('GET_HIRED');
    } else if (tab === 'hire' || tab === 'requirements') {
      setCurrentView('REQUIREMENTS');
    } else if (tab === 'get-hired' || tab === 'assessment' || tab === 'verification') {
      setCurrentView('GET_HIRED');
    } else if (tab === 'discovery' || tab === 'candidates') {
      setCurrentView('DISCOVERY');
    } else if (tab === 'shortlist' || tab === 'shortlisted') {
      setCurrentView('SHORTLISTED');
    } else if (tab === 'dashboard') {
      setCurrentView('DASHBOARD');
    } else {
      // Default: If user is candidate, default to GET_HIRED view (Skill Verification)
      // Otherwise recruiters and organizers default to DASHBOARD overview
      if (user?.role === 'candidate') {
        setCurrentView('GET_HIRED');
      } else {
        setCurrentView('DASHBOARD');
      }
    }
  }, [searchParams, location.pathname, user?.role]);

  const switchView = (view: HiringSubView) => {
    setCurrentView(view);
    if (view === 'DASHBOARD') {
      navigate('/hiring?tab=dashboard');
    } else if (view === 'REQUIREMENTS') {
      navigate('/hiring?tab=hire');
    } else if (view === 'DISCOVERY') {
      navigate('/hiring?tab=discovery');
    } else if (view === 'GET_HIRED') {
      navigate('/verification');
    } else if (view === 'SHORTLISTED') {
      navigate('/hiring?tab=shortlist');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequirementSubmit = (req: HiringRequirement) => {
    setActiveRequirement(req);
    saveLastHiringSearch(req);
    switchView('DISCOVERY');
  };

  return (
    <div className="w-full">
      {currentView === 'DASHBOARD' && (
        <HiringDashboardView
          onHireSomeone={() => switchView('REQUIREMENTS')}
          onGetHired={() => switchView('GET_HIRED')}
          onViewShortlist={() => switchView('SHORTLISTED')}
        />
      )}

      {currentView === 'REQUIREMENTS' && (
        <RequirementsView
          initialRequirement={activeRequirement}
          onSubmit={handleRequirementSubmit}
          onBack={() => switchView('DASHBOARD')}
        />
      )}

      {currentView === 'DISCOVERY' && (
        <CandidateDiscoveryView
          requirement={activeRequirement}
          onEditRequirements={() => switchView('REQUIREMENTS')}
          onBackToDashboard={() => switchView('DASHBOARD')}
          onViewShortlist={() => switchView('SHORTLISTED')}
        />
      )}

      {currentView === 'GET_HIRED' && (
        <GetHiredView
          onBack={() => switchView('DASHBOARD')}
          onViewDiscovery={() => switchView('DISCOVERY')}
        />
      )}

      {currentView === 'SHORTLISTED' && (
        <ShortlistedView
          onBack={() => switchView('DASHBOARD')}
          onExplore={() => switchView('REQUIREMENTS')}
        />
      )}
    </div>
  );
}
