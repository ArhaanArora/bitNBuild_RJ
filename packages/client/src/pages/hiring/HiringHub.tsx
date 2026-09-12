import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  // Sync with searchParams
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'hire') {
      setCurrentView('REQUIREMENTS');
    } else if (tab === 'get-hired') {
      setCurrentView('GET_HIRED');
    } else if (tab === 'discovery') {
      setCurrentView('DISCOVERY');
    } else if (tab === 'shortlist') {
      setCurrentView('SHORTLISTED');
    } else {
      setCurrentView('DASHBOARD');
    }
  }, [searchParams]);

  const switchView = (view: HiringSubView) => {
    setCurrentView(view);
    if (view === 'DASHBOARD') {
      setSearchParams({});
    } else if (view === 'REQUIREMENTS') {
      setSearchParams({ tab: 'hire' });
    } else if (view === 'DISCOVERY') {
      setSearchParams({ tab: 'discovery' });
    } else if (view === 'GET_HIRED') {
      setSearchParams({ tab: 'get-hired' });
    } else if (view === 'SHORTLISTED') {
      setSearchParams({ tab: 'shortlist' });
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
