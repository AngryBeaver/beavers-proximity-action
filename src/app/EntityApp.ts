import {NAMESPACE} from "../Settings.js";
import { addTab } from "./Tabs.js";

export class EntityApp<T extends EntityType> {
    app;
    element;
    document;
    configs: EntityConfigs;
    dump: {}={};
    type: EntityType

    constructor(app, html, entity, type:T) {
        this.app = app;
        this.document = app.document;
        this.element = $(html);
        this.app.setPosition({width:500});
        this.type = type;
        this.init();
    }

    private getConfigs(){
        // @ts-ignore
      return foundry.utils.getProperty(this.document
        || {}, `flags.${NAMESPACE}`) || {activities: {}};
    }

    public content(tabData:TabData){

    }

    private setTab(){
        var tabData:TabData = {
            id: "proximity",
            name: "Proximity",
            icon: '<i class="fas fa-street-view"></i>',
            group: "sheet",
            content: '<div data-id="activity-content"></div>',
            onClick: this.onActivateTab.bind(this)
        }
        this.content(tabData);
        addTab(this.element,tabData);
        this.app.changeTab(this.app.tabGroups[tabData.group],tabData.group,{force:true})
    }

    init() {
        this.configs = this.getConfigs();
        this.setTab();
        void this._removeUnregisteredStoredActivities();
        this._activateTab();
        this.render();
    }


    _activateTab(){
        if(this.app.activeTab !== undefined){
            this.app._tabs[0].activate(this.app.activeTab);
        }
    }

    onActivateTab(){
        console.log("tab");
    }
    onAddActivity(){
        console.log("addActivity");
    }

    async _removeUnregisteredStoredActivities() {
        let hasChanged = false;
        Object.entries(this.configs.activities).forEach(([key,config]) => {
            const activityClass = (game as Game)[NAMESPACE].BeaversProximityApp.getActivity(config.activityId);
            if(!activityClass){
                hasChanged = true;
                delete this.configs.activities[key];
                this.dump["-="+key]=null;
            }});
        if(hasChanged) {
            await this.update();
        }
    }

    _setActivityOptions() {
        Object.values((game as Game)[NAMESPACE].BeaversProximityApp.getActivities(this.type)).forEach(activity => {
            this.element.find(`select[data-id=activity-select]`).append(`<option value='${activity.id}'>${activity.name}</option>`);
        })
    }

    addActivityConfig(activityId) {
        // @ts-ignore
      const id = foundry.utils.randomID();
        this.configs.activities[id] = { activityId: activityId, data: {}};
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
            const activity = (game as Game)[NAMESPACE].BeaversProximityApp.getActivity(config.activityId);
            if (activity) {
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
        this.activateHandler();
    }

    activateHandler(){
        this.element.find("h2 .item-delete").on("click",(e)=>{
            const index = e.currentTarget.dataset.id;
            this.removeActivityConfig(index);
        })
    }

}