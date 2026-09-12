import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

import { AdminShell } from './AdminShell';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminAICenterView } from './AdminAICenterView';
import { AdminCandidatesView } from './AdminCandidatesView';
import { AdminRecruitersView } from './AdminRecruitersView';
import { AdminOrganizersView } from './AdminOrganizersView';
import { AdminOrganizationsView } from './AdminOrganizationsView';
import { AdminUsersRBACView } from './AdminUsersRBACView';
import { AdminVerificationsView } from './AdminVerificationsView';
import { AdminHackathonsTeamsView } from './AdminHackathonsTeamsView';
import { AdminSkillsTaxonomyView } from './AdminSkillsTaxonomyView';
import { AdminInboxView } from './AdminInboxView';
import { AdminCMSView } from './AdminCMSView';
import { AdminLiveOperationsView } from './AdminLiveOperationsView';
import { AdminFeatureFlagsView } from './AdminFeatureFlagsView';
import { AdminAuditSecurityView } from './AdminAuditSecurityView';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setOverviewData(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      toast.error('Failed to connect to Admin Telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AdminShell
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      systemHealth={overviewData?.systemHealth}
      onRefresh={loadOverview}
    >
      {activeTab === 'overview' && (
        <AdminOverviewView
          data={overviewData}
          onNavigateTab={handleSelectTab}
        />
      )}

      {activeTab === 'ai_inference' && (
        <AdminAICenterView />
      )}

      {activeTab === 'candidates' && (
        <AdminCandidatesView />
      )}

      {activeTab === 'recruiters' && (
        <AdminRecruitersView />
      )}

      {activeTab === 'organizers' && (
        <AdminOrganizersView />
      )}

      {activeTab === 'organizations' && (
        <AdminOrganizationsView />
      )}

      {activeTab === 'users_rbac' && (
        <AdminUsersRBACView />
      )}

      {activeTab === 'verifications' && (
        <AdminVerificationsView />
      )}

      {activeTab === 'hackathons_teams' && (
        <AdminHackathonsTeamsView />
      )}

      {activeTab === 'skills_taxonomy' && (
        <AdminSkillsTaxonomyView />
      )}

      {activeTab === 'inbox' && (
        <AdminInboxView />
      )}

      {activeTab === 'cms' && (
        <AdminCMSView />
      )}

      {activeTab === 'live_operations' && (
        <AdminLiveOperationsView />
      )}

      {activeTab === 'feature_flags' && (
        <AdminFeatureFlagsView />
      )}

      {activeTab === 'audit' && (
        <AdminAuditSecurityView />
      )}
    </AdminShell>
  );
}
