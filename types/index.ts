// User/Client Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  serviceType: 'residential' | 'commercial' | 'extension';
  status: 'registered' | 'docs_uploaded' | 'reviewed' | 'approved' | 'rejected';
  joinedDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  package: 'basic' | 'standard' | 'premium';
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'extension' | 'consultation';
  price: number;
  duration: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
  subServices: SubService[];
}

export interface SubService {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  estimatedHours: number;
  isActive: boolean;
  createdDate: string;
}

// Team/Agent Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'agent_x' | 'agent_y' | 'admin' | 'architect';
  team: 'london' | 'india';
  region: 'uk' | 'in';
  agentCode: string;
  isActive: boolean;
  defaultPassword: boolean;
  assignedProjects: number;
  joinedDate: string;
  createdDate: string;
}

// Document Types
export interface Document {
  id: string;
  projectId: string;
  clientId: string;
  name: string;
  type: 'application_form' | 'floor_plan' | 'site_plan' | 'design' | 'structural' | 'environmental' | 'other';
  uploadedDate: string;
  uploadedBy: string;
  fileSize: number;
  url: string;
  status: 'pending' | 'reviewed' | 'approved' | 'requesting_update';
  version: number;
}

// Project Types
export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  serviceType: 'residential' | 'commercial' | 'extension';
  location: string;
  postcode: string;
  status: 'pending' | 'registered' | 'docs_received' | 'in_review' | 'architect_assigned' | 'measurements_done' | 'drawings_in_progress' | 'drawings_received' | 'submitted_to_council' | 'approved' | 'rejected';
  createdDate: string;
  updatedDate: string;
  agentX?: string;
  agentY?: string;
  architect?: string;
  progress: number;
  estimatedCompletionDate: string;
  councilReference: string;
  councilName: string;
  documents: Document[];
}

// Payment Types
export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  amount: number;
  currency: 'GBP';
  package: 'basic' | 'standard' | 'premium';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  paymentMethod: 'card' | 'bank_transfer' | 'paypal';
  paymentDate: string;
  dueDate: string;
  description: string;
}

// Message/Communication Types
export interface Message {
  id: string;
  projectId: string;
  from: string;
  fromId: string;
  to?: string;
  toId?: string;
  isGroupMessage: boolean;
  participants?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
}

// Council Application Types
export interface CouncilApplication {
  id: string;
  projectId: string;
  clientName: string;
  councilRef: string;
  council: string;
  applicationDate: string;
  status: 'draft' | 'submitted' | 'validated' | 'under_review' | 'approved' | 'rejected' | 'appeal_pending';
  applicationFee: number;
  targetDecisionDate: string;
  decisionDate?: string;
  decision?: string;
  comments: string;
  conditions?: string[];
}

// Dashboard Stats Type
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingPayments: number;
  totalRevenue: number;
  totalClients: number;
  submittedApplications: number;
  approvedApplications: number;
}
