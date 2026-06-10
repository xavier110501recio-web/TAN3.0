import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import type { MeSnapshot } from "../api/types";

interface UseMe {
  snapshot: MeSnapshot | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  setSnapshot: (snap: MeSnapshot) => void;
}

export function useMe(enabled = true): UseMe {
  const [snapshot, setSnapshot] = useState<MeSnapshot | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await api.me.get();
      setSnapshot(snap);
    } catch (e) {
      if (e instanceof ApiError) setError(e);
      else setError(new ApiError(0, (e as Error).message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void refetch();
  }, [enabled, refetch]);

  return { snapshot, loading, error, refetch, setSnapshot };
}
