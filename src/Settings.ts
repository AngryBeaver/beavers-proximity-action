import {createActivitySettings} from "./new/ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action"

export class Settings {

    constructor() {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        game.keybindings.register(NAMESPACE, 'current Token', {
            name: 'beaversProximityAction.keybinding.name',
            editable: [{key: 'KeyH', modifiers: ['Shift']}],
            onDown: () => {
                game[NAMESPACE].UserInteraction.request();
            }
        });
    }

    //registerGlobalSettings for an Action
    public addActivity(activity: Activity) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }

        game.settings.register(NAMESPACE, "activity-"+activity.id, {
            name: activity.template.name,
            scope: "world",
            config: false,
            default: activity.defaultData,
            type: Object
        });

        game.settings.registerMenu(NAMESPACE, "activity-"+activity.id + "-button", {
            name: activity.template.name,
            label: activity.template.name,
            // @ts-ignore
            type: createActivitySettings(activity),
            restricted: true
        });
    }

    public getActivityData(activityId:string):ActivityData | null{
        try{
            return (this.get("activity-"+activityId) as ActivityData);
        }catch(e){
            return null
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
