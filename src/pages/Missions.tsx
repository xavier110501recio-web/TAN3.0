import { Navigate } from "react-router-dom";
import { useMe } from "../lib/useMe";
import { useMissions } from "../lib/useMissions";
import { apiMissionToLegacy } from "../utils/storage";
import { roman } from "../utils/format";
import { Shell, Wordmark } from "../components/Shell";
import { RoadmapView } from "../components/RoadmapView";
import { MissionsSkeleton } from "../components/Skeletons";
import type { User } from "../types";

export function Missions() {
  const { snapshot: me, loading: meLoading, error: meError } = useMe();
  const { missions, loading: missionsLoading, error: missionsError } = useMissions(me?.profile.onboarding_complete ?? false);

  if (meError?.status === 401 || missionsError?.status === 401) return <Navigate to="/login" replace />;

  if (meLoading || missionsLoading || !me) {
    return (
      <Shell folio={["VOL. 01", "MISSION MAP"]} hideFolio>
        <MissionsSkeleton />
      </Shell>
    );
  }

  if (meError || missionsError) {
    return (
      <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
        <div className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col items-center justify-center gap-6 px-gutter text-center">
          <Wordmark size="sm" />
          <p className="mono-folio text-sauce-gold">{(meError || missionsError)?.message ?? "Couldn't load your missions."}</p>
        </div>
      </main>
    );
  }

  const p = me.profile;
  const user: User = {
    name: p.name,
    email: p.email ?? "",
    city: p.city,
    raw_dump: p.raw_dump,
    goal: p.goal,
    idea_type: p.idea_type,
    niche: p.niche,
    blockers: p.blockers,
    daily_time: p.daily_time,
    budget: p.budget,
    current_situation: p.current_situation,
    existing_skills: p.existing_skills,
    ninety_day_target: p.ninety_day_target,
    current_day: p.current_day,
    current_zone: p.current_zone,
    is_pro: p.is_pro,
    execution_score: p.execution_score,
    onboarding_complete: p.onboarding_complete,
    plan_summary_seen: p.plan_summary_seen,
    community_anonymous: p.community_anonymous,
    joined_at: p.joined_at,
    first_dollar_badge: p.first_dollar_badge,
    current_mission_title: p.current_mission_title ?? undefined,
    team_id: p.team_id ?? undefined,
  };
  const legacyMissions = (missions ?? []).map(apiMissionToLegacy);

  const folio = ["VOL. 01", `ZONE ${roman(user.current_zone)}`, "MISSION MAP"];

  return (
    <Shell folio={folio} hideFolio>
      <div className="flex flex-col gap-10 animate-screen-enter">
        <p className="max-w-measure text-lede text-sauce-creamMuted">
          Thirty missions, three zones. One at a time, in order. Resistance is the point.
        </p>
        <RoadmapView missions={legacyMissions} user={user} />
      </div>
    </Shell>
  );
}
