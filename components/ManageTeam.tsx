
import React, { useState } from 'react';
import { Project } from '../types';

interface ManageTeamProps {
  project: Project;
  isOwner: boolean;
  onInviteMember: (projectId: string, email: string) => Promise<void>;
}

const ManageTeam: React.FC<ManageTeamProps> = ({ project, isOwner, onInviteMember }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await onInviteMember(project.id, email);
      setMessage(`Undangan berhasil ditambahkan untuk ${email}.`);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim undangan.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Tim Proyek</h3>
      <div className="space-y-3">
        {project.project_members.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada anggota tim yang diundang.</p>
        ) : (
            project.project_members.map(member => (
                <div key={member.user_id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                    <span className="font-medium text-slate-800 text-sm">{member.profile.full_name}</span>
                    <span className="text-xs text-slate-500 capitalize">{member.profile.role.replace('_', ' ')}</span>
                </div>
            ))
        )}
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-2">Undang Anggota Baru</h4>
          <form onSubmit={handleInvite} className="space-y-2">
            <input
              type="email"
              placeholder="Alamat email anggota"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition disabled:bg-slate-400"
            >
              {loading ? 'Mengirim...' : 'Kirim Undangan'}
            </button>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {message && <p className="text-green-600 text-xs mt-1">{message}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageTeam;
