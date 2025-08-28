import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

// NOTE: This assumes a canvas["region"] layer is provided by another module.
export abstract class RegionActivity extends Activity {
  entity: any | undefined;
  configs: EntityConfig[];

  protected constructor(entityId: string) {
    super();
    this.entity = RegionActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    const id = (this.constructor as typeof Activity).template.id;
    this.configs = Object.values(RegionActivity.getConfigs(this.entity).activities).filter((a) => a.activityId === id);
  }

  static getEntity(entityId: string): any | undefined {
    return (canvas as Canvas).regions?.get(entityId)|| undefined;
  }

  static getConfigs(entity: any): EntityConfigs {
    // @ts-ignore
    return foundry.utils.getProperty(entity.document || {}, `flags.${NAMESPACE}`) || { activities: {} };
  }

}