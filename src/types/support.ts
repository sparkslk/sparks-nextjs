import { SupportTicketStatus, SupportTicketPriority } from "@prisma/client";

export interface SupportTicket {
  id: string;
  email: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  resolver?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  comments?: SupportTicketComment[];
}

export interface SupportTicketComment {
  id: string;
  ticketId: string;
  userId: string;
  comment: string;
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface CreateSupportTicketInput {
  email: string;
  title: string;
  description: string;
}

export interface UpdateSupportTicketInput {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
}

export interface AddCommentInput {
  comment: string;
  isInternal?: boolean;
}

export interface SupportTicketFilters {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  dateFrom?: string;
  dateTo?: string;
  email?: string;
  userId?: string;
  search?: string;
}

export interface SupportTicketListResponse {
  success: boolean;
  data: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupportTicketResponse {
  success: boolean;
  data?: SupportTicket;
  error?: string;
}

// Type guards
export function isValidSupportTicketStatus(status: string): status is SupportTicketStatus {
  return ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'PENDING_USER_RESPONSE'].includes(status);
}

export function isValidSupportTicketPriority(priority: string): priority is SupportTicketPriority {
  return ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority);
}
