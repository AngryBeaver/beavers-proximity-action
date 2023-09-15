import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./BeaversProximityAction.js";
import {SecretDoorActivity} from "./activities/SecretDoorActivity.js";
import {UserInteraction} from "./UserInteraction.js";
import {TestHandler} from "./TestHandler.js";


export const HOOK_READY = NAMESPACE+".ready";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";

Hooks.on("beavers-system-interface.init", async function(){
        beaversSystemInterface.addModule(NAMESPACE);
});

Hooks.once('init', () => {
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
})

Hooks.once("beavers-system-interface.ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        game[NAMESPACE].UserInteraction = new UserInteraction(game[NAMESPACE].BeaversProximityAction);
        game[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, game[NAMESPACE].BeaversProximityAction.executeActivity.bind(game[NAMESPACE].BeaversProximityAction));
        game[NAMESPACE].socket.register("test", TestHandler.test);
        Hooks.call(HOOK_READY,game[NAMESPACE].BeaversProximityAction);
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

Hooks.once("socketlib.ready", () => {
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].socket = socketlib.registerModule(NAMESPACE);
});