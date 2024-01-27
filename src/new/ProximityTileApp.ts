import {NAMESPACE} from "../Settings.js";
import {TileAction} from "./TileAction.js";

export class ProximityTileApp {
    tileApp;
    element;
    document;
    configs: ActivityConfigs;
    dump: {}={};

    constructor(app, html, tile:Tile) {
        this.tileApp = app;
        this.document = tile.document;
        this.element = html;
        this.configs =  TileAction.getConfigs(tile);
        this.tileApp.setPosition({width:500});
        this.init();
    }

    init() {
        if (this.element.find(".tab[data-tab=proximity]").length == 0) {
            this._addProximityTab();
            this._setActivityOptions();
            void this._removeUnregisteredStoredActions();
        }
        this._activateTab();
        this.render();
    }

    _activateTab(){
        if(this.tileApp.activeTab !== undefined){
            this.tileApp._tabs[0].activate(this.tileApp.activeTab);
        }
    }

    _addProximityTab() {
        this.element.find("nav.sheet-tabs:not(.trigger-tabs)").append('<a class="item" data-tab="proximity"><i class="fas fa-street-view"></i> Proximity</a>');
        this.element.find(".tab[data-tab=basic]").after('<div class="tab" data-tab="proximity"><div style="margin-bottom:20px" class="form-group">' +
            '<label>Activity </label><div class="form-fields">' +
            '<select data-id="activity-select"></select>' +
            '<button type="button" style="display:flex;padding:0px;line-height:25px;border-radius:5px;"><span style="width:25px; background-color: rgba(0,0,0,0.1)"><i class="fas fa-plus"></i></span>' +
            '<span style="padding: 0px 20px;">Add</span></button>' +
            '</div></div><div data-id="activity-content"></div></div>');
        this.element.find("nav.sheet-tabs:not(.trigger-tabs) a.item").on("click",(e)=>{
            this.tileApp.activeTab = e.currentTarget.dataset.tab;
        });
        this.element.find(".tab[data-tab=proximity] button").on("click", (event) => {
            const activityId = this.element.find(".tab[data-tab=proximity] select").val();
            this.addActivityConfig(activityId)
        })
    }

    async _removeUnregisteredStoredActions() {
        let hasChanged = false;
        Object.entries(this.configs.activities).forEach(([key,config]) => {
            const activityData = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity(config.activityId)?.data;
            if(!activityData){
                hasChanged = true;
                delete this.configs.activities[key];
                this.dump["-="+key]=null;
            }});
        if(hasChanged) {
            await this.update();
        }
    }

    _setActivityOptions() {
        Object.values((game as Game)[NAMESPACE].BeaversProximityAction.getActivities("tile")).forEach(activity => {
            this.element.find(`select[data-id=activity-select]`).append(`<option value='${activity.id}'>${activity.name}</option>`);
        })
    }

    addActivityConfig(activityId) {
        this.configs.activities[foundry.utils.randomID()] = { activityId: activityId, data: {}};
        void this.update();
    }

    removeActivityConfig(key: string) {
        delete this.configs.activities[key];
        this.dump["-="+key]=null;
        void this.update();
    }

    async update() {
        var flags = {};
        flags[NAMESPACE]= this.configs
        Object.keys(this.dump).forEach(key=>{
            flags[NAMESPACE].activities[key]=null;
        });
        this.dump={};
        this.document.update({flags:flags})
    }

    async render() {
        let content = "";
        for(const key in this.configs.activities){
            const config = this.configs.activities[key];
            const activityTemplate = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity(config.activityId)?.template;
            const setting = (game as Game)[NAMESPACE].Settings.getActivityData(config.activityId);
            if (activityTemplate) {
                content += await renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs', {
                    key: key,
                    activityId: config.activityId,
                    path: `flags.${NAMESPACE}.activities.${key}`,
                    name: activityTemplate.name,
                    config: activityTemplate.config,
                    test: setting.test,
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