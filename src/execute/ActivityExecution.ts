import { NAMESPACE } from "../Settings.js";
import { TestHandler } from "./TestHandler.js";

export async function executeActivityGM(args: ActivityPayload) {
  const { activityId, entityIds, initiatorData } = args;
  const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
  const activityClass = bpa.getActivity(activityId);
  if (!activityClass) throw new Error(`Activity not found: ${activityId}`);

  // For each entity, create and run one instance (keeps your current Activity API intact)
  for (const entityId of entityIds) {
    // Build instance (the Activity subclass itself collects its own per-entity configs)
    const instance = new (activityClass as any)(entityId, initiatorData as any) as ActivityInstance;

    // Merge global data hierarchy: default <- world <- entity override
    const merged = (activityClass as any).mergeData(instance.configs) as ActivityData;

    // Test gating
    if (merged.beaversTests) {
      const handler = new TestHandler(merged.beaversTests);
      // Iterate tests until no more OR until fails exceed max (handler encapsulates this)
      while (handler.hasAdditionalTests()) {
        const res = await handler.test(initiatorData);
        if (res.fails > res.maxFails) break;
      }
      const final = handler.getTestsResult();
      if (final.fails > final.maxFails || final.hits < final.maxHits) {
        // Tests not passed -> abort
        return;
      }
    }

    // Run the activity
    await (instance as any).run();
  }
}