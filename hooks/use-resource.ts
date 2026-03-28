import { useCallback, useEffect, useRef, useState } from 'react';

type UseResourceOptions<T> = {
  key: string;
  enabled?: boolean;
  initialData?: T;
  request: () => Promise<T>;
};

export function useResource<T>({ key, enabled = true, initialData, request }: UseResourceOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(request);

  requestRef.current = request;

  const runRequest = useCallback(async () => {
    console.log('[DoorBell resource] Loading resource', {
      key,
      enabled,
    });

    setLoading(true);
    setError(null);

    try {
      const nextData = await requestRef.current();
      console.log('[DoorBell resource] Resource loaded', {
        key,
      });
      setData(nextData);
    } catch (resourceError) {
      console.error('[DoorBell resource] Resource failed', {
        key,
        error:
          resourceError instanceof Error
            ? {
                name: resourceError.name,
                message: resourceError.message,
                stack: resourceError.stack,
              }
            : resourceError,
      });

      setError(
        resourceError instanceof Error ? resourceError.message : 'DoorBell could not load this section.'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled) {
      console.log('[DoorBell resource] Resource skipped because it is disabled', {
        key,
      });
      setLoading(false);
      return;
    }

    void runRequest();
  }, [enabled, key, runRequest]);

  return {
    data,
    loading,
    error,
    refresh: runRequest,
  };
}
