import {Settings} from "./Settings.js";
import {ActivityResultStore} from "./ActivityResultStore";
import {ActivityResultStoreClass} from "./ActivityResultStoreClass";



export const NAMESPACE = "beavers-proximity-action"
export const HOOK_READY = NAMESPACE+".ready";

Hooks.on("ready", async function(){
        if(!game[NAMESPACE]){
            game[NAMESPACE]={};
        }
        game[NAMESPACE].Settings = new Settings();
        game[NAMESPACE].ActivityResultStore = new ActivityResultStoreClass();
        Hooks.call(HOOK_READY);
})