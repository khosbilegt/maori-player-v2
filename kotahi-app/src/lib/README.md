# Redux API Integration

This directory contains the Redux Toolkit Query (RTK Query) API integration for the Kotahi app, translated from the original frontend API client.

## Files

- `config.ts` - Environment configuration and API endpoints
- `types.ts` - TypeScript types for all API requests and responses
- `api.ts` - RTK Query API slice with all endpoints
- `hooks/api.ts` - Custom hooks for easier API usage in components
- `store.ts` - Redux store configuration with API slice

## Usage

### Basic Setup

The API slice is already configured in the Redux store. Make sure your components are wrapped with the `StoreProvider`:

```tsx
import StoreProvider from "@/app/StoreProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
```

### Using API Hooks

#### Authentication

```tsx
import { useAuth, useProfile } from '@/lib/hooks/api';

function LoginForm() {
  const { login } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const { data: user, isLoading } = useProfile(token);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password });
      setToken(result.data.token);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login form JSX
  );
}
```

#### Videos

```tsx
import { useVideos, useVideo } from "@/lib/hooks/api";

function VideoList() {
  const { videos, isLoading, error } = useVideos();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <div>
      {videos?.map((video) => (
        <div key={video.id}>{video.title}</div>
      ))}
    </div>
  );
}

function VideoDetail({ videoId }: { videoId: string }) {
  const { data: video, isLoading } = useVideo(videoId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{video?.title}</div>;
}
```

#### Vocabulary

```tsx
import { useVocabularies, useSearchVocabularies } from "@/lib/hooks/api";

function VocabularyList() {
  const { vocabularies, isLoading } = useVocabularies();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchVocabularies(searchQuery);

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search vocabulary..."
      />
      {(searchQuery ? searchResults : vocabularies)?.map((vocab) => (
        <div key={vocab.id}>
          <strong>{vocab.maori_word}</strong> - {vocab.english_translation}
        </div>
      ))}
    </div>
  );
}
```

#### Watch History

```tsx
import { useWatchHistory, useWatchHistoryMutations } from "@/lib/hooks/api";

function WatchHistoryComponent() {
  const token = "your-jwt-token";
  const { data: watchHistory } = useWatchHistory(token);
  const { createOrUpdate, deleteWatchHistory } = useWatchHistoryMutations();

  const updateProgress = async (videoId: string, progress: number) => {
    await createOrUpdate(token, {
      video_id: videoId,
      progress,
      current_time: 0,
      duration: 100,
      completed: progress >= 100,
    });
  };

  return (
    <div>
      {watchHistory?.data.map((history) => (
        <div key={history.id}>
          Video {history.video_id}: {history.progress}% complete
        </div>
      ))}
    </div>
  );
}
```

#### Learning List

```tsx
import { useLearningList, useLearningListMutations } from "@/lib/hooks/api";

function LearningListComponent() {
  const token = "your-jwt-token";
  const { data: learningList } = useLearningList(token);
  const { createItem, updateItem, deleteItem } = useLearningListMutations();

  const addItem = async (text: string) => {
    await createItem(token, { text });
  };

  const updateStatus = async (id: string, status: string) => {
    await updateItem(token, id, { status });
  };

  return (
    <div>
      {learningList?.data.map((item) => (
        <div key={item.id}>
          {item.text} - {item.status}
          <button onClick={() => updateStatus(item.id, "learned")}>
            Mark as Learned
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Environment Configuration

Set your API base URL in environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Error Handling

RTK Query provides built-in error handling. You can access error information in your components:

```tsx
const { data, error, isLoading } = useGetVideosQuery();

if (error) {
  // Handle error
  if ("status" in error) {
    // HTTP error
    console.error("HTTP Error:", error.status);
  } else {
    // Network error
    console.error("Network Error:", error.message);
  }
}
```

### Caching and Invalidation

RTK Query automatically handles caching and provides cache invalidation through tags. The API slice is configured with appropriate tags for each endpoint type:

- `User` - User-related data
- `Video` - Video data
- `Vocabulary` - Vocabulary data
- `WatchHistory` - Watch history data
- `LearningList` - Learning list data
- `VTT` - VTT file data

When you perform mutations, related cache entries are automatically invalidated and refetched.

## Migration from Original API Client

The main differences from the original API client:

1. **Automatic caching** - No need to manually manage cache
2. **Loading states** - Built-in loading and error states
3. **Optimistic updates** - Can be configured for better UX
4. **Background refetching** - Automatic data synchronization
5. **Type safety** - Full TypeScript support
6. **DevTools integration** - Redux DevTools support for debugging

All the same endpoints and functionality are available, just with improved developer experience and performance.
