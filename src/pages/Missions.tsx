import { snapshot } from "../utils/storage";
import { roman } from "../utils/format";
import { Shell } from "../components/Shell";
import { RoadmapView } from "../components/RoadmapView";

export function Missions() {
  const { user, missions } = snapshot();
  const folio = ["VOL. 01", `ZONE ${roman(user.current_zone)}`, "MISSION MAP"];

  return (
    <Shell folio={folio}>
      <div className="flex flex-col gap-10 animate-screen-enter">
        <p className="max-w-measure text-lede text-sauce-creamMuted">
          Thirty missions, three zones. One at a time, in order. Resistance is the point.
        </p>
        <RoadmapView missions={missions} user={user} />
      </div>
    </Shell>
  );
}
