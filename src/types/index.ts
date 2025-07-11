// Types de base pour la plateforme Sensicity

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  phone?: string;
  department?: string;
  lastLogin?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  module: string;
  action: string;
  createdAt: string;
}

export interface UserGroup {
  id: number;
  userId: string;
  groupId: number;
  assignedBy?: string;
  assignedAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  grantedBy?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserAuditLog {
  id: number;
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
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