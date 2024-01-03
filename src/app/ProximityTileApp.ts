import {bpa} from "../bpaTypes.js";
import {Activity} from "../activities/Activity.js";
import {NAMESPACE} from "../Settings.js";
import {TileActivity} from "../activities/tiles/TileActivity.js";

//Proximity Extension for Tiles
//Renders Activity-Selection on the Tile
//When a TileActivity is activated it will add itself as Option. ? Why then why always deactivate afterwards ?
//When an activity-configuration is added to the tile this will store it on the tile;
//Renders Activity-Configuration on the Tile
//Can Edit Activity-Configuration and store it on the tile.
//There is one instance of ProximityTileApp.

export class ProximityTileApp {
    tileApp;
    element;
    document;
    data: {activities: { id: string, data: any }[]};
    registeredActivities: bpa.ActivityClass[] = [];

    constructor(app, html, data) {
        this.tileApp = app;
        this.document = data.document;
        this.element = html;
        this.data =  getProperty(this.document.flags, NAMESPACE) || {activities:[]};
        this.registeredActivities = game[NAMESPACE].BeaversProximityAction.getActivities(TileActivity);
        this.init();
    }

    init() {
        if (this.element.find(".tab[data-tab=proximity]").length == 0) {
            this._addProximityTab();
            this._setActivityOptions();
            this._removeUnregisteredStoredActivities().then(x=>{
                void this.render();
            })
        }
    }

    _addProximityTab() {
        this.element.find("form>nav.tabs").append('<a class="item" data-tab="proximity"><i class="fas fa-street-view"></i> Proximity</a>');
        this.element.find(".tab[data-tab=basic]").after('<div class="tab" data-tab="proximity"><div style="margin-bottom:20px" class="form-group">' +
            '<label>Activity </label><div class="form-fields">' +
            '<select data-id="activity-select"></select>' +
            '<button type="button" style="display:flex;padding:0px;line-height:25px;border-radius:5px;"><span style="width:25px; background-color: rgba(0,0,0,0.1)"><i class="fas fa-plus"></i></span>' +
            '<span style="padding: 0px 20px;">Add</span></button>' +
            '</div></div><div data-id="activity-content"></div></div>');
        this.element.find(".tab[data-tab=proximity] button").on("click", (event) => {
            const activityId = this.element.find(".tab[data-tab=proximity] select").val();
            this.addActivityConfig(activityId)
        })
    }

    async _removeUnregisteredStoredActivities() {
        this.data.activities.forEach((config, index) => {
            const activityData = this.registeredActivities.find(a => a.defaultData.id === config.id)?.defaultData;
            if(!activityData){
                this.data.activities.splice(index, 1);
            }
        });
        await this.update();
    }

    _setActivityOptions() {
        this.registeredActivities.forEach(tileActivity => {
            const activity = tileActivity.defaultData;
            this.element.find(`select[data-id=activity-select]`).append(`<option value='${activity.id}'>${activity.name}</option>`);
        })
    }

    addActivityConfig(activityId) {
        this.data.activities.push({id: activityId, data: {}});
        void this.update();
    }

    removeActivityConfig(index: number) {
        this.data.activities.splice(index, 1);
        void this.update();
    }

    async update() {
        this.document.update({flags: {[NAMESPACE]: this.data}})
    }

    async render() {
        //const configuration:bpa.ActivityConfiguration = this._getConfiguration();
        let content = "";
        for(const index in this.data.activities){
            const config = this.data.activities[index];
            const activityData = this.registeredActivities.find(a => a.defaultData.id === config.id)?.defaultData;
            if (activityData) {
                content += await renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs', {
                    id: index,
                    path: `${NAMESPACE}.activities[${index}].data`,
                    name: activityData.name,
                    config: activityData.config,
                    tests: [],
                    data: config.data,
                });
            }
        };
        this.element.find(`div[data-id=activity-content]`).html(content);
        this._activateHandler();
    }

    _activateHandler(){
        this.element.find("h2 .item-delete").on("click",(e)=>{
            const index = e.currentTarget.dataset.id;
            this.removeActivityConfig(index);
        })
    }

}