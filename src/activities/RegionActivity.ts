import { NAMESPACE } from "../Settings.js";
import { Activity } from "./Activity.js";

// NOTE: This assumes a canvas["region"] layer is provided by another module.
export abstract class RegionActivity extends Activity {
  entity: any | undefined;
  data: ActivityData;
  config: EntityConfig;
  static type: EntityType = "region";

  protected constructor(entityId: string) {
    super();
    this.entity = RegionActivity.getEntity(entityId);
    if (!this.entity) {
      throw new Error(`${NAMESPACE} | Entity ${entityId} not found on scene`);
    }
    this.data = this.getData();
    this.config = this.getConfig();
  }

  static getEntity(entityId: string): any | undefined {
    return (canvas as Canvas).regions?.get(entityId)|| undefined;
  }

}