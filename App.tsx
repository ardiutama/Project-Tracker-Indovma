import React, { useState, useMemo, useEffect } from 'react';
import { Project, Phase, Report, Comment, PhaseStatus, PaymentStatus, Profile } from './types';
import NewProjectForm from './components/NewProjectForm';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectList from './components/ProjectList';
import AuthComponent from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

type View = 'list' | 'form' | 'dashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      if (!session) {
        setIsLoading(false);
        setProjects([]);
        setProfile(null);
        return;
      }

      setIsLoading(true);

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch Projects accessible by the user (as owner or member)
      // RLS policies on the database will handle the filtering.
      const { data, error } = await supabase
        .from('projects')
        .select('*, phases(*, reports(*, comments(*))), project_members(*, profile:user_profiles(full_name, role))')
        .order('created_at', { ascending: false })
        .order('startDate', { referencedTable: 'phases', ascending: true });

      if (error) {
        console.error('Error fetching projects:', error);
      } else if (data) {
        const projectsWithDates: Project[] = data.map((project: any) => ({
          ...project,
          phases: project.phases.map((phase: any) => ({
            ...phase,
            startDate: new Date(phase.startDate),
            endDate: new Date(phase.endDate),
            reports: phase.reports.map((report: any) => ({
              ...report,
              createdAt: new Date(report.createdAt),
              comments: report.comments.map((comment: any) => ({
                ...comment,
                createdAt: new Date(comment.createdAt),
              })),
            })),
          })),
        }));
        setProjects(projectsWithDates);
      }
      setIsLoading(false);
    };

    fetchProfileAndProjects();
  }, [session]);

  const handleCreateProject = async (
    name: string,
    startDate: Date,
    phase1Duration: number,
    phase1Pay: number,
    phase1Cost: number,
    phase2Pay: number,
    phase2Cost: number,
    phase3Pay: number,
    phase3Cost: number
  ) => {
    if (!session) return;
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({ name, owner_id: session.user.id })
      .select()
      .single();

    if (projectError || !projectData) {
      console.error('Error creating project:', projectError);
      return;
    }
    
    const newProjectId = projectData.id;
    const phasesToCreate: Omit<Phase, 'id' | 'status' | 'paymentStatus' | 'reports' | 'progress'>[] = [];
    let currentStartDate = new Date(startDate);
    
    const phaseDetails = [
      { name: 'Fase 1: Pre-Design & Conceptual Design', duration: phase1Duration, payment: phase1Pay, cost: phase1Cost },
      { name: 'Fase 2: Schematic Design & Design Development', duration: 2, payment: phase2Pay, cost: phase2Cost },
      { name: 'Fase 3: Construction Documentation (CD)', duration: 3, payment: phase3Pay, cost: phase3Cost },
    ];

    phaseDetails.forEach((detail) => {
      const endDate = new Date(currentStartDate);
      endDate.setMonth(endDate.getMonth() + detail.duration);
      phasesToCreate.push({
        name: detail.name,
        startDate: new Date(currentStartDate),
        endDate: endDate,
        paymentPercentage: detail.payment,
        cost: detail.cost,
        project_id: newProjectId,
      });
      currentStartDate = new Date(endDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    });

    const { data: phasesData, error: phasesError } = await supabase.from('phases').insert(phasesToCreate).select();
    
    if (phasesError || !phasesData) {
        console.error("Error creating phases", phasesError);
        return;
    }

    const newProject: Project = {
        ...projectData,
        owner_id: session.user.id,
        phases: phasesData.map(p => ({
            ...p,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
            reports: [],
        })),
        project_members: []
    };

    setProjects(prevProjects => [newProject, ...prevProjects]);
    setActiveProjectId(newProject.id);
    setView('dashboard');
  };

  const updateProjectInState = (projectId: string, updatedProject: Project) => {
    setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
  }

  const handleUpdatePhase = async (phaseId: string, updatedPhaseData: Partial<Phase>) => {
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;

    let originalPhases = project.phases;
    const newPhases = project.phases.map(p => {
        if (p.id === phaseId) {
            const newProgress = updatedPhaseData.progress !== undefined ? updatedPhaseData.progress : p.progress;
            let newStatus = p.status;
            if (newProgress === 100) newStatus = PhaseStatus.Completed;
            else if (newProgress > 0) newStatus = PhaseStatus.InProgress;
            else newStatus = PhaseStatus.NotStarted;
            return { ...p, ...updatedPhaseData, progress: newProgress, status: newStatus };
        }
        return p;
    });
    updateProjectInState(project.id, { ...project, phases: newPhases });

    const { error } = await supabase.from('phases').update(updatedPhaseData).eq('id', phaseId);
    if(error) {
        console.error("Failed to update phase:", error);
        updateProjectInState(project.id, { ...project, phases: originalPhases });
    }
  };
  
  const handleAddReport = async (phaseId: string, report: Omit<Report, 'id' | 'createdAt' | 'comments'>) => {
    const { data: newReportData, error } = await supabase
        .from('reports')
        .insert({ ...report, phase_id: phaseId })
        .select()
        .single();
    
    if(error || !newReportData) {
        console.error("Failed to add report:", error);
        return;
    }
    
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;
    const newPhases = project.phases.map(p => {
        if(p.id === phaseId) {
            const newReport: Report = {
                ...newReportData,
                createdAt: new Date(newReportData.createdAt),
                comments: []
            };
            return {...p, reports: [...p.reports, newReport]};
        }
        return p;
    });
    updateProjectInState(project.id, {...project, phases: newPhases});
  };

  const handleAddComment = async (phaseId: string, reportId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({ ...comment, report_id: reportId })
        .select()
        .single();
    
    if (error || !newCommentData) {
        console.error("Failed to add comment:", error);
        return;
    }

    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;
    const newPhases = project.phases.map(p => {
        if(p.id === phaseId) {
            const newReports = p.reports.map(r => {
                if(r.id === reportId) {
                    const newComment: Comment = {
                        ...newCommentData,
                        createdAt: new Date(newCommentData.createdAt)
                    };
                    return {...r, comments: [...r.comments, newComment]};
                }
                return r;
            });
            return {...p, reports: newReports};
        }
        return p;
    });
    updateProjectInState(project.id, {...project, phases: newPhases});
  };

  const handleInviteMember = async (projectId: string, email: string) => {
    const { error } = await supabase.rpc('invite_user_to_project', {
      p_project_id: projectId,
      invitee_email: email,
    });

    if (error) {
      throw new Error(error.message);
    }
    // Re-fetch projects to show the new member
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*, phases(*, reports(*, comments(*))), project_members(*, profile:user_profiles(full_name, role))')
      .eq('id', projectId)
      .single();

    if (fetchError || !data) {
      console.error('Failed to re-fetch project after inviting member');
      return;
    }
    const updatedProject = {
      ...data,
      phases: data.phases.map((phase: any) => ({
        ...phase,
        startDate: new Date(phase.startDate),
        endDate: new Date(phase.endDate),
        reports: phase.reports.map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt),
          comments: report.comments.map((comment: any) => ({...comment, createdAt: new Date(comment.createdAt)}))
        }))
      }))
    };
    updateProjectInState(projectId, updatedProject);
  };

  const handleUpdateProjectName = async (projectId: string, newName: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ name: newName })
      .eq('id', projectId);
    
    if (error) {
      console.error('Error updating project name:', error);
      // Optionally, revert UI change
    } else {
      setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName } : p));
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat diurungkan.')) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        console.error('Error deleting project:', error);
      } else {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    }
  };
  
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const projectSummary = useMemo(() => {
    if (!activeProject) return null;
    const totalProgress = activeProject.phases.reduce((acc, phase) => acc + phase.progress, 0) / activeProject.phases.length;
    const now = new Date();
    const activePhase = activeProject.phases.find(p => now >= p.startDate && now <= p.endDate && p.status !== PhaseStatus.Completed) || activeProject.phases.find(p => p.status === PhaseStatus.InProgress) || null;
    const outstandingPayments = activeProject.phases.filter(p => p.status === PhaseStatus.Completed && p.paymentStatus === PaymentStatus.Unpaid);
    const lastReport = [...activeProject.phases].flatMap(p => p.reports).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return { totalProgress, activePhase, outstandingPayments, lastReport };
  }, [activeProject]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!session) {
    return <AuthComponent />;
  }

  const renderContent = () => {
    if (isLoading) {
        return <div className="text-center py-20 text-slate-600 font-semibold">Memuat Proyek...</div>;
    }

    switch(view) {
        case 'form':
            return <NewProjectForm onCreateProject={handleCreateProject} onCancel={() => setView('list')} />;
        case 'dashboard':
            if (activeProject && session) {
                return <ProjectDashboard 
                    project={activeProject}
                    summary={projectSummary}
                    session={session}
                    onUpdatePhase={handleUpdatePhase}
                    onAddReport={handleAddReport}
                    onAddComment={handleAddComment}
                    onInviteMember={handleInviteMember}
                  />;
            }
            return null;
        case 'list':
        default:
            return <ProjectList 
                        projects={projects}
                        session={session}
                        profile={profile}
                        onSelectProject={(id) => { setActiveProjectId(id); setView('dashboard'); }}
                        onStartNewProject={() => setView('form')}
                        onUpdateProjectName={handleUpdateProjectName}
                        onDeleteProject={handleDeleteProject}
                    />;
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 cursor-pointer" onClick={() => { setActiveProjectId(null); setView('list'); }}>
            Project Tracker
          </h1>
          <div className="flex items-center gap-4">
            {profile && <span className="text-sm text-slate-600 hidden sm:block">Login sebagai: <span className="font-semibold">{profile.full_name || session.user.email}</span></span>}
            {view === 'dashboard' ? (
              <button
                onClick={() => { setActiveProjectId(null); setView('list'); }}
                className="text-sm bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Daftar Proyek
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;