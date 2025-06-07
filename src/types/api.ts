// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Form state types
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Action types for safe-action
export interface ActionState<T = unknown> {
  data?: T;
  serverError?: string;
  validationErrors?: Record<string, { _errors: string[] }>;
}

// Database query types
export interface QueryOptions {
  include?: Record<string, boolean | QueryOptions>;
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
}
