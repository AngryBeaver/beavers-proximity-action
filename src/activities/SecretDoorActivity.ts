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
                "main":SecretDoorAction
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
