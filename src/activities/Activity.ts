import {NAMESPACE} from "../Settings.js";
/**
 * Base class for all Activities.
 * Concrete activities should extend one of the entity-bound classes (TileActivity, WallActivity, RegionActivity).
 */
export abstract class Activity implements ActivityInstance{
  // The concrete entity (Tile, Wall, Region...), set by subclasses.
  abstract entity: any;
  // Per-entity stored configs (flags) for this activity.
  abstract configs: EntityConfig[];
  // The actor/user who triggered this activity.

  // Activity registration hooks into Foundry settings
  static get worldData(): ActivityData {
    return (game as Game)[NAMESPACE].Settings.getActivityData(this.id);
  }

  static get id(): string {
    return this.template.id;
  }

  // Run the activity with a test result
  abstract run(initiator: InitiatorI, testResult:TestResult): Promise<void>;

  // Activity template (override in concrete activities)
  static get template(): ActivityTemplate {
    return {
      id: this.name,
      name: this.name,
      desc: "",
      config: {},
      allowSubOptions: false,
      detection: { mode: "sight" },
      fallback: (_initiator: InitiatorI) => {
        // optional
      },

    };
  }

  static customizationFields?: Record<string, InputField>;

  static get defaultData(): ActivityData {
    return {
      enabled: [],
    };
  }

  static mergeData(configs: EntityConfig[]): ActivityData {
    const def = (this as any).defaultData as ActivityData;
    const world = (game as Game)[NAMESPACE].Settings.getActivityData(this.id) as ActivityData;
    // @ts-ignore
    const merged: ActivityData = foundry.utils.deepClone(def);
    // @ts-ignore
    foundry.utils.mergeObject(merged, world ?? {}, { inplace: true, insertKeys: true, overwrite: true });
    for (const cfg of configs) {
      if (cfg.activityData) {
        // @ts-ignore
        foundry.utils.mergeObject(merged, cfg.activityData, { inplace: true, insertKeys: true, overwrite: true });
      }
    }
    return merged;
  }

  get data(): ActivityData {
    const ctor = this.constructor as typeof Activity;
    return ctor.mergeData(this.configs);
  }


  declare protected static readonly __assertAssignable: ActivityClass;
}