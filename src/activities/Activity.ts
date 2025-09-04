import {NAMESPACE} from "../Settings.js";
/**
 * Base class for all Activities.
 * Concrete activities should extend one of the entity-bound classes (TileActivity, WallActivity, RegionActivity).
 */
export abstract class Activity implements ActivityInstance{
  // The concrete entity (Tile, Wall, Region...), set by subclasses.
  abstract entity: any;
  // Per-entity stored configs (flags) for this activity.
  abstract config: EntityConfig;
  abstract data: ActivityData
  // The actor/user who triggered this activity.

  // Activity registration hooks into Foundry settings
  static get worldData(): ActivityData {
    return (game as Game)[NAMESPACE].Settings.getActivityData(this.id);
  }

  static get id(): string {
    return this.template.id;
  }
  static type: EntityType;

  // Run the activity with a test result
  abstract run(initiator: InitiatorI, testResults:TestResults): Promise<string>;

  // Activity template (override in concrete activities)
  static get template(): ActivityTemplate {
    return {
      id: this.name,
      name: this.name,
      desc: "",
      inputs: {},
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
      data:{},
      enabled: [],
    };
  }

  getData():ActivityData{
    const entityConfig = this.getConfig();
    return (this.constructor as typeof Activity).mergeData(entityConfig.activityData);
  }

  getConfig(): EntityConfig {
    const id = (this.constructor as typeof Activity).template.id;
    return Object.values(Activity.getConfigs(this.entity).activities)
      .find((a) => a.activityId === id) as EntityConfig;
  }

  static mergeData(entityData?: Partial<ActivityData>): ActivityData {
    const def = (this as any).defaultData as ActivityData;
    const world = (game as Game)[NAMESPACE].Settings.getActivityData(this.id) as ActivityData;
    // @ts-ignore
    const merged: ActivityData = foundry.utils.deepClone(def);
    // @ts-ignore
    foundry.utils.mergeObject(merged, world ?? {}, { inplace: true, insertKeys: true, overwrite: true });
    if (entityData) {
        // @ts-ignore
        foundry.utils.mergeObject(merged, entityData, { inplace: true, insertKeys: true, overwrite: true });
    }
    return merged;
  }

  static getConfigs(entity: any): EntityConfigs {
    // @ts-ignore
    return foundry.utils.getProperty(entity.document || {}, `flags.${NAMESPACE}`) || { activities: {} };
  }

  declare protected static readonly __assertAssignable: ActivityClass;
}