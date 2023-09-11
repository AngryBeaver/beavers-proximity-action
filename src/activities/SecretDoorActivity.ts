import {NAMESPACE} from "../Settings.js";
import {WallActivity} from "./WallActivity.js";
import {Action} from "./Action.js";
import {bpa} from "../types.js";
export const ID = NAMESPACE + ".secret-door"
const CONFIGURATION_ID = "search-dc";

export class SecretDoorActivity extends WallActivity{

    static getId():string{
        return ID;
    }

    static get defaultData():bpa.ActivityData {
        return {
            id:NAMESPACE + ".secret-door",
            name: game["i18n"].localize("beaversProximityAction.secretDoor.name"),
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
            },
            actions:{
                normal: [
                    {
                        classId: "main",
                        priority: "normal"
                    }
                ],
                fallback: [],
            },
            configurations: {
                "search-id":{
                    inputData: {
                        label: "search dc",
                        type: "number",
                    },
                    defaultValue: 20
                }
            },
            results:[]
        };
    }

}



class SecretDoorAction extends Action{
    /**
     * defaultData for this Action
     */
    static get defaultData(){
        return {
            location:{
                type:"wall",
                gridIds:[],
                wallFilter:[
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
            const wall = canvas?.scene?.walls.get(wallId);
            if (wall) {
                const dc:number = wall["flags"][this.parentId]?.[CONFIGURATION_ID]
                    || this._parent.getConfigValue(CONFIGURATION_ID);
                if (result.testResult.isSuccess || (result.testResult.number && dc >= result.testResult.number)) {
                    this.success(wall);
                    anySuccess = true;
                }
            }
        }
        if(!anySuccess){
            this.failure();
        }
        return true;
    }

    private async success(wall:WallDocument){
        return wall.update({door: 1});
    }

    private failure(){
        ui.notifications?.info(game["i18n"].localize("beaversProximityAction.secretDoor.fallbackMessage"));
    }

}
