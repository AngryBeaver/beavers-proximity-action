import {NAMESPACE} from "../Settings.js";

export class EntityApp<T extends EntityType> {
    app;
    element;
    document;
    configs: EntityConfigs;
    dump: {}={};
    type: EntityType

    constructor(app, html, entity, type:T) {
        this.app = app;
        this.document = entity.document;
        this.element = html;
        this.configs =  EntityApp.getConfigs(entity);
        this.app.setPosition({width:500});
        this.type = type;
        this.addTab(app, html);
        this.init();
    }

    public static getConfigs(entity){
        return getProperty(entity.document || {}, `flags.${NAMESPACE}`) || {activities: {}};
    }

    addTab(app, html){

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
        if(this.app.activeTab !== undefined){
            this.app._tabs[0].activate(this.app.activeTab);
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
            this.app.activeTab = e.currentTarget.dataset.tab;
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
        Object.values((game as Game)[NAMESPACE].BeaversProximityAction.getActivities(this.type)).forEach(activity => {
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
            const activity = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity(config.activityId);
            if (activity) {
                const setting = (game as Game)[NAMESPACE].Settings.getActivitySettingData(activity);
                const data = {
                    key:key,
                    id: this.document.id,
                    type: this.type,
                    activityId: activity.id,
                    name: activity.template.name,
                }
                content += await renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs',
                    data
                );
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