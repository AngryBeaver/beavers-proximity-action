import {NAMESPACE} from "../Settings.js";
import {WallAction} from "./WallAction.js";

function _addTabs(app, html) {
    if (html.find("nav").length == 0) {
        const old = html.find("form").html();
        html.find("form").html(`
<nav class="sheet-tabs tabs aria-role="Form Tab Navigation">
    <a class="item active" data-tab="basic"><i class="fas fa-university"></i> Basic</a>
</nav>
<div class="tab active" data-tab="basic"></div>
                `);
        html.find(".tab.active").html(old);
        const button = html.find("button[type=submit]");
        html.find("form").append(button);
        app.options.tabs = [{navSelector: ".tabs", contentSelector: "form", initial: "basic"}];
        app._tabs = app._createTabHandlers();
        app._tabs.forEach(t => t.bind(html[0]));
        app.setPosition({height: "auto"});
    }
}


export class ProximityWallApp {
    app;
    element;
    document;
    data: {activities: { id: string, data: any }[]};

    constructor(app, html, data) {
        this.app = app;
        this.document = data.document;
        this.element = html;
        this.data =  WallAction.getConfig(this.document);
        _addTabs(app, html);
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
            const activityData = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity(config.id)?.data;
            if(!activityData){
                this.data.activities.splice(index, 1);
            }
        });
        await this.update();
    }

    _setActivityOptions() {
        Object.values((game as Game)[NAMESPACE].BeaversProximityAction.getActivities("wall")).forEach(activity => {
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
        let content = "";
        for(const index in this.data.activities){
            const config = this.data.activities[index];
            const activityTemplate = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity( config.id)?.template;
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