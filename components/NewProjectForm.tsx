
import React, { useState } from 'react';

interface NewProjectFormProps {
  onCreateProject: (
    name: string,
    startDate: Date,
    phase1Duration: number,
    phase1Pay: number,
    phase1Cost: number,
    phase2Pay: number,
    phase2Cost: number,
    phase3Pay: number,
    phase3Cost: number
  ) => void;
  onCancel: () => void;
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onCreateProject, onCancel }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [phase1Duration, setPhase1Duration] = useState(2);
  
  const [phase1Pay, setPhase1Pay] = useState(30);
  const [phase2Pay, setPhase2Pay] = useState(40);
  const [phase3Pay, setPhase3Pay] = useState(30);
  
  const [phase1Cost, setPhase1Cost] = useState(0);
  const [phase2Cost, setPhase2Cost] = useState(0);
  const [phase3Cost, setPhase3Cost] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && startDate) {
      const totalPay = phase1Pay + phase2Pay + phase3Pay;
      if (totalPay !== 100) {
        alert('Total persentase pembayaran harus 100%.');
        return;
      }
      onCreateProject(
        name,
        new Date(startDate),
        phase1Duration,
        phase1Pay,
        phase1Cost,
        phase2Pay,
        phase2Cost,
        phase3Pay,
        phase3Cost
      );
    }
  };
  
  const totalPayment = phase1Pay + phase2Pay + phase3Pay;

  const phaseDetails = [
      { id: 1, label: 'Fase 1: Pre-Design & Conceptual Design', pay: phase1Pay, setPay: setPhase1Pay, cost: phase1Cost, setCost: setPhase1Cost },
      { id: 2, label: 'Fase 2: Schematic Design & Design Development', pay: phase2Pay, setPay: setPhase2Pay, cost: phase2Cost, setCost: setPhase2Cost },
      { id: 3, label: 'Fase 3: Construction Documentation (CD)', pay: phase3Pay, setPay: setPhase3Pay, cost: phase3Cost, setCost: setPhase3Cost },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-2 text-center text-slate-800">Mulai Proyek Baru</h2>
      <p className="text-slate-500 mb-8 text-center">Isi detail di bawah ini untuk menginisialisasi alur kerja proyek Anda.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 mb-1">Nama Proyek</label>
          <input
            type="text"
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition placeholder-slate-400"
            placeholder="Contoh: Renovasi Rumah Bapak Budi"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai Fase 1</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="phase1Duration" className="block text-sm font-medium text-slate-700 mb-1">Durasi Fase 1 (bulan)</label>
              <input
                type="number"
                id="phase1Duration"
                value={phase1Duration}
                min="1"
                onChange={(e) => setPhase1Duration(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                required
              />
            </div>
        </div>
        
        <div className="space-y-4">
            {phaseDetails.map(phase => (
                <div key={phase.id} className="p-4 border rounded-lg bg-slate-50">
                    <h3 className="font-semibold text-slate-700 mb-2">{phase.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`phase${phase.id}Pay`} className="block text-sm font-medium text-slate-600">Pembayaran (%)</label>
                            <input type="number" id={`phase${phase.id}Pay`} value={phase.pay} min="0" max="100" onChange={(e) => phase.setPay(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor={`phase${phase.id}Cost`} className="block text-sm font-medium text-slate-600">Estimasi Biaya (IDR)</label>
                            <input type="number" id={`phase${phase.id}Cost`} value={phase.cost} min="0" onChange={(e) => phase.setCost(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md"/>
                        </div>
                    </div>
                </div>
            ))}
             <p className={`mt-2 text-sm font-medium ${totalPayment === 100 ? 'text-green-600' : 'text-red-600'}`}>
                Total Pembayaran: {totalPayment}% {totalPayment !== 100 && "(Harus 100%)"}
            </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-4 space-y-2 space-y-reverse sm:space-y-0">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200 ease-in-out"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={totalPayment !== 100}
              className="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Buat Proyek
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectForm;
