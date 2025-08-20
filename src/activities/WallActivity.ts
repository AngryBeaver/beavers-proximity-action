import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

export abstract class WallActivity extends Activity {
  entity: Wall | undefined;
  configs: EntityConfig[];

  protected constructor(entityId: string) {
    super();
    this.entity = WallActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    const id = (this.constructor as typeof Activity).template.id;
    this.configs = Object.values(WallActivity.getConfigs(this.entity).activities).filter((a) => a.activityId === id);
  }

  static getEntity(entityId: string): Wall | undefined {
    // @ts-ignore walls is a layer
    return canvas?.walls?.get(entityId) || undefined;
  }

  static getConfigs(entity: Wall): EntityConfigs {
    // @ts-ignore
    return foundry.utils.getProperty(entity.document || {}, `flags.${NAMESPACE}`) || { activities: {} };
  }
}