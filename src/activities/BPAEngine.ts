import {ActivityStore} from "./ActivityStore.js";
import {ProximitySquareGrid} from "../ProximitySquareGrid.js";
import {Activity} from "./Activity.js";

export class BPAEngine {
    public readonly activityStore:ActivityStore;
    public readonly grid:ProximityGrid;
    private activities:Activity[];

    constructor(scene:Scene){
        this.activityStore = new ActivityStore(scene);
        if(scene["grid"].type === 1) {
            this.grid = new ProximitySquareGrid()
        }
    }

    /**
     * bpa can enable activities
     * settings can enable activities
     * scene config can enable activities
     */
    public enableActivity(activity:Activity) {
        //TODO activate configurations
        this.activities.push(activity);
    }

    public getProximityActivities(){
        //TODO get activities available to you
    }

    public executeProximityActivity(){
        //TODO
    }



}