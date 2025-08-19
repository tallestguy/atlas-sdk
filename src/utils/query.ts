import { PaginationOptions } from "../types/content";
import { ApiResponse } from "../types/api";

export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
}

export function generateCacheKey(prefix: string, params: any): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

// Convert page-based pagination to offset-based
export function pageToOffset(page?: number, limit: number = 10): number {
  if (!page || page < 1) return 0;
  return (page - 1) * limit;
}

// Convert offset-based pagination to page
export function offsetToPage(offset: number, limit: number = 10): number {
  return Math.floor(offset / limit) + 1;
}

// Process pagination options and normalize them
export function processPaginationOptions(options: PaginationOptions): {
  limit: number;
  offset: number;
  page: number;
} {
  const limit = options.limit || 10;

  // If page is provided, use it to calculate offset
  if (options.page !== undefined) {
    const offset = pageToOffset(options.page, limit);
    return { limit, offset, page: options.page };
  }

  // If offset is provided, calculate the page
  if (options.offset !== undefined) {
    const page = offsetToPage(options.offset, limit);
    return { limit, offset: options.offset, page };
  }

  // Default: first page
  return { limit, offset: 0, page: 1 };
}

// Enrich API response with complete pagination info
export function enrichPaginationResponse<T>(
  response: ApiResponse<T>,
  requestedLimit: number,
  requestedPage?: number,
): ApiResponse<T> {
  if (!response.pagination) return response;

  const { total, limit, offset } = response.pagination;
  const currentPage = requestedPage || offsetToPage(offset, limit);
  const totalPages = Math.ceil(total / limit);

  return {
    ...response,
    pagination: {
      ...response.pagination,
      page: currentPage,
      totalPages,
      hasMore: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    },
  };
}
