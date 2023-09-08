import {bpa} from "./types.js";
import {ActivitySettings} from "./ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action"

export class Settings {


    constructor() {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }

    }

    private addActivity(activityClass: bpa.ActivityClass) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        game.settings.register(NAMESPACE, activityClass.defaultData.id, {
            name: activityClass.defaultData.name,
            scope: "world",
            config: false,
            default: {},
            type: Object
        });

        game.settings.registerMenu(NAMESPACE, activityClass.defaultData.id + "-button", {
            name: activityClass.defaultData.name,
            label: activityClass.defaultData.name,
            // @ts-ignore
            type: ActivitySettings.build(activityClass),
            restricted: true
        });
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
