import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./BeaversProximityAction.js";


export const HOOK_READY = NAMESPACE+".ready";

Hooks.on("ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        Hooks.call(HOOK_READY,game[NAMESPACE].BeaversProximityAction);
        if(canvas?.grid.isHex === false) {
                game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene.uuid);
        }
        //TODO register SecretDoorAction
        //TODO activate after scene is activated ?
})

Hooks.on("canvasReady",async function(canvas){
        game[NAMESPACE]=game[NAMESPACE]||{};
        if(canvas.grid.isHex === false){
                if(game[NAMESPACE].BeaversProximityAction){
                        game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene.uuid);
                }
        }
});