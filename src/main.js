import {NAMESPACE, Settings} from "./Settings.js";
import {BeaversProximityAction} from "./BeaversProximityAction.js";
import {SecretDoorActionApp} from "./actionApps/SecretDoorActionApp.js";


export const HOOK_READY = NAMESPACE+".ready";

Hooks.on("ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        Hooks.call(HOOK_READY,game[NAMESPACE].BeaversProximityAction);
        const actionApp = new SecretDoorActionApp();
        game[NAMESPACE].BeaversProximityAction.registerApp(actionApp);
        game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene.uuid);
})

Hooks.on("canvasReady",async function(canvas){
        game[NAMESPACE]=game[NAMESPACE]||{};
        if(!canvas.grid.isHex){
                if(game[NAMESPACE].BeaversProximityAction){
                        game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene.uuid);
                }
        }
});