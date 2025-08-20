import { createActivitySettings } from "./ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action";

export class Settings implements SettingsI {

  constructor() {
    if (!(game instanceof Game)) {
      throw new Error("Settings called before game has been initialized");
    }
    /*game.keybindings?.register(NAMESPACE, 'current Token', {
        name: 'beaversProximityAction.keybinding.name',
        editable: [{key: 'KeyH', modifiers: ['Shift']}],
        onDown: () => {
            game[NAMESPACE].UserInteraction.request();
        }
    });*/
  }

  //registerGlobalSettings for an Action
  public addActivity(activityClass: ActivityClass) {
    var configLabel = (game as ReadyGame).i18n?.localize("beaversProximityAction.activitySettings.configuration");

    (game as ReadyGame).settings.register(NAMESPACE, "activityClass-" + activityClass.id, {
      name: activityClass.template.name,
      scope: "world",
      config: false,
      default: activityClass.defaultData,
      // @ts-ignore
      type: Object,
    });


    (game as ReadyGame).settings.registerMenu(NAMESPACE, "activityClass-" + activityClass.id + "-button", {
      name: activityClass.template.name,
      label: configLabel,
      // @ts-ignore
      type: createActivitySettings(activityClass),
      restricted: true,
    });
  }

  public setActivityData(activityId: string, activityData: ActivityData): Promise<any> {
    return this.set("activityClass-" + activityId, activityData);
  }

  public getActivityData(activityId: string): ActivityData {
    const activityData = (this.get("activityClass-" + activityId) as ActivityData);
    return foundry.utils.deepClone(activityData);
  }

  public get(key: string) {
    return game.settings.get(NAMESPACE, key);

  };

  public set(key: string, value): Promise<any> {
    return game.settings.set(NAMESPACE, key, value);
  }


}
