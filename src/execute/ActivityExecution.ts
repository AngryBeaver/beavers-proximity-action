import { NAMESPACE } from "../Settings.js";
import { TestHandler } from "./TestHandler.js";

export async function executeActivityGM(args: ActivityPayload) {
  const { activityId,entityId, testResults, initiatorData } = args;
  const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
  const activityClass = bpa.getActivity(activityId);
  if (!activityClass) throw new Error(`Activity not found: ${activityId}`);
  const instance = new (activityClass as any)(entityId, initiatorData as any) as ActivityInstance;
  return await (instance as any).run(initiatorData,testResults);
}