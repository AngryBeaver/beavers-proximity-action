import {Activity} from "./Activity.js";
import {BPAEngine} from "./BPAEngine.js";
import {bpa} from "../bpaTypes";

/**
 * Activities are instanciated when active on a Scene
 * WallActivities can add a proximity-action-tab on walls
 * specific WallActivities can add a configuration section to a wall
 */
export class BaseWallActivity extends Activity {

    constructor(parent: BPAEngine, sceneId: string) {
        super(parent, sceneId);

        function _addTabs(app, html) {
            if (html.find("nav").length == 0) {
                const old = html.find("form").html();
                html.find("form").html(`
<nav class="sheet-tabs tabs aria-role="Form Tab Navigation">
    <a class="item active" data-tab="basic"><i class="fas fa-university"></i> Basic</a>
    <a class="item" data-tab="proximity"><i class="fas fa-street-view"></i> Proximity</a>
</nav>
<div class="tab active" data-tab="basic"></div>
<div class="tab" data-tab="proximity"></div>
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
        this._hookRegistry.push({
            hookId: "renderWallConfig",
            method: (app, html, options) => {
                _addTabs(app, html);
                const flags = getProperty(options.document.flags,this.id) || {};
                const configurations:bpa.TestConfigurations = this._getConfigurations()
                html.find(".tab[data-tab=proximity]").append(`
                <fieldset data-id="${this.id}">
                    <legend>${this.name}</legend>
                </fieldset>
            `);
                for (const [id, configuration] of Object.entries(configurations)) {
                    html.find(`.tab[data-tab=proximity] fieldset`).append(`
<div class="form-group">
    <label>${configuration.inputData.label}</label>
    <input placeholder="${configuration.defaultValue}" value="${flags[id]}" name="flags.${this.id}.${id}" type="${configuration.inputData.type}"/>
    <p class="notes">${id}</p>
</div>
            `);
                }
            }
        });
    }
}