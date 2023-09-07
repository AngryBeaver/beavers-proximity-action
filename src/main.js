import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./BeaversProximityAction.js";
import {SecretDoorActivity} from "./activities/SecretDoorActivity.js";


export const HOOK_READY = NAMESPACE+".ready";

Hooks.on(HOOK_READY,async function(){
        game[NAMESPACE].BeaversProximityAction.addActivityClass(SecretDoorActivity);
});

Hooks.on("ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        Hooks.call(HOOK_READY,game[NAMESPACE].BeaversProximityAction);
        activateScene();
})

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