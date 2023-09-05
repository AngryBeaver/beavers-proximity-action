import {ActivityStore} from "./ActivityStore.js";
import {ProximitySquareGrid} from "../ProximitySquareGrid.js";
import {Activity, bpa} from "./Activity.js";
import {ActivityGrids, activityGrids} from "./Activity";

export class BPAEngine {
    public readonly activityStore:ActivityStore;
    public readonly grid:ProximityGrid;
    private _activities:Activity[];

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
        this._activities.push(activity);
    }

    /**
     * users can get Activities around them
     */
    public getProximityActivities(request:bpa.ProximityRequest): bpa.ProximityResult{
        const result: bpa.ProximityResult = {
            origin:request.origin,
            actorId: request.actorId,
            activities:[]
        }
        //TODO fix used to be token now point what is better.
        const proximityGrids = this.grid.getProximityGrids(request);
        const activityGrids: bpa.ActivityGrid[] = this._filterGridsThatHitWalls(request.origin, proximityGrids);

        for(const activity of this._activities){
            //TODO fix this.
            if(activity.isAvailable(request.actorId,activityGrids)){
                result.activities.push({
                    id: activity.id,
                    name:activity.name,
                })
            }
        }
        return result;
    }

    /**
     * users can execute an activity within proximity range.
     */
    public executeProximityActivity(){
        //TODO
    }

    //add wallgrids and remove grids behind wallgrids.
    private _filterGridsThatHitWalls(origin: Point, proximityGrids: ProximityGrids): bpa.ActivityGrid[] {
        const result: [gridId: string, wall?: Wall][] = [];
        const previousWalls: string[] = [];
        for (const [distance, grids] of proximityGrids) {
            const currentWalls: string[] = [];
            for (const gridId of grids) {
                const wall = this._getCollisionWall(origin, gridId);
                if (!wall) {
                    result.push([gridId]);
                } else {
                    //remove wallGrids that had been detected in a closer distance
                    if (!previousWalls.includes(wall.id)) {
                        currentWalls.push(wall.id);
                        result.push([gridId, wall]);
                    }
                }
            }
            previousWalls.push(...currentWalls);
        }
        return result;
    }

    private _getCollisionWall(origin: Point, gridId: string): Wall | undefined {
        const destination = this.grid.centerOfGridId(gridId);
        const result = CONFIG.Canvas["losBackend"].testCollision(origin, destination, {type: "move", mode: "closest"});
        return result?.edges?.values()?.next()?.value?.wall;
    }


}