// Types de base pour la plateforme Sensicity

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'camera' | 'server' | 'switch' | 'other';
  model: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  latitude: number;
  longitude: number;
  installationDate: string;
  lastMaintenance?: string;
  conformityStatus: 'compliant' | 'non_compliant' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Authorization {
  id: number;
  type: 'prefectoral' | 'aipd' | 'other';
  reference: string;
  issueDate: string;
  expiryDate: string;
  description: string;
  status: 'valid' | 'expired' | 'pending';
  equipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookEntry {
  id: number;
  timestamp: string;
  type: 'incident' | 'observation' | 'requisition';
  description: string;
  userId: string;
  equipmentId?: string;
  isJudicialRequisition: boolean;
  createdAt: string;
  eventType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  status: 'new' | 'in_progress' | 'closed' | 'awaiting_requisition';
  actions: LogbookAction[];
  videoBookmarks?: VideoBookmark[];
  updatedAt: string;
}

export interface LogbookAction {
  id: number;
  logbookEntryId: number;
  actionType: string;
  description: string;
  timestamp: string;
  userId: string;
  createdAt: string;
}

export interface VideoBookmark {
  id: number;
  logbookEntryId: number;
  equipmentId: string;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
}

export interface AccessRequest {
  id: number;
  requestType: 'access' | 'rectification' | 'deletion';
  requesterName: string;
  requesterEmail: string;
  requestDate: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed' | 'refused';
  description: string;
  responseDetails?: string;
  processedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  version: number;
  relatedEquipmentId?: string;
  relatedAuthorizationId?: number;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardConfig {
  id: number;
  userId: string;
  configJson: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  details: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

// Types pour l'authentification
export interface AuthToken {
  token: string;
  user: User;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  totalEquipments: number;
  activeEquipments: number;
  equipmentsByStatus: Record<string, number>;
  expiringAuthorizations: number;
  recentLogbookEntries: number;
  pendingAccessRequests: number;
}