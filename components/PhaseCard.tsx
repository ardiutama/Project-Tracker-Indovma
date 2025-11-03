
import React from 'react';
import { Phase, PhaseStatus, PaymentStatus } from '../types';
import { CalendarIcon, CheckCircleIcon, CurrencyDollarIcon, WarningIcon, XCircleIcon } from './Icons';

interface PhaseCardProps {
  phase: Phase;
  onUpdatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => void;
  isActive: boolean;
  isOwner: boolean;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, onUpdatePhase, isActive, isOwner }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const value = parseInt(e.target.value, 10) || 0;
    const clampedValue = Math.max(0, Math.min(100, value));
    onUpdatePhase(phase.id, { progress: clampedValue });
  };
  
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const value = parseInt(e.target.value, 10) || 0;
    onUpdatePhase(phase.id, { cost: value });
  };

  const handlePaymentToggle = () => {
    if (!isOwner) return;
    const newStatus = phase.paymentStatus === PaymentStatus.Paid ? PaymentStatus.Unpaid : PaymentStatus.Paid;
    onUpdatePhase(phase.id, { paymentStatus: newStatus });
  };
  
  const getStatusBadge = () => {
    switch (phase.status) {
      case PhaseStatus.Completed:
        return <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Selesai</span>;
      case PhaseStatus.InProgress:
        return <span className="bg-sky-100 text-sky-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Berjalan</span>;
      case PhaseStatus.NotStarted:
        return <span className="bg-slate-100 text-slate-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Belum Mulai</span>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 ${isActive ? 'ring-2 ring-sky-500 shadow-xl' : 'hover:shadow-lg'}`}>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-slate-800 tracking-wide">{phase.name}</h4>
            {getStatusBadge()}
        </div>
        <div className="flex items-center text-sm text-slate-500 mt-2">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
        </div>

        <div className="mt-6">
            <label id={`progress-label-${phase.id}`} htmlFor={`progress-number-${phase.id}`} className="block text-sm font-medium text-slate-700">Progres</label>
            <div className="flex items-center gap-3 mt-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={phase.progress}
                    onChange={handleProgressChange}
                    className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-sky-500 ${isOwner ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    aria-labelledby={`progress-label-${phase.id}`}
                    disabled={!isOwner}
                />
                <div className="relative w-24">
                     <input
                        type="number"
                        id={`progress-number-${phase.id}`}
                        min="0"
                        max="100"
                        value={phase.progress}
                        onChange={handleProgressChange}
                        className={`w-full text-right pr-5 p-1 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!isOwner && 'bg-slate-100'}`}
                        aria-labelledby={`progress-label-${phase.id}`}
                        disabled={!isOwner}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
            </div>
        </div>

        <div className="mt-4">
            <label htmlFor={`cost-${phase.id}`} className="block text-sm font-medium text-slate-700">Estimasi Biaya</label>
            <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">Rp</span>
                </div>
                <input
                    type="number"
                    id={`cost-${phase.id}`}
                    value={phase.cost}
                    onChange={handleCostChange}
                    className={`w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-4 text-slate-900 focus:ring-sky-500 sm:text-sm ${!isOwner && 'bg-slate-100 cursor-not-allowed'}`}
                    disabled={!isOwner}
                    placeholder="0"
                />
            </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-slate-700">Pembayaran ({phase.paymentPercentage}%)</div>
            <div className="flex items-center">
                {phase.status === PhaseStatus.Completed && phase.paymentStatus === PaymentStatus.Unpaid && (
                    <WarningIcon className="w-5 h-5 text-amber-500 mr-2" title="Pembayaran tertunda"/>
                )}
                <button
                    onClick={handlePaymentToggle}
                    disabled={!isOwner}
                    className={`flex items-center justify-start gap-2 text-sm font-medium py-1 px-3 rounded-full transition-colors min-w-[120px] ${
                        phase.paymentStatus === PaymentStatus.Paid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-200 text-slate-700'
                    } ${isOwner ? (phase.paymentStatus === PaymentStatus.Paid ? 'hover:bg-green-200' : 'hover:bg-slate-300') : 'cursor-not-allowed opacity-70'}`}
                >
                    {phase.paymentStatus === PaymentStatus.Paid ? <CheckCircleIcon className="w-4 h-4"/> : <XCircleIcon className="w-4 h-4"/>}
                    {phase.paymentStatus}
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PhaseCard;
