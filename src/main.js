import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./app/BeaversProximityAction.js";
import {SecretDoorActivity} from "./activities/SecretDoorActivity.js";
import {UserInteraction} from "./app/UserInteraction.js";
import {TestHandler} from "./app/TestHandler.js";
import {InteractionLayer} from "./test/InteractionLayer.js";
import {ProximityActionUI} from "./uis/ProximityActionUI.js";
import {Highlighting} from "./test/Highlighting.js";


export const HOOK_READY = NAMESPACE+".ready";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";
export const SOCKET_TEST_PROMPT = "testPrompt";

let layers = Canvas.layers;
layers.interaction = {
        group: "interface",
        layerClass:InteractionLayer
}
Object.defineProperty(Canvas, 'layers', {get: function() {
                return layers
}})

Hooks.on("beavers-system-interface.init", async function(){
        beaversSystemInterface.addModule(NAMESPACE);
});

Hooks.once('init', () => {
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
        game.socket.on('module.TerrainLayer', async (data) => {
                console.log(data)
                canvas.terrain[data.action].apply(canvas.terrain,data.arguments);
        })
})

Hooks.once("beavers-system-interface.ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        game[NAMESPACE].UserInteraction = new UserInteraction(game[NAMESPACE].BeaversProximityAction);
        game[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, game[NAMESPACE].BeaversProximityAction.executeActivity.bind(game[NAMESPACE].BeaversProximityAction));
        game[NAMESPACE].socket.register(SOCKET_TEST_PROMPT, TestHandler.testPrompt.bind(TestHandler));
        Hooks.call(HOOK_READY,game[NAMESPACE].BeaversProximityAction);
        game[NAMESPACE].Highlighting = new Highlighting();
        activateScene();
})

Hooks.on(HOOK_READY,async function(){
        game[NAMESPACE].BeaversProximityAction.addActivityClass(SecretDoorActivity);
});

Hooks.on("canvasReady",async function(canvas){
        game[NAMESPACE]=game[NAMESPACE]||{};
        activateScene();
});

function activateScene(){
        if(canvas.grid.isHex === false){
                if(game[NAMESPACE].BeaversProximityAction){
                        game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene.uuid);
                }
        }
}

Hooks.once("beavers-gamepad.ready", () => {
        const paUI = new ProximityActionUI();
        game["beavers-gamepad"].TinyUIModuleManager.addModule(paUI.name,paUI);
});

Hooks.once("socketlib.ready", () => {
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].socket = socketlib.registerModule(NAMESPACE);
});

Handlebars.registerHelper("beavers-objectLen", function(json) {
        return Object.keys(json).length;
});