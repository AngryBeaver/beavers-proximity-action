import type { Activity } from "./activities/Activity.js";
import type { TileActivity } from "./activities/TileActivity.js";
import type { WallActivity } from "./activities/WallActivity.js";
import type { RegionActivity } from "./activities/RegionActivity.js";

// Constructor types (static side)
export type ActivityClass = typeof Activity;
export type TileActivityClass = typeof TileActivity;
export type WallActivityClass = typeof WallActivity;
export type RegionActivityClass = typeof RegionActivity;
export type ActivityInstance = InstanceType<ActivityClass>;