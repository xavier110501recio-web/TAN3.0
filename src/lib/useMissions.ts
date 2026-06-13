import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import type { ApiMission } from "../api/types";

interface UseMissions {
  missions: ApiMission[] | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useMissions(enabled = true): UseMissions {
  const [missions, setMissions] = useState<ApiMission[] | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMissions(await api.missions.list());
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

  return { missions, loading, error, refetch };
}
