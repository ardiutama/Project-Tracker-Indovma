
import React, { useState } from 'react';
import { Project, Phase, Report, Comment, PhaseStatus } from '../types';
import PhaseCard from './PhaseCard';
import ReportList from './ReportList';
import ManageTeam from './ManageTeam';
import { ClockIcon, CheckCircleIcon, WarningIcon, DocumentPlusIcon } from './Icons';
import { Session } from '@supabase/supabase-js';
import ProjectTimeline from './ProjectTimeline';


interface ProjectDashboardProps {
  project: Project;
  summary: {
      totalProgress: number;
      activePhase: Phase | null;
      outstandingPayments: Phase[];
      lastReport: Report | null;
  } | null;
  session: Session;
  onUpdatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => void;
  onAddReport: (phaseId: string, report: Omit<Report, 'id' | 'createdAt' | 'comments'>) => void;
  onAddComment: (phaseId: string, reportId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onInviteMember: (projectId: string, email: string) => Promise<void>;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, summary, session, onUpdatePhase, onAddReport, onAddComment, onInviteMember }) => {
    const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(summary?.activePhase?.id || project.phases[0].id);

    const selectedPhase = project.phases.find(p => p.id === selectedPhaseId);
    const isOwner = project.owner_id === session.user.id;

    const getStatusInfo = () => {
        if (!summary?.activePhase) {
            const isCompleted = summary?.totalProgress === 100;
            if (isCompleted) {
                return { text: 'Proyek Selesai', icon: <CheckCircleIcon className="w-5 h-5 text-green-500"/>, color: 'text-green-700 bg-green-100' };
            }
            return { text: 'Proyek Belum Dimulai', icon: <ClockIcon className="w-5 h-5 text-slate-500"/>, color: 'text-slate-700 bg-slate-100' };
        }
        return { text: `Fase Aktif: ${summary.activePhase.name}`, icon: <ClockIcon className="w-5 h-5 text-sky-500"/>, color: 'text-sky-700 bg-sky-100' };
    };

    const statusInfo = getStatusInfo();
  
    return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{project.name}</h2>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className={`inline-flex items-center gap-2 py-1 px-3 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
            </div>
            {summary?.outstandingPayments && summary.outstandingPayments.length > 0 && (
                <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-sm font-medium text-amber-700 bg-amber-100">
                    <WarningIcon className="w-5 h-5 text-amber-500"/>
                    {summary.outstandingPayments.length} Pembayaran Tertunda
                </div>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Progres Proyek</h3>
                <div className="w-full bg-slate-200 rounded-full h-4">
                    <div
                    className="bg-sky-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${summary?.totalProgress || 0}%` }}
                    ></div>
                </div>
                <p className="text-right text-sm font-bold text-sky-600 mt-2">{Math.round(summary?.totalProgress || 0)}%</p>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-4">Alur Kerja Proyek</h3>
                <ProjectTimeline project={project} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {project.phases.map((phase) => (
                    <div key={phase.id} onClick={() => setSelectedPhaseId(phase.id)} className="cursor-pointer">
                        <PhaseCard 
                            phase={phase} 
                            onUpdatePhase={onUpdatePhase}
                            isActive={selectedPhaseId === phase.id}
                            isOwner={isOwner}
                        />
                    </div>
                ))}
                </div>
            </div>
        </div>
        <div className="lg:col-span-1">
            <ManageTeam project={project} isOwner={isOwner} onInviteMember={onInviteMember}/>
        </div>
      </div>
      
      {selectedPhase && (
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DocumentPlusIcon className="w-7 h-7 text-slate-500"/>
            Laporan Progres: {selectedPhase.name}
          </h3>
          <ReportList 
            phase={selectedPhase}
            onAddReport={onAddReport}
            onAddComment={onAddComment}
            isPhaseActive={summary?.activePhase?.id === selectedPhase.id || selectedPhase.status === PhaseStatus.InProgress}
            isOwner={isOwner}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
