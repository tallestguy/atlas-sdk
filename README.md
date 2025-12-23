# Atlas CMS SDK

[![npm version](https://badge.fury.io/js/%40tallestguy%2Fatlas-sdk.svg)](https://badge.fury.io/js/%40tallestguy%2Fatlas-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript SDK for Atlas CMS - A comprehensive content management system with AI capabilities, HR integrations (AFAS, Carerix), and advanced deployment features.

## Features

✨ **Full TypeScript Support** - Complete type definitions for all API endpoints  
🚀 **Built-in Caching** - Intelligent memory caching with configurable TTL  
🔄 **Automatic Retries** - Configurable retry logic for resilient API calls  
🎯 **Content Management** - Complete CRUD operations for content items  
📊 **Publication System** - Advanced publication management and statistics  
👥 **People & Team Management** - Applications, team members, and profiles  
📍 **Location Management** - Comprehensive location tracking with Carerix sync  
🔐 **Authentication** - User login, registration, and session management  
🚀 **Deployment Management** - Multi-provider deployment orchestration  
🔄 **Sync Operations** - Carerix and AFAS synchronization  
⏰ **Time Tracking** - Advanced time entry statistics and analytics  
📁 **File Management** - Multi-entity file attachments and uploads  
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
const content = await atlas.content.list({
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
const content = await atlas.content.list();
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

The SDK provides access to all Atlas API services through a unified client:

```typescript
const atlas = new AtlasClient(config);

// Service instances
atlas.content          // Content management
atlas.publications     // Publication management
atlas.websites         // Website CRUD operations
atlas.people           // People and applications
atlas.locations        // Location management
atlas.auth             // Authentication
atlas.deployments      // Deployment orchestration
atlas.sync             // Carerix synchronization
atlas.afas             // AFAS employee & time sync
atlas.timeEntries      // Time entry statistics
atlas.files            // File attachment management
atlas.scheduler        // Job scheduling
```

### Content Management

#### List Content

```typescript
// Basic content fetching
const content = await atlas.content.list();

// Advanced filtering and pagination
const filteredContent = await atlas.content.list({
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
```

#### Get Content by ID or Slug

```typescript
// By ID
const article = await atlas.content.getById("content-id");

// By slug
const article = await atlas.content.getBySlug("my-article-slug");
```

#### Create, Update, Delete

```typescript
// Create content
const newContent = await atlas.content.create({
  title: "New Article",
  slug: "new-article",
  content: "Article content...",
  content_type: "article",
  status: "draft",
  website_id: atlas.config.websiteId,
});

// Update content
await atlas.content.update("content-id", { 
  status: "published",
  publish_date: new Date().toISOString()
});

// Delete content
await atlas.content.delete("content-id");
```

### Publication Management

```typescript
// List publications
const publications = await atlas.publications.search({
  search_term: "software engineer",
  agency_name: "TechCorp",
  limit: 20
});

// Get active publications
const active = await atlas.publications.getActive({ limit: 10 });

// Get publications by agency
const agencyPubs = await atlas.publications.getActiveByAgency("TechCorp");

// Get publication statistics
const stats = await atlas.publications.getStatistics();

// Sync from Carerix
const syncJob = await atlas.publications.syncFromCarerix();

// Get expired publications
const expired = await atlas.publications.getExpired();

// Cleanup expired
const cleanup = await atlas.publications.cleanupExpired();
```

### Website Management

```typescript
// Create a website
const website = await atlas.websites.create({
  name: "My Website",
  url: "https://mywebsite.com",
  primary_language: "en",
  created_by: "user-id",
  status: "active"
});

// Get website by ID
const site = await atlas.websites.getById("website-id");

// List all websites
const websites = await atlas.websites.list();

// Update website
await atlas.websites.update("website-id", {
  description: "Updated description"
});

// Upload a file to website
const file = await atlas.websites.uploadFile("website-id", fileObject);

// Get website files
const files = await atlas.websites.getFiles("website-id", "all");

// Set logo
await atlas.websites.setLogo("website-id", "file-id");

// Set favicon
await atlas.websites.setFavicon("website-id", "file-id");
```

### People & Team Management

```typescript
// Create a person
const person = await atlas.people.create({
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  person_status: "applicant"
});

// Get person by email
const person = await atlas.people.getByEmail("john@example.com");

// Submit application
const application = await atlas.people.submitApplication({
  firstname: "Jane",
  lastname: "Smith",
  email: "jane@example.com",
  phone: "+31612345678",
  website_id: "website-id",
  publication_id: "pub-id",
  message: "I'm interested in this position",
  email_marketing_consent: true
});

// Get team members for a website
const teamMembers = await atlas.people.getTeamMembers("website-id");

// Get applications for a website
const applications = await atlas.people.getApplications("website-id");

// Get email marketing list
const marketingList = await atlas.people.getEmailMarketingList();

// Upload resume
await atlas.people.uploadFile("person-id", resumeFile);

// Set profile photo
await atlas.people.setProfilePhoto("person-id", "file-id");

// Sync from Carerix
await atlas.people.syncFromCarerix("carerix-candidate-id");
```

### Location Management

```typescript
// List locations
const locations = await atlas.locations.list({
  is_active: true,
  city: "Amsterdam",
  limit: 20
});

// Get location by ID
const location = await atlas.locations.getById("location-id");

// Get location by Carerix ID
const location = await atlas.locations.getByCarerixId("carerix-id");

// Search locations
const results = await atlas.locations.search({
  search: "Amsterdam",
  is_active: true
});

// Get active locations
const active = await atlas.locations.getActive();

// Get locations by agency
const agencyLocs = await atlas.locations.getByAgency("Agency Name");

// Get debtor locations
const debtors = await atlas.locations.getDebtorLocations();

// Get locations missing coordinates
const missing = await atlas.locations.getMissingCoordinates();

// Get stale locations
const stale = await atlas.locations.getStale();

// Sync from Carerix
const syncJob = await atlas.locations.syncFromCarerix({ force: false });

// Enrich location data
const enriched = await atlas.locations.enrich("location-id", true);

// Bulk enrich
const bulkResult = await atlas.locations.bulkEnrich(["id1", "id2"], false);

// Get statistics
const stats = await atlas.locations.getStatistics();

// Cleanup inactive
const cleanup = await atlas.locations.cleanupInactive();

// Upload file to location
await atlas.locations.uploadFile("location-id", fileObject);

// Set featured image
await atlas.locations.setFeaturedImage("location-id", "file-id");
```

### Authentication

```typescript
// Login
const authResponse = await atlas.auth.login({
  email: "user@example.com",
  password: "password123"
});

console.log(authResponse.data.user);
console.log(authResponse.data.session.access_token);

// Register
const newUser = await atlas.auth.register({
  email: "newuser@example.com",
  password: "securepassword",
  firstname: "John",
  lastname: "Doe"
});

// Logout
await atlas.auth.logout();
```

### Deployment Management

```typescript
// Create and trigger deployment
const deployment = await atlas.deployments.create({
  website_id: "website-id",
  deployment_type: "content_update",
  related_content_ids: ["content-id-1", "content-id-2"],
  deployment_message: "Publishing new articles"
});

// Schedule deployment
const scheduled = await atlas.deployments.schedule({
  website_id: "website-id",
  deployment_type: "full_rebuild",
  scheduled_for: "2024-12-25T00:00:00Z"
});

// Get deployment by ID
const dep = await atlas.deployments.getById("deployment-id");

// List deployments
const deployments = await atlas.deployments.list({
  website_id: "website-id",
  status: "completed"
});

// Get latest deployment for website
const latest = await atlas.deployments.getLatest("website-id");

// Validate deployment config
const validation = await atlas.deployments.validateConfig("website-id");

// Get pending deployments
const pending = await atlas.deployments.getPending();

// Get in-progress deployments
const inProgress = await atlas.deployments.getInProgress();

// Get deployment statistics
const stats = await atlas.deployments.getStats();

// Trigger scheduled deployment
await atlas.deployments.trigger("deployment-id");

// Cancel deployment
await atlas.deployments.cancel("deployment-id");

// Retry failed deployment
await atlas.deployments.retry("deployment-id");
```

### Sync Management

```typescript
// Trigger location sync
const locationSync = await atlas.sync.triggerLocationSync({ force: false });

// Trigger location dry run
const dryRun = await atlas.sync.triggerLocationDryRun();

// Trigger publication sync
const pubSync = await atlas.sync.triggerPublicationSync();

// Get sync status
const status = await atlas.sync.getStatus("job-id");

// Get latest sync status
const latest = await atlas.sync.getLatestStatus();

// Get active sync jobs
const active = await atlas.sync.getActiveSyncJobs();

// Get sync history
const history = await atlas.sync.getHistory({
  sync_type: "locations",
  status: "completed"
});

// Get sync statistics
const stats = await atlas.sync.getStatistics();

// Get detailed job information
const details = await atlas.sync.getJobDetails("job-id");
```

### AFAS Integration

```typescript
// Sync all employees
const empSync = await atlas.afas.syncEmployees();

// Sync single employee
const employee = await atlas.afas.syncEmployeeById("employee-id");

// Get employees
const employees = await atlas.afas.getEmployees({
  is_active: true,
  department: "IT"
});

// Get employee by ID
const emp = await atlas.afas.getEmployeeById("employee-id");

// Get employee sync statistics
const empStats = await atlas.afas.getEmployeeSyncStatistics();

// Sync time entries
const timeSync = await atlas.afas.syncTimeEntries();

// Get time entries
const timeEntries = await atlas.afas.getTimeEntries({
  employee_id: "emp-id",
  date_from: "2024-01-01",
  date_to: "2024-12-31"
});

// Get time entry by identity
const entry = await atlas.afas.getTimeEntryById("entry-identity");

// Get time entry sync statistics
const timeStats = await atlas.afas.getTimeEntrySyncStatistics();

// Cleanup time entries
const cleanup = await atlas.afas.cleanupTimeEntries();

// Test AFAS connection
const connectionTest = await atlas.afas.testConnection();

// Get AFAS configuration
const config = await atlas.afas.getConfig();
```

### Time Entry Statistics

```typescript
// Get aggregated hours by period
const hoursByPeriod = await atlas.timeEntries.getAggregatedHoursByPeriod({
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  group_by: "month"
});

// Get employee hours
const employeeHours = await atlas.timeEntries.getEmployeeHoursByPeriod({
  employee_id: "emp-id",
  start_date: "2024-01-01",
  end_date: "2024-12-31"
});

// Get project hours
const projectHours = await atlas.timeEntries.getProjectHoursByPeriod({
  project_id: "project-id"
});

// Get debtor hours
const debtorHours = await atlas.timeEntries.getDebtorHoursByPeriod({
  debtor_id: "debtor-id"
});

// Get average hours
const avgHours = await atlas.timeEntries.getAverageHours({
  period: "month"
});

// Get unique employees
const uniqueEmps = await atlas.timeEntries.getUniqueEmployees({
  start_date: "2024-01-01",
  end_date: "2024-12-31"
});

// Get employees with missing hours
const missingHours = await atlas.timeEntries.getEmployeesWithMissingHours();

// Get time entry summary
const summary = await atlas.timeEntries.getSummary({
  start_date: "2024-01-01",
  end_date: "2024-12-31"
});
```

### File Management

```typescript
// Upload a file
const file = await atlas.files.upload({
  file: fileObject,
  entity_type: "person",
  entity_id: "person-id",
  filename: "resume.pdf",
  file_category: "document",
  is_public: false,
  alt_text: "John Doe's Resume",
  metadata: { department: "IT" }
});

// Get file by ID
const file = await atlas.files.getById("file-id");

// Get files by entity
const files = await atlas.files.getByEntity("person", "person-id", {
  file_category: "image",
  is_public: true
});

// Update file metadata
await atlas.files.updateMetadata("file-id", {
  alt_text: "Updated description",
  caption: "New caption",
  is_public: true
});

// Delete file
await atlas.files.delete("file-id");
```

### Scheduler Management

```typescript
// Get scheduler status
const status = await atlas.scheduler.getStatus();
console.log(status.data.jobs); // All scheduled jobs
console.log(status.data.is_running);

// Get scheduler health
const health = await atlas.scheduler.getHealth();
console.log(health.data.status); // "healthy" | "degraded" | "unhealthy"

// Trigger a job manually
const result = await atlas.scheduler.triggerJob("sync-locations");
console.log(result.data.success);
```

## Advanced Usage

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

// Get current configuration
const currentConfig = atlas.getConfig();
```

### Error Handling

```typescript
import { AtlasError, AtlasValidationError } from "@tallestguy/atlas-sdk";

try {
  const content = await atlas.content.list({ limit: -1 }); // Invalid limit
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
  PublicationStatistics,
  Person,
  Location,
  Deployment,
  Website,
  AFASEmployee,
  AFASTimeEntry
} from '@tallestguy/atlas-sdk';

// Full autocompletion and type checking
const client: AtlasClient = new AtlasClient(config);
const response: ApiResponse<ContentItem[]> = await client.content.list();
```

## React Integration Example

### Next.js App Router

```typescript
// app/lib/atlas.ts
import { AtlasClient } from "@tallestguy/atlas-sdk";

export const atlas = new AtlasClient({
  apiUrl: process.env.NEXT_PUBLIC_ATLAS_API_URL!,
  websiteId: process.env.NEXT_PUBLIC_ATLAS_WEBSITE_ID!,
  apiKey: process.env.ATLAS_API_KEY,
});

// app/blog/page.tsx
import { atlas } from '@/lib/atlas';

export default async function BlogPage() {
  const { data: posts } = await atlas.content.list({
    contentType: 'blog-post',
    status: 'published',
    limit: 10
  });

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Custom React Hook

```typescript
// hooks/useAtlasContent.ts
import { useState, useEffect } from 'react';
import { atlas } from '@/lib/atlas';
import type { ContentItem, ContentQueryOptions } from '@tallestguy/atlas-sdk';

export function useAtlasContent(options: ContentQueryOptions) {
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await atlas.content.list(options);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [JSON.stringify(options)]);

  return { data, loading, error };
}

// Usage in component
function BlogList() {
  const { data, loading, error } = useAtlasContent({
    contentType: 'blog-post',
    status: 'published',
    limit: 10
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

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
