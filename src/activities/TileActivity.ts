import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

export abstract class TileActivity extends Activity {
  entity: Tile | undefined;
  configs: EntityConfig[];

  protected constructor(entityId: string) {
    super();
    this.entity = TileActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    const id = (this.constructor as typeof Activity).template.id;
    this.configs = Object.values(TileActivity.getConfigs(this.entity).activities).filter((a) => a.activityId === id);
  }

  static getEntity(entityId: string): Tile | undefined {
    // @ts-ignore
    return canvas?.tiles?.get(entityId) || undefined;
  }

  static getConfigs(entity: Tile): EntityConfigs {
    // @ts-ignore
    return foundry.utils.getProperty(entity.document || {}, `flags.${NAMESPACE}`) || { activities: {} };
  }

}