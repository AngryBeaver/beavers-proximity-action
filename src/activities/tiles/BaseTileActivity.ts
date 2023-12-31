import {Activity} from "../Activity.js";
import {BPAEngine} from "../BPAEngine.js";
import {bpa} from "../../bpaTypes";


function _addProximityTab(app, html) {
    if (html.find(".tab[data-tab=proximity]").length == 0) {
        html.find("form>nav.tabs").append('<a class="item" data-tab="proximity"><i class="fas fa-street-view"></i> Proximity</a>');
        html.find(".tab[data-tab=basic]").after('<div class="tab" data-tab="proximity"></div>');
    }
}

/**
 * Activities are instanciated when active on a Scene
 * TileActivities can add a proximity-action-tab on tiles
 * specific TileActivities can add a configuration section to a tile
 */
export class BaseTileActivity extends Activity {

    constructor(parent: BPAEngine, sceneId: string) {
        super(parent, sceneId);

        this._hookRegistry.push({
            hookId: "renderTileConfig",
            method: (app, html, options) => {
                _addProximityTab(app, html);
                const flags = getProperty(options.document.flags,this.id) || {};
                const configuration:bpa.ActivityConfiguration = this._getConfiguration();
                renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs',{
                    id: this.id,
                    name: this.name,
                    config: this._data.config,
                    tests: configuration,
                    data:flags,
                }).then(content=>{
                    html.find(`.tab[data-tab=proximity]`).append(content);
                });
            }
        });
    }
}