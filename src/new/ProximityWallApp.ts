import {EntityApp} from "./EntityApp.js";

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


export class ProximityWallApp extends EntityApp<"wall">{
    constructor(app, html, data) {
        super(app,html,data,"wall");
    }

    addTab(app, html){
        _addTabs(app, html);
    }

}