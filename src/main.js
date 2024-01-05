import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./new/BeaversProximityAction.js";
import {SecretDoorActivity} from "./activities/walls/SecretDoorActivity.js";
import {UserInteraction} from "./new/UserInteraction.ts";
import {TestHandler} from "./new/TestHandler.ts";
import {ProximityActionUI} from "./uis/ProximityActionUI.js";
import {ActivityLayer} from "./canvas/ActivityLayer.js";
import {InvestigateActivity} from "./activities/tiles/InvestigateActivity.js";
import {ProximityTileApp} from "./new/ProximityTileApp.js";
import {DisplayProxy} from "./new/DisplayProxy.js";


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
    //game[NAMESPACE].UserInteraction = new UserInteraction(game[NAMESPACE].BeaversProximityAction);
    game[NAMESPACE].ActivityLayer = new ActivityLayer();
    game[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, game[NAMESPACE].BeaversProximityAction.executeActivity.bind(game[NAMESPACE].BeaversProximityAction));
    game[NAMESPACE].socket.register(SOCKET_TEST_PROMPT, TestHandler.testPrompt.bind(TestHandler));
    initHandlebars();
    Hooks.call(HOOK_READY, game[NAMESPACE].BeaversProximityAction);

    Hooks.on("renderTileConfig", (app, html, options) => {
        new ProximityTileApp(app, html, options);
    });

})

Hooks.on(HOOK_READY, async function () {
    if(game instanceof Game){
        //game[NAMESPACE].BeaversProximityAction.addActivityClass(SecretDoorActivity);
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



function initHandlebars(){
    Handlebars.registerHelper("beavers-objectLen", function (json) {
        return Object.keys(json).length;
    });
    void getTemplate('modules/beavers-proximity-action/templates/activity-setting.hbs');
    void getTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs');
    getTemplate('modules/beavers-proximity-action/templates/beavers-input-data.hbs').then(t=>{
        Handlebars.registerPartial('beavers-input-data', t);
    });
}