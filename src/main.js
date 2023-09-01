import {Settings} from "./Settings.js";
import {BeaversProximityAction} from "./BeaversProximityAction";
import {SecretDoorActionApp} from "./actionApps/SecretDoorActionApp";

export const NAMESPACE = "beavers-proximity-action"
export const HOOK_READY = NAMESPACE+".ready";

Hooks.on("ready", async function(){
        game[NAMESPACE]=game[NAMESPACE]||{};
        game[NAMESPACE].Settings = new Settings();
        game[NAMESPACE].BeaversProximityAction = new BeaversProximityAction();
        Hooks.call(HOOK_READY);
        const actionApp = new SecretDoorActionApp();
        game[NAMESPACE].BeaversProximityAction.registerApp(actionApp);
})

Hooks.on("canvasReady",async function(canvas){
        game[NAMESPACE]=game[NAMESPACE]||{};
        if(!canvas.grid.isHex){
                game[NAMESPACE].BeaversProximityAction.activateScene(canvas.scene);
        }
});