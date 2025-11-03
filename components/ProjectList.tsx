import React, { useState } from 'react';
import { Project, PhaseStatus, Profile } from '../types';
import { PencilIcon, TrashIcon } from './Icons';
import { Session } from '@supabase/supabase-js';


interface ProjectListProps {
  projects: Project[];
  session: Session | null;
  profile: Profile | null;
  onSelectProject: (id: string) => void;
  onStartNewProject: () => void;
  onUpdateProjectName: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<{ 
    project: Project; 
    isOwner: boolean;
    onSelect: () => void;
    onUpdateName: (newName: string) => void;
    onDelete: () => void;
}> = ({ project, isOwner, onSelect, onUpdateName, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(project.name);

    const totalProgress = project.phases.reduce((acc, phase) => acc + phase.progress, 0) / project.phases.length;
    
    const getProjectStatus = () => {
        if (totalProgress === 100) return { text: 'Selesai', color: 'bg-green-100 text-green-800'};
        const isInProgress = project.phases.some(p => p.status === PhaseStatus.InProgress);
        if (isInProgress) return { text: 'Berjalan', color: 'bg-sky-100 text-sky-800'};
        return { text: 'Belum Dimulai', color: 'bg-slate-100 text-slate-800'};
    }
    const status = getProjectStatus();

    const handleSave = () => {
        if (editedName.trim() && editedName !== project.name) {
            onUpdateName(editedName.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedName(project.name);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-sky-500">
            <div 
                onClick={!isEditing ? onSelect : undefined}
                className={!isEditing ? 'cursor-pointer' : ''}
            >
                <div className="flex justify-between items-start">
                    {!isEditing ? (
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{project.name}</h3>
                    ) : (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="text-xl font-bold text-slate-800 bg-transparent border-b-2 border-sky-500 focus:outline-none w-full mb-2"
                            autoFocus
                        />
                    )}
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${status.color}`}>{status.text}</span>
                </div>
                <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-sky-600 h-2.5 rounded-full" style={{width: `${totalProgress}%`}}></div>
                    </div>
                    <p className="text-right text-sm font-medium text-slate-600 mt-1">{Math.round(totalProgress)}%</p>
                </div>
            </div>
            
            {isOwner && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded-md transition-colors">Simpan</button>
                            <button onClick={handleCancel} className="text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-md transition-colors">Batal</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} title="Edit Nama Proyek" className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={onDelete} title="Hapus Proyek" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, session, profile, onSelectProject, onStartNewProject, onUpdateProjectName, onDeleteProject }) => {
  const userRole = profile?.role || 'team_member';

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-slate-800">Selamat Datang di Project Tracker</h2>
        <p className="mt-4 text-slate-600">Anda belum memiliki proyek. {userRole === 'admin' && 'Mulai kelola proyek arsitektur Anda sekarang.'}</p>
        {userRole === 'admin' && (
          <button
            onClick={onStartNewProject}
            className="mt-8 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition-transform transform hover:scale-105"
          >
            Buat Proyek Pertama Anda
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Daftar Proyek</h2>
        {userRole === 'admin' && (
          <button
              onClick={onStartNewProject}
              className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition"
          >
            + Proyek Baru
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            isOwner={session?.user.id === project.owner_id}
            onSelect={() => onSelectProject(project.id)}
            onUpdateName={(newName) => onUpdateProjectName(project.id, newName)}
            onDelete={() => onDeleteProject(project.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;