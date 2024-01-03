
import {bp} from "./types.js";
import {NAMESPACE} from "../Settings.js";
import {ConfigurationDefinition} from "./types";
export const ID = NAMESPACE + ".investigate.js"


/* class decorator */
function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}
@staticImplements<bp.Action<TileDocument>>()
export class InvestigateAction implements bp.EntityAction<TileDocument>{

    config: any;
    entity: TileDocument;

    constructor(entity: TileDocument, config:any){
        this.entity = entity;
        this.config = config;
    }

    fail(): void {
    }

    success(): void {
    }


    static get id():string{
        return ID;
    }
    static get data():bp.ActionData {
        return {
            id:ID,
            name: game["i18n"].localize("beaversProximityAction.activity.investigate.name"),
            configurationDefinition:{
                "secretInfo":{
                    type:"area",
                    label: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.label"),
                    defaultValue: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.defaultValue"),
                    note: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.note"),
                }
            },
            allowSubOptions:false,
            defaultTest:{
                type: "prompt",
                name: "",
                inputField: {
                    type:"area",
                    label: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.label"),
                    defaultValue: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.defaultValue"),
                    note: game["i18n"].localize("beaversProximityAction.activity.investigate.secretInfo.note"),
                }
            },
            fallback:(user:User)=>{
                userOutput
            }
        };
    }





}



class InvestigateActions extends Action{
    /**
     * defaultData for this Action
     */
    static get defaultData():Partial<bpa.ActionStoreData>{
        return {
            location:{
                type:"tile",
                filter:[],
                isGlobal:false
            },
            available:{
                type:"always",
            },
            priority: "normal"
        }
    }

    async execute(result: bpa.ActivityResult):Promise<boolean>{
        let anySuccess = false;
        for(const wallId of result.hitArea.wallIds) {
            const wall = this._getWall(wallId);
            if (wall) {
                const value = getProperty(wall,`flags.${this.parentId}`)[result.testResult.testId];
                if(this._parent.validateTest(result.testResult,value)){
                    //TODO chat message
                    await this.success(wall);
                    anySuccess = true;
                }
            }
        }
        if(!anySuccess){
            this.failure();
        }
        return false;
    }

    private async success(wall:WallDocument){
        return wall.update({door: 1});
    }

    private failure(){
        //TODO chat message
        ui.notifications?.info(game["i18n"].localize("beaversProximityAction.secretDoor.fallbackMessage"));
    }

}

class FallbackAction extends Action{
    /**
     * defaultData for this Action
     */
    static get defaultData():Partial<bpa.ActionStoreData>{
        return {
            location:{
                type:"wall",
                filter:[],
                isGlobal:true
            },
            available:{
                type:"always",
            },
            priority: "normal"
        }
    }

    async execute(result: bpa.ActivityResult):Promise<boolean>{
        this.failure();
        return false;
    }

    private failure(){
        //TODO chat message
        ui.notifications?.info(game["i18n"].localize("beaversProximityAction.secretDoor.fallbackMessage"));
    }
}
