import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./new/BeaversProximityAction.js";
import {UserInteraction} from "./new/UserInteraction.js";
import {ProximityActionUI} from "./uis/ProximityActionUI.js";
import {ActivityLayer} from "./canvas/ActivityLayer.js";
import {ProximityTileApp} from "./new/ProximityTileApp.js";
import {DisplayProxy} from "./new/DisplayProxy.js";
import {BeaversButton} from "./elements/Button.js";
import {InvestigateActivity} from "./new/InvestigateActivity.js";
import {BeaversActivityTestConfig} from "./elements/BeaversActivityTestConfig.js";


export const HOOK_READY = NAMESPACE + ".ready";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";
export const SOCKET_TEST_PROMPT = "testPrompt";

Hooks.on("beavers-system-interface.init", async function () {
    beaversSystemInterface.addModule(NAMESPACE);
});

Hooks.once('init', () => {
    game[NAMESPACE] = game[NAMESPACE] || {};
    game[NAMESPACE].Settings = new Settings();
})

Hooks.once("beavers-system-interface.ready", async function () {
    game[NAMESPACE] = game[NAMESPACE] || {};
    game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
    game[NAMESPACE].DisplayProxy = new DisplayProxy();
    game[NAMESPACE].UserInteraction = new UserInteraction(game[NAMESPACE].BeaversProximityAction);
    game[NAMESPACE].ActivityLayer = new ActivityLayer();
    game[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, game[NAMESPACE].BeaversProximityAction.executeAction.bind(game[NAMESPACE].BeaversProximityAction));
    game[NAMESPACE].socket.register(SOCKET_TEST_PROMPT, game[NAMESPACE].DisplayProxy.prompt.bind(game[NAMESPACE].DisplayProxy));
    Hooks.call(HOOK_READY, game[NAMESPACE].BeaversProximityAction);
    initHandlebars();
    initializeCustomElements();
    Hooks.on("renderTileConfig", (app, html, options) => {
        new ProximityTileApp(app, html, options);
    });

})

Hooks.on(HOOK_READY, async function () {
    if(game instanceof Game){
        game[NAMESPACE].BeaversProximityAction.addActivity(InvestigateActivity);
        //game[NAMESPACE].BeaversProximityAction.addActivityClass(InvestigateActivity);
    }
});

Hooks.once("beavers-gamepad.ready", () => {
    const paUI = new ProximityActionUI();
    game["beavers-gamepad"].TinyUIModuleManager.addModule(paUI.name, paUI);
});

Hooks.once("socketlib.ready", () => {
    game[NAMESPACE] = game[NAMESPACE] || {};
    game[NAMESPACE].socket = socketlib.registerModule(NAMESPACE);
});


Hooks.on("ready", ()=>{

});

function initializeCustomElements(){
    customElements.define('beavers-button',BeaversButton);
    customElements.define('beavers-activity-test-config',BeaversActivityTestConfig)
}


function initHandlebars(){
    Handlebars.registerHelper("beavers-objectLen", function (json) {
        return Object.keys(json).length;
    });
    void getTemplate('modules/beavers-proximity-action/templates/activity-setting.hbs');
    void getTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs');
    void getTemplate('modules/beavers-proximity-action/templates/activity-test-config.hbs');
    getTemplate('modules/beavers-proximity-action/templates/beavers-input-field.hbs').then(t=>{
        Handlebars.registerPartial('beavers-input-field', t);
    });


}