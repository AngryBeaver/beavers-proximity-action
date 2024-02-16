import {NAMESPACE} from "../Settings.js";
import {Utils} from "../new/Utils.js";

export class BeaversActivityTestConfig extends HTMLElement {

    activity: Activity
    data: ActivityData
    entityConfig: {
        [property:string]:any
    } & Partial<Test> = {};
    isEntityConfig: boolean = false;

    constructor() {
        super();
        const activityId = this.getAttribute("activityId") || "";
        const entityActivityId = this.getAttribute("entityActivityId");
        if(entityActivityId){
            this.isEntityConfig = true;
            this.entityConfig = Utils.getEntityConfigBy(entityActivityId).data;
        }
        this.activity = (game as Game)[NAMESPACE].BeaversProximityAction.getActivity(activityId);
        if(this.activity) {
            this.data = (game as Game)[NAMESPACE].Settings.getActivityData(this.activity.id);
            void this.render();
        }
    }


    async render(){
        const content = await renderTemplate('modules/beavers-proximity-action/templates/activity-test-config.hbs',
            {
                isEntityConfig:this.isEntityConfig,
                ...(game as Game)[NAMESPACE].Settings.getActivitySettingData(this.activity),
                ...(this.data),
                ...(this.entityConfig)
            }
        );
        $(this).html(content);
        this.activateListeners($(this));
    }

    async updateData() {
        void this.render();
    }

    activateListeners(content) {
        content.find('select[name="test.type"]').on("input", (e) => {
            const selection = $(e.currentTarget).val();
            if(selection === "none"){
                this.data.test = {
                    type: "none"
                }
            }
            if(selection === "skill" || selection === "ability"){
                this.data.test = {
                    type: selection,
                    inputField: {
                        label: "",
                        type: "number",
                    },
                    acceptedResponse:8
                };
            }
            if(selection === "input"){
                this.data.test = {
                    type: selection,
                    inputField: {
                        label: "",
                        type: "text",
                    },
                    acceptedResponse:""
                };
            }
            if (selection === "gm") {
                this.data.test = {
                    type: "gm",
                    inputField: {
                        label: "",
                        type: "boolean",
                    },
                };
            }
            this.updateData();
        });
        content.find('select[name="test.inputField.type"]').on("input", (e) => {
            const type = $(e.currentTarget).val();
            if(this.data.test.type === "input") {
                if(type === "text" || type === "area" || type === "number" || type === "boolean"){
                    this.data.test.inputField = {
                        label: "",
                        note: "",
                        type: type
                    }
                }
                if(type === "selection"){
                    this.data.test.inputField = {
                        choices: {},
                        label: "",
                        note: "",
                        type: type
                    }
                }
            }
            this.updateData();
        });
        content.find('button[name="addChoice"]').on("click", (e) => {
            const keyName = $(e.currentTarget).parents("div.form-group").find("input").val() as string;
            if(keyName && this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                this.data.test.inputField.choices = this.data.test.inputField.choices || {};
                this.data.test.inputField.choices[keyName] = {text: keyName, img: ""}
            }
            this.updateData();
        });
        content.find('button[name="removeChoice"]').on("click", (e) => {
            const key = $(e.currentTarget).parents("div.form-group").data("key");
            if(this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                delete this.data.test.inputField.choices[key]
            }
            this.updateData();
        });
    }

}