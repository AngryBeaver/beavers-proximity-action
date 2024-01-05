import {NAMESPACE} from "../Settings.js";
import {TileAction} from "./TileAction.js";

export class ProximityTileApp {
    tileApp;
    element;
    document;
    data: {activities: { id: string, data: any }[]};

    constructor(app, html, data) {
        this.tileApp = app;
        this.document = data.document;
        this.element = html;
        this.data =  TileAction.getConfig(this.document);
        this.init();
    }

    init() {
        if (this.element.find(".tab[data-tab=proximity]").length == 0) {
            this._addProximityTab();
            this._setActivityOptions();
            void this._removeUnregisteredStoredActions();
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

    async _removeUnregisteredStoredActions() {
        this.data.activities.forEach((config, index) => {
            const activityData = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity("tile", config.id)?.data;
            if(!activityData){
                this.data.activities.splice(index, 1);
            }
        });
        await this.update();
    }

    _setActivityOptions() {
        Object.values((game as Game)[NAMESPACE].BeaversProximityAction.getActivities("tile")).forEach(activity => {
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
            const activityTemplate = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity("tile", config.id)?.template;
            if (activityTemplate) {
                content += await renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs', {
                    id: index,
                    path: `${NAMESPACE}.activities[${index}].data`,
                    name: activityTemplate.name,
                    config: activityTemplate.config,
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