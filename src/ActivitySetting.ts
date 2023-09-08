import {NAMESPACE} from "./Settings.js";
import {bpa} from "./types.js";

export class ActivitySettings {

    static build(activityClass:bpa.ActivityClass) {
        return class ActivitySetting extends FormApplication {

            static get defaultOptions(): any {
                // @ts-ignore
                const title = activityClass.defaultData.name;
                return mergeObject(super.defaultOptions, {
                    title: title,
                    template: `modules/${NAMESPACE}/templates/activity-setting.hbs`,
                    id: "activity-setting",
                    width: 300,
                    height: 600,
                    closeOnSubmit: true,
                    resizable: true,
                    classes: ["beavers-proximity-actions", "activity-setting"]


                })
            }

            async _updateObject(event, formData) {
                //TODO
            }
        }
    }
}