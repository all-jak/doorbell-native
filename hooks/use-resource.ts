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
    setLoading(true);
    setError(null);

    try {
      const nextData = await requestRef.current();
      setData(nextData);
    } catch (resourceError) {
      setError(
        resourceError instanceof Error ? resourceError.message : 'DoorBell could not load this section.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
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
