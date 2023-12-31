import {NAMESPACE} from "../../Settings.js";
import {BaseWallActivity} from "./BaseWallActivity.js";
import {Action} from "../Action.js";
import {bpa} from "../../bpaTypes.js";
export const ID = NAMESPACE + ".secret-door"
export class SecretDoorActivity extends BaseWallActivity{

    static getId():string{
        return ID;
    }

    static get defaultData():bpa.ActivityData {
        return {
            id:ID,
            name: game["i18n"].localize("beaversProximityAction.secretDoor.name"),
            config:{},
            test:{
                name: game["i18n"].localize("beaversProximityAction.secretDoor.test.name"),
                options: {
                    "prompt": {
                        id: "prompt",
                        type: "prompt",
                        promptDialog: {
                            title: game["i18n"].localize("beaversProximityAction.secretDoor.test.name"),
                            label: game["i18n"].localize("beaversProximityAction.secretDoor.test.prompt")
                        }
                    }
                }
            },
            actionClasses:{
                "main":SecretDoorAction,
                "fallback":FallbackAction
            },
            actions:{
                normal: [
                    {
                        classId: "main",
                        priority: "normal"
                    }
                ],
                fallback: [
                    {
                        classId: "fallback",
                        priority: "normal",
                    }
                ],
            },
            results:[]
        };
    }

}



class SecretDoorAction extends Action{
    /**
     * defaultData for this Action
     */
    static get defaultData():Partial<bpa.ActionStoreData>{
        return {
            location:{
                type:"wall",
                filter:[
                    {attribute:"door",value:2}
                ],
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
