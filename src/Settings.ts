import {bpa} from "./types.js";
import {ActivitySettings} from "./ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action"

export class Settings {


    constructor() {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        game.keybindings.register(NAMESPACE, 'current Token', {
            name: 'beaversProximityAction.keybinding.name',
            editable: [{key: 'KeyF', modifiers: ['Shift']}],
            onDown: () => {
                game[NAMESPACE].UserInteraction.request();
            }
        });
    }

    private addActivity(activityClass: bpa.ActivityClass) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        const blankSettings:bpa.ActivitySettings = {
            enabled: false,
            test: {options: {}}
        };
        const mergedData = foundry.utils.mergeObject(blankSettings,activityClass.defaultData,{
            insertKeys: false,
            insertValues: true,
            overwrite: true,
            inplace: false
        });
        game.settings.register(NAMESPACE, "activity-"+activityClass.defaultData.id, {
            name: activityClass.defaultData.name,
            scope: "world",
            config: false,
            default: mergedData,
            type: Object

        });
        game.settings.registerMenu(NAMESPACE, "activity-"+activityClass.defaultData.id + "-button", {
            name: activityClass.defaultData.name,
            label: activityClass.defaultData.name,
            // @ts-ignore
            type: ActivitySettings.build(activityClass),
            restricted: true
        });
    }

    public getActivitySetting(activityId){
        try{
            return this.get("activity-"+activityId);
        }catch(e){
            return {}
        }
    }

    private get(key) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.get(NAMESPACE, key);

    };

    private set(key, value): Promise<any> {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.set(NAMESPACE, key, value);
    }


}
