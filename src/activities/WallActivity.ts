import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

export abstract class WallActivity extends Activity {
  entity: Wall | undefined;
  data: ActivityData;
  config: EntityConfig;
  static type: EntityType = "wall";

  protected constructor(entityId: string) {
    super();
    this.entity = WallActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    this.data = this.getData();
    this.config = this.getConfig();
  }

  static getEntity(entityId: string): Wall | undefined {
    // @ts-ignore walls is a layer
    return canvas?.walls?.get(entityId) || undefined;
  }
}