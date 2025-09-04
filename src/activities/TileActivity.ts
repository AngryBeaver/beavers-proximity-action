import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

export abstract class TileActivity extends Activity {
  entity: Tile | undefined;
  data: ActivityData;
  config: EntityConfig;
  static type: EntityType = "tile";

  protected constructor(entityId: string) {
    super();
    this.entity = TileActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    this.data = this.getData();
    this.config = this.getConfig();
  }

  static getEntity(entityId: string): Tile | undefined {
    // @ts-ignore
    return canvas?.tiles?.get(entityId) || undefined;
  }

}