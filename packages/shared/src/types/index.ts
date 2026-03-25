export type {
  Coordinate,
  Polygon,
  CreateZoneInput,
  UpdateZoneInput,
  Zone,
} from '../schemas/zone.schema';

export type {
  CreateLocationInput,
  UpdateLocationInput,
  Location,
} from '../schemas/location.schema';

export type {
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  UpdateGPSInput,
  User,
} from '../schemas/user.schema';

export type {
  CreateAlertInput,
  UpdateAlertInput,
  Alert,
  AlertReceipt,
  RespondToAlertInput,
  ConfirmReceiptInput,
} from '../schemas/alert.schema';

export type { Role, Affiliation } from '../constants/roles';
export type {
  AlertType,
  EmergencyMode,
  AlertSeverity,
  AlertPriority,
  ResponseStatus,
} from '../constants/alert-types';

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

/** Dashboard stats */
export interface DashboardStats {
  totalPersonnel: number;
  safe: number;
  pending: number;
  needHelp: number;
  noReply: number;
  activeAlerts: number;
  activeZones: number;
  emergencyMode: string | null;
}

/** Socket event types */
export interface SocketEvents {
  alert_created: Alert;
  alert_updated: Alert;
  emergency_mode_changed: { mode: string | null; alert?: Alert };
  receipt_confirmed: { alertId: string; userId: string };
  user_status_changed: { userId: string; status: string };
  zone_updated: Zone;
  gps_updated: { userId: string; latitude: number; longitude: number };
}
