
import React, { useState } from 'react';
import { Phase, Report, Comment } from '../types';
import { LinkIcon, ChatBubbleIcon } from './Icons';

interface ReportListProps {
  phase: Phase;
  isPhaseActive: boolean;
  isOwner: boolean;
  onAddReport: (phaseId: string, report: Omit<Report, 'id' | 'createdAt' | 'comments'>) => void;
  onAddComment: (phaseId: string, reportId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
}

const NewReportForm: React.FC<{ phaseId: string; onAddReport: ReportListProps['onAddReport']; isPhaseActive: boolean;}> = ({ phaseId, onAddReport, isPhaseActive }) => {
    const [link, setLink] = useState('');
    const [submitter, setSubmitter] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(link && submitter) {
            onAddReport(phaseId, { googleDriveLink: link, submittedBy: submitter });
            setLink('');
            setSubmitter('');
        }
    };

    if (!isPhaseActive) {
        return (
            <div className="bg-slate-100 p-4 rounded-lg text-center text-slate-600">
                Laporan baru dapat ditambahkan saat fase ini sedang berjalan.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200">
            <h4 className="font-semibold text-slate-800">Tambah Laporan Progres Baru</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="Nama Pengunggah (e.g., Drafter)"
                    value={submitter}
                    onChange={e => setSubmitter(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    required
                />
                 <input
                    type="url"
                    placeholder="Tautan Google Drive"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    required
                />
             </div>
            <button type="submit" className="w-full md:w-auto bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition">
                Kirim Laporan
            </button>
        </form>
    );
}

const AddCommentForm: React.FC<{phaseId: string; reportId: string; onAddComment: ReportListProps['onAddComment']}> = ({ phaseId, reportId, onAddComment }) => {
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(text && author) {
            onAddComment(phaseId, reportId, { text, author });
            setText('');
            setAuthor('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                    type="text"
                    placeholder="Nama Anda"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md col-span-1 placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    required
                />
                <textarea
                    placeholder="Tulis komentar, revisi, atau approval..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={1}
                    className="w-full text-sm px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md col-span-2 placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    required
                />
            </div>
            <button type="submit" className="bg-slate-200 text-slate-700 text-sm font-semibold py-1 px-3 rounded-md hover:bg-slate-300 transition">
                Tambah Komentar
            </button>
        </form>
    );
};

const ReportList: React.FC<ReportListProps> = ({ phase, onAddReport, onAddComment, isPhaseActive }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
      <NewReportForm phaseId={phase.id} onAddReport={onAddReport} isPhaseActive={isPhaseActive} />
      
      <div className="space-y-4">
        {phase.reports.length === 0 ? (
          <p className="text-center text-slate-500 py-4">Belum ada laporan untuk fase ini.</p>
        ) : (
          [...phase.reports].reverse().map(report => (
            <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="flex items-center gap-3">
                    <a href={report.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 flex items-center gap-2 font-semibold">
                       <LinkIcon className="w-5 h-5"/> Laporan dari {report.submittedBy}
                    </a>
                </div>
                <div className="text-sm text-slate-500 mt-2 sm:mt-0">
                  {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(report.createdAt)}
                </div>
              </div>
              
              <div className="mt-4 pl-2 border-l-2 border-slate-200">
                {report.comments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic px-3">Menunggu review...</p>
                ) : (
                  <div className="space-y-3">
                    {report.comments.map(comment => (
                      <div key={comment.id} className="px-3">
                        <p className="text-sm text-slate-800">"{comment.text}"</p>
                        <p className="text-xs text-slate-500 text-right">- {comment.author}</p>
                      </div>
                    ))}
                  </div>
                )}
                 <div className="px-3 pt-3">
                    <AddCommentForm phaseId={phase.id} reportId={report.id} onAddComment={onAddComment}/>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;