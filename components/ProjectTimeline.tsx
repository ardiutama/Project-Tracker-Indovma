
import React, { useMemo } from 'react';
import { Project, PhaseStatus } from '../types';

const DAY_WIDTH = 20; // Width of a single day cell in pixels

interface ProjectTimelineProps {
  project: Project;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {

  const { startDate, endDate, totalDays, months } = useMemo(() => {
    if (project.phases.length === 0) {
      const now = new Date();
      return { startDate: now, endDate: now, totalDays: 1, months: [] };
    }
    const startDates = project.phases.map(p => p.startDate.getTime());
    const endDates = project.phases.map(p => p.endDate.getTime());
    
    const startDate = new Date(Math.min(...startDates));
    startDate.setDate(1); // Start from the beginning of the month
    const endDate = new Date(Math.max(...endDates));
    endDate.setMonth(endDate.getMonth() + 1, 0); // Go to the end of the month

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    const months = [];
    let currentMonth = new Date(startDate);
    while (currentMonth <= endDate) {
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      months.push({
        name: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth),
        days: daysInMonth,
        width: daysInMonth * DAY_WIDTH,
      });
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return { startDate, endDate, totalDays, months };
  }, [project]);

  const getDaysOffset = (date: Date) => {
    return Math.floor((date.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  };
  
  const getPhaseColor = (status: PhaseStatus) => {
      switch(status) {
          case PhaseStatus.Completed: return 'bg-green-500';
          case PhaseStatus.InProgress: return 'bg-sky-500';
          default: return 'bg-slate-400';
      }
  };

  const todayOffset = getDaysOffset(new Date());

  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto relative timeline-scrollbar">
        <div style={{ width: totalDays * DAY_WIDTH }}>
          {/* Months Header */}
          <div className="flex border-b border-slate-200">
            {months.map((month, index) => (
              <div key={index} style={{ width: month.width }} className="flex-shrink-0 text-center py-2 font-semibold text-sm text-slate-600 border-r border-slate-200 last:border-r-0">
                {month.name}
              </div>
            ))}
          </div>
          {/* Days Header */}
          <div className="flex h-6">
             {months.flatMap((month, monthIndex) => 
                Array.from({ length: month.days }).map((_, dayIndex) => (
                    <div key={`${monthIndex}-${dayIndex}`} style={{ width: DAY_WIDTH }} className="flex-shrink-0 text-center text-xs text-slate-400 border-r border-slate-100">
                      {dayIndex + 1}
                    </div>
                ))
             )}
          </div>

          {/* Phases */}
          <div className="relative h-auto py-4" style={{ minHeight: `${project.phases.length * 3.5}rem` }}>
            {project.phases.map((phase, index) => {
              const left = getDaysOffset(phase.startDate) * DAY_WIDTH;
              const width = (getDaysOffset(phase.endDate) - getDaysOffset(phase.startDate) + 1) * DAY_WIDTH;
              
              return (
                <div
                  key={phase.id}
                  className={`absolute h-10 rounded-lg flex items-center justify-start px-3 text-white text-sm font-medium truncate ${getPhaseColor(phase.status)}`}
                  style={{ left, width, top: `${index * 3.5}rem` }}
                  title={`${phase.name} (${phase.progress}%)`}
                >
                  <span className="truncate">{phase.name}</span>
                </div>
              );
            })}
          </div>
          
          {/* Today Marker */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
              <div className="absolute top-0 bottom-0 border-r-2 border-red-500" style={{ left: todayOffset * DAY_WIDTH + (DAY_WIDTH/2) }} title="Hari Ini">
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;