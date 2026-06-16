export type ISODateString = string;

export type Permission =
  | "dashboard"
  | "transactions"
  | "overview"
  | "pricing"
  | "devices"
  | "theme"
  | "settings";

export type ApiErrorResponse = {
  message: string;
  code?: string;
  requiredPermission?: Permission;
  yourPermissions?: Permission[];
  latest?: unknown;
};

export type SuccessMessageResponse = {
  success: boolean;
  message: string;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  from?: number;
  to?: number;
  all?: boolean;
  totalFound?: number;
  realtime?: boolean;
};

export type ConfigMeta = {
  configUpdatedAt: ISODateString | null;
};
