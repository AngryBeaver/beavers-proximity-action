import {NAMESPACE} from "./Settings.js"

//TODO reset to default Data
//when defaultData in activities changes between versions this will not get updated as it has stored the previeous data.
export function createActivitySettings(activityClass: ActivityClass) {

    return class ActivitySettings extends FormApplication {

        data: ActivityData

        static get defaultOptions(): any {
            const title = activityClass.template.name;
            // @ts-ignore
            return foundry.utils.mergeObject(super.defaultOptions, {
                title: title,
                template: `modules/${NAMESPACE}/templates/activity-setting.hbs`,
                id: "activity-setting",
                width: 700,
                height: 600,
                submitOnChange: false,
                closeOnSubmit: false,
                submitOnClose: true,
                resizable: true,
                classes: ["beavers-proximity-actions", "activity-setting"]
            })
        }

        async getData(options): Promise<any> {
            this.data = (game as Game)[NAMESPACE].Settings.getActivityData(activityClass.id);
            return {
                activity: activityClass.template,
                localizeData: {hash: activityClass.template}
            }
        }

        async close(options?) {
            super.close(options);
            // @ts-ignore
            //SettingsConfig.reloadConfirm({world: true});
        }

        async _updateObject(event, formData) {
            for (const [key, value] of Object.entries(formData)) {
                beaversSystemInterface.objectAttributeSet(this.data, key, value);
            }
            this._updateData();
        }

        async _updateData() {
            await (game as Game)[NAMESPACE].Settings.set("activityClass-" + activityClass.id, this.data);
            this.render();
        }
    }
}