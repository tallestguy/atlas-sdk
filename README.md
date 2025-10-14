# Atlas CMS SDK

[![npm version](https://badge.fury.io/js/%40tallestguy%2Fatlas-sdk.svg)](https://badge.fury.io/js/%40tallestguy%2Fatlas-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript SDK for Atlas CMS - A comprehensive content management system with AI capabilities.

## Features

✨ **Full TypeScript Support** - Complete type definitions for all API endpoints  
🚀 **Built-in Caching** - Intelligent memory caching with configurable TTL  
🔄 **Automatic Retries** - Configurable retry logic for resilient API calls  
🎯 **Content Management** - Complete CRUD operations for content items  
📊 **Publication System** - Advanced publication management and statistics  
⚡ **Lightweight** - Zero runtime dependencies, optimized bundle size  
🛡️ **Error Handling** - Comprehensive error types and validation

## Installation

```bash
npm install @tallestguy/atlas-sdk
```

```bash
yarn add @tallestguy/atlas-sdk
```

```bash
pnpm add @tallestguy/atlas-sdk
```

## Quick Start

### Basic Usage

```typescript
import { AtlasClient } from "@tallestguy/atlas-sdk";

const atlas = new AtlasClient({
  apiUrl: "https://your-atlas-instance.com/api",
  websiteId: "your-website-id",
  apiKey: "your-api-key", // Optional for public endpoints
});

// Fetch content with pagination
const content = await atlas.getContent({
  limit: 10,
  page: 1,
  status: "published",
});

console.log(content.data); // Array of ContentItem[]
console.log(content.pagination); // Pagination metadata
```

### Environment Variables

You can configure the SDK using environment variables:

```bash
ATLAS_API_URL=https://your-atlas-instance.com/api
ATLAS_WEBSITE_ID=your-website-id
ATLAS_API_KEY=your-api-key
```

```typescript
import { atlas } from "@tallestguy/atlas-sdk";

// Uses environment variables automatically
const content = await atlas.getContent();
```

## Configuration Options

```typescript
interface AtlasClientConfig {
  apiUrl: string; // Atlas CMS API base URL
  websiteId: string; // Your website identifier
  apiKey?: string; // API key for authenticated endpoints
  timeout?: number; // Request timeout (default: 10000ms)
  cache?: boolean; // Enable/disable caching (default: true)
  cacheDuration?: number; // Cache TTL in minutes (default: 5)
  retries?: number; // Number of retry attempts (default: 3)
  retryDelay?: number; // Delay between retries (default: 1000ms)
}
```

## API Reference

### Content Management

#### Get Content List

```typescript
// Basic content fetching
const content = await atlas.getContent();

// Advanced filtering and pagination
const filteredContent = await atlas.getContent({
  contentType: 'article',
  status: 'published',
  featured: true,
  categories: ['technology', 'ai'],
  tags: ['nodejs', 'typescript'],
  limit: 20,
  page: 2,
  sortBy: 'created_at',
  sortOrder: 'desc',
  search: 'artificial intelligence'
});

// Response structure
interface ApiResponse&lt;ContentItem[]&gt; {
  data: ContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
  message?: string;
}
```

#### Get Content by Slug

```typescript
const article = await atlas.getContentBySlug("my-article-slug");

if (article.data) {
  console.log(article.data.title);
  console.log(article.data.content);
}
```

#### Content Item Interface

```typescript
interface ContentItem {
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
```

### Publication Management

#### Get Active Publications by Agency

```typescript
const publications = await atlas.getActivePublicationsByAgency("agency-name", {
  limit: 15,
  page: 1,
});

console.log(publications.data); // Publication[]
```

## Advanced Usage

### Using Service Classes

For more advanced functionality, you can use the dedicated service classes:

```typescript
import { ContentService, PublicationService } from "@tallestguy/atlas-sdk";
import { MemoryCache, HttpClient } from "@tallestguy/atlas-sdk";

// Setup dependencies
const config = {
  /* your config */
};
const cache = new MemoryCache();
const http = new HttpClient({
  /* options */
});

// Initialize services
const contentService = new ContentService(config, cache, http);
const publicationService = new PublicationService(config, cache, http);

// Content operations
const content = await contentService.list({ limit: 10 });
const newContent = await contentService.create({
  title: "New Article",
  slug: "new-article",
  content: "Article content...",
  content_type: "article",
  status: "draft",
});

await contentService.update("content-id", { status: "published" });
await contentService.delete("content-id");

// Publication operations
const publications = await publicationService.search({
  query: "software engineer",
  location: "Amsterdam",
});

const stats = await publicationService.getStatistics();
```

### Cache Management

```typescript
const atlas = new AtlasClient(config);

// Clear all cached data
atlas.clearCache();

// Update configuration (including cache settings)
atlas.updateConfig({
  cacheDuration: 10, // 10 minutes
  cache: false, // Disable caching
});
```

### Error Handling

```typescript
import { AtlasError, AtlasValidationError } from "@tallestguy/atlas-sdk";

try {
  const content = await atlas.getContent({ limit: -1 }); // Invalid limit
} catch (error) {
  if (error instanceof AtlasValidationError) {
    console.error("Validation error:", error.message);
  } else if (error instanceof AtlasError) {
    console.error("Atlas API error:", error.message, error.code);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## TypeScript Support

This SDK is built with TypeScript and provides complete type definitions:

```typescript
import type {
  ContentItem,
  ContentQueryOptions,
  ApiResponse,
  AtlasClientConfig,
  Publication,
  PublicationStatistics
} from '@tallestguy/atlas-sdk';

// Full autocompletion and type checking
const client: AtlasClient = new AtlasClient(config);
const response: ApiResponse&lt;ContentItem[]&gt; = await client.getContent();
```

## Examples

### Building a Blog

```typescript
import { AtlasClient } from "@tallestguy/atlas-sdk";

class BlogService {
  private atlas: AtlasClient;

  constructor() {
    this.atlas = new AtlasClient({
      apiUrl: process.env.ATLAS_API_URL!,
      websiteId: process.env.ATLAS_WEBSITE_ID!,
      apiKey: process.env.ATLAS_API_KEY,
    });
  }

  // Get latest blog posts for homepage
  async getLatestPosts(limit = 5) {
    return this.atlas.getContent({
      contentType: "blog-post",
      status: "published",
      sortBy: "publish_date",
      sortOrder: "desc",
      limit,
    });
  }

  // Get featured articles
  async getFeaturedPosts() {
    return this.atlas.getContent({
      contentType: "blog-post",
      status: "published",
      featured: true,
      limit: 3,
    });
  }

  // Get single blog post
  async getPost(slug: string) {
    const response = await this.atlas.getContentBySlug(slug);

    if (!response.data) {
      throw new Error("Post not found");
    }

    return response.data;
  }

  // Get posts by category
  async getPostsByCategory(category: string, page = 1) {
    return this.atlas.getContent({
      contentType: "blog-post",
      status: "published",
      categories: [category],
      page,
      limit: 10,
    });
  }
}
```

### Job Board Integration

```typescript
import { PublicationService } from "@tallestguy/atlas-sdk";

class JobBoard {
  private publications: PublicationService;

  constructor() {
    // Initialize service (setup cache, http client, config)
    this.publications = new PublicationService(/* dependencies */);
  }

  // Search jobs
  async searchJobs(query: string, location?: string) {
    return this.publications.search({
      query,
      location,
      limit: 20,
    });
  }

  // Get jobs by company
  async getJobsByAgency(agency: string) {
    return this.publications.getActiveByAgency(agency);
  }

  // Get job statistics
  async getJobStats() {
    return this.publications.getStatistics();
  }
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@atlas-cms.com
- 💬 Discord: [Atlas CMS Community](https://discord.gg/atlas-cms)
- 📖 Documentation: [docs.atlas-cms.com](https://docs.atlas-cms.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tallestguy/atlas-sdk/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ by the Atlas CMS team
