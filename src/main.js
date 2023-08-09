import {BeaversGamepadManager} from "./apps/BeaversGamepadManager.js";
import {Settings} from "./Settings.js";
import {GamepadModuleManager} from "./apps/GamepadModuleManager.js";


export const NAMESPACE = "beavers-proximity-action"
export const HOOK_READY = NAMESPACE+".ready";

Hooks.on("ready", async function(){
        if(!game[NAMESPACE]){
            game[NAMESPACE]={};
        }
        game[NAMESPACE].Settings = new Settings();
        Hooks.call(HOOK_READY);
})