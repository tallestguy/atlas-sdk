export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    page: number; // Current page (1-indexed)
    totalPages: number; // Total number of pages
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}
