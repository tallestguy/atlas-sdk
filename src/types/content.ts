export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  content_type: string;
  categories?: string[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publish_date?: string;
  is_featured?: boolean;
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentQueryOptions {
  contentType?: string;
  categories?: string[];
  tags?: string[];
  status?: "published" | "draft" | "scheduled";
  featured?: boolean;
  premium?: boolean;
  limit?: number;
  offset?: number;
  page?: number; // Page-based pagination (1-indexed)
  sortBy?: "created_at" | "updated_at" | "publish_date" | "title";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  page?: number;
  offset?: number;
}
