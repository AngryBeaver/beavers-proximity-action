import {Activity} from "../Activity.js";
import {BPAEngine} from "../BPAEngine.js";
import {bpa} from "../../bpaTypes";

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

function _addProximityTab(app, html) {
    if (html.find(".tab[data-tab=proximity]").length == 0) {
        html.find("form>nav.tabs").append('<a class="item" data-tab="proximity"><i class="fas fa-street-view"></i> Proximity</a>');
        html.find(".tab[data-tab=basic]").after('<div class="tab" data-tab="proximity"></div>');
    }
}

/**
 * Activities are instanciated when active on a Scene
 * WallActivities can add a proximity-action-tab on walls
 * specific WallActivities can add a configuration section to a wall
 */
export class BaseWallActivity extends Activity {

    constructor(parent: BPAEngine, sceneId: string) {
        super(parent, sceneId);
        this._hookRegistry.push({
            hookId: "renderWallConfig",
            method: (app, html, options) => {
                _addTabs(app, html);
                _addProximityTab(app, html);
                const flags = getProperty(options.document.flags, this.id) || {};
                const configuration: bpa.ActivityConfiguration = this._getConfiguration();
                renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs', {
                    id: this.id,
                    name: this.name,
                    config: this._data.config,
                    tests: configuration,
                    data: flags,
                }).then(content => {
                    html.find(`.tab[data-tab=proximity]`).append(content);
                });
            }
        });
    }
}