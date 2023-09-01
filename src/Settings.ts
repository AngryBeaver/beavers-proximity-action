export const NAMESPACE = "beavers-proximity-action"

export class Settings {


    constructor() {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }

    }

    private get(key) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.get(NAMESPACE, key);

    };

    private set(key, value):Promise<any> {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.set(NAMESPACE, key, value);
    }


}
