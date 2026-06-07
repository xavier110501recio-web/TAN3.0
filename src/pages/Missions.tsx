import { useEffect, useState } from "react";
import { snapshot } from "../utils/storage";
import { roman } from "../utils/format";
import { Shell } from "../components/Shell";
import { RoadmapView } from "../components/RoadmapView";
import { MissionsSkeleton } from "../components/Skeletons";

export function Missions() {
  const { user, missions } = snapshot();
  // TODO(api): mock skeleton hold — when wiring real API, only show <MissionsSkeleton /> if the request hasn't resolved within ~200ms (otherwise it flickers on fast responses).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const folio = ["VOL. 01", `ZONE ${roman(user.current_zone)}`, "MISSION MAP"];

  return (
    <Shell folio={folio} hideFolio>
      {loading ? (
        <MissionsSkeleton />
      ) : (
        <div className="flex flex-col gap-10 animate-screen-enter">
          <p className="max-w-measure text-lede text-sauce-creamMuted">
            Thirty missions, three zones. One at a time, in order. Resistance is the point.
          </p>
          <RoadmapView missions={missions} user={user} />
        </div>
      )}
    </Shell>
  );
}
