import {NAMESPACE} from "./Settings.js";
import {bpa} from "./types.js";
import {UserInteraction} from "./UserInteraction.js";

/**
 * TODO
 * Will paint a display with your actor and current activities as dropdown
 * needs to be position absolute so we can have multiple instances of that for shared screen.
 * Each user can have one instance it need not be the user of the client.
 * each user instance can be dragged and rotated to position it.
 * the app needs to be very small. in place dropdown ?
 * */
export class BPAUI extends Application {

    _data: {
        userId: string,
        result?: bpa.ProximityResult,
        wheel: number,
        choices: {
            [id:string]:{ text: string }
        },
        resolve?:(any)=>void,
    }


    constructor(userId: string, options: any = {}) {
        super(options);
        this._data = {
            userId: userId,
            wheel: 0,
            choices: {},
        };
        if (this.element.length > 0) {
            this.bringToTop();
        }
        //todo delete this._data.result on scene change or token movement or user.character change
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // @ts-ignore
            //title: game.i18n.localize(`beaversCrafting.crafting-app.title`),
            width: 240,
            height: 60,
            template: `modules/${NAMESPACE}/templates/bpa-ui.hbs`,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: false,
            resizable: false,
            classes: [NAMESPACE, "bpa-ui"],
            popOut: false,
            id: NAMESPACE
        });
    }

    async getData(options = {}) {
        if (this._data.result) {
            this._data.choices = {}
            if (this._data.result.activities) {
                this._data.choices[""]={text: game["i18n"].localize("beaversProximityAction.userInteraction.noActivity")}
            }
            for (const activity of Object.values(this._data.result.activities)) {
                this._data.choices[activity.id] = {text: activity.name};
            }
        }
        return {
            actor: game["users"].get(this._data.userId).character,
            choices: this._data.choices,
        }
    }

    activateListeners(html) {
        html.find(".scan-proximity").on("click", async (e) => {
            const proximityRequest: bpa.ProximityRequest = {
                distance: 5,
                token: UserInteraction.currentToken(this._data.userId),
                type: "cone"
            }
            const result = await game[NAMESPACE].BeaversProximityAction.getBPAEngine().getProximityActivities(proximityRequest);
            var activities = result.activities.reduce(
                (obj, item) => Object.assign(obj, { [item.id]: {text:item.name} }), {});
            const activityId = await this.select(activities);
            if(activityId===undefined || activityId === ""){
                this._reset();
                return;
            }
            const activityRequest: bpa.ActivityRequest = {
                activityId: activityId,
                actorId: result.actorId,
                hitArea: result.hitArea,
            }
            await game[NAMESPACE].beaversProximityAction.getBPAEngine().testActivity(activityRequest,{bpaui:this});
        })
        html.find(".selection").on("wheel", (e) => {
            if (e.originalEvent.deltaY > 0) {
                this._rotateWheel(1, html);
            }
            if (e.originalEvent.deltaY < 0) {
                this._rotateWheel(-1, html);
            }
        });
        html.find("a.up").on("click", (e) => {
            this._rotateWheel(1, html);
        });
        html.find("a.down").on("click", (e) => {
            this._rotateWheel(-1, html);
        });
        html.find(".select").on("click", (e) => {
            const id = $(e.currentTarget).data().key;
            this._choose(id);
        });
    }

    public async select(choices: { [id: string]: { text: string } }):Promise<string> {
        this._data.choices = choices
        const dfd = new Deferred<string>();
        this._data.resolve = dfd.resolve;
        await this._render(true);
        return dfd.promise;
    }

    _choose(id:string) {
        if(this._data.resolve){
            this._data.resolve(id);
        }
    }
    async _reset(){
        this._data.choices = {};
        this._data.wheel = 0;
        delete this._data.result;
        this._render(true);
    }

    _rotateWheel(count: number, html) {
        this._data.wheel += count;
        const length = Object.values(this._data.choices).length;
        this._data.wheel = Math.min(length - 1, Math.max(0, this._data.wheel))
        const top = 7 - this._data.wheel * 21;
        html.find(".wheel").css({top: top});
    }

}

class Deferred<T> {
    promise:Promise<T>;
    reject:()=>void;
    resolve:(value:T)=>void;
    constructor() {
        this.promise = new Promise((resolve, reject)=> {
            this.reject = reject
            this.resolve = resolve
        })
    }
}