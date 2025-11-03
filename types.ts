
export enum PhaseStatus {
  NotStarted = 'Belum Dimulai',
  InProgress = 'Sedang Berjalan',
  Completed = 'Selesai',
}

export enum PaymentStatus {
  Paid = 'Sudah Dibayar',
  Unpaid = 'Belum Dibayar',
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
  report_id?: string; // Foreign key
}

export interface Report {
  id: string;
  submittedBy: string;
  googleDriveLink: string;
  createdAt: Date;
  comments: Comment[];
  phase_id?: string; // Foreign key
}

export interface Phase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: PhaseStatus;
  paymentPercentage: number;
  paymentStatus: PaymentStatus;
  cost: number;
  reports: Report[];
  project_id?: string; // Foreign key
}

export interface ProjectMember {
  user_id: string;
  profile: {
    full_name: string;
    role: 'admin' | 'team_member';
  }
}

export interface Project {
  id: string;
  name: string;
  created_at?: string;
  phases: Phase[];
  owner_id: string; // Foreign key to auth.users
  project_members: ProjectMember[];
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'team_member';
}