import {createActivitySettings} from "./new/ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action"

export class Settings implements SettingsI {

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
            label: game["i18n"].localize("beaversProximityAction.activitySettings.configuration"),
            // @ts-ignore
            type: createActivitySettings(activity),
            restricted: true
        });
    }

    public getActivityData(activityId:string):ActivityData {
        const activityData = (this.get("activity-"+activityId) as ActivityData);
        return foundry.utils.deepClone(activityData);
    }

    public getActivitySettingData(activity:Activity){
        const skillChoices = {};
        beaversSystemInterface.configSkills.forEach((v)=>{
            skillChoices[v.id]={text:v.label}
        });
        const abilityChoices = {};
        if(beaversSystemInterface.configCanRollAbility) {
            beaversSystemInterface.configAbilities.forEach((v) => {
                abilityChoices[v.id] = {text: v.label}
            })
        }
        const typeChoices = {}
        typeChoices["none"] = {text: (game as Game).i18n.localize("beaversProximityAction.activitySettings.none.label")};
        typeChoices["skill"] = {text: (game as Game).i18n.localize("beaversProximityAction.activitySettings.skill.label")};
        if(beaversSystemInterface.configCanRollAbility) {
            typeChoices["ability"] = {text: (game as Game).i18n.localize("beaversProximityAction.activitySettings.ability.label")};
        }
        typeChoices["input"] = {text: (game as Game).i18n.localize("beaversProximityAction.activitySettings.input.label")};
        typeChoices["gm"] = {text: (game as Game).i18n.localize("beaversProximityAction.activitySettings.gm.label")};
        const inputTypes = {
            "area":{text:"area"},
            "boolean":{text:"boolean"},
            "number":{text:"number"},
            "selection":{text:"selection"},
            "text":{text:"text"},
        }
        return {
            types: typeChoices,
            skills: skillChoices,
            abilities: abilityChoices,
            inputTypes: inputTypes,
            canRollAbility: beaversSystemInterface.configCanRollAbility,
            activity: activity.template,
            localizeData: {hash: activity.template}
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
