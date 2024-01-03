import {Activity} from "../Activity.js";
import {BPAEngine} from "../BPAEngine.js";




/**
 * Activities are instanciated when active on a Scene
 * TileActivities can add a proximity-action-tab on tiles
 * specific TileActivities can add a configuration section to a tile
 */
export class TileActivity extends Activity {

    constructor(parent: BPAEngine, sceneId: string) {
        super(parent, sceneId);
    }


}