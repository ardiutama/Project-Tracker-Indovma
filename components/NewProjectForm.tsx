import React, { useState } from 'react';

interface NewProjectFormProps {
  onCreateProject: (
    name: string,
    startDate: Date,
    phaseDurations: { p1: number; p2: number; p3: number },
    phasePayments: { p1: number; p2: number; p3: number },
    phaseCosts: { p1: number; p2: number; p3: number }
  ) => void;
  onCancel: () => void;
}

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onCreateProject, onCancel }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [phase1Duration, setPhase1Duration] = useState(2);
  const [phase2Duration, setPhase2Duration] = useState(2);
  const [phase3Duration, setPhase3Duration] = useState(3);
  
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
        { p1: phase1Duration, p2: phase2Duration, p3: phase3Duration },
        { p1: phase1Pay, p2: phase2Pay, p3: phase3Pay },
        { p1: phase1Cost, p2: phase2Cost, p3: phase3Cost }
      );
    }
  };
  
  const totalPayment = phase1Pay + phase2Pay + phase3Pay;

  const phaseDetails = [
      { id: 1, label: 'Fase 1: Pre-Design & Conceptual Design', duration: phase1Duration, setDuration: setPhase1Duration, pay: phase1Pay, setPay: setPhase1Pay, cost: phase1Cost, setCost: setPhase1Cost },
      { id: 2, label: 'Fase 2: Schematic Design & Design Development', duration: phase2Duration, setDuration: setPhase2Duration, pay: phase2Pay, setPay: setPhase2Pay, cost: phase2Cost, setCost: setPhase2Cost },
      { id: 3, label: 'Fase 3: Construction Documentation (CD)', duration: phase3Duration, setDuration: setPhase3Duration, pay: phase3Pay, setPay: setPhase3Pay, cost: phase3Cost, setCost: setPhase3Cost },
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

        <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai Proyek (Fase 1)</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              required
            />
        </div>
        
        <div className="space-y-4">
            {phaseDetails.map(phase => (
                <div key={phase.id} className="p-4 border rounded-lg bg-slate-50">
                    <h3 className="font-semibold text-slate-700 mb-2">{phase.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`phase${phase.id}Duration`} className="block text-sm font-medium text-slate-600">Durasi (bulan)</label>
                            <input type="number" id={`phase${phase.id}Duration`} value={phase.duration} min="1" onChange={(e) => phase.setDuration(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md"/>
                        </div>
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