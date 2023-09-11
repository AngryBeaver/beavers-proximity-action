import {ActivityStore} from "./ActivityStore.js";
import {ProximitySquareGrid} from "../ProximitySquareGrid.js";
import {Activity} from "./Activity.js";
import {bpa} from "../types.js";

export class BPAEngine {
    private readonly _sceneId:string;
    public readonly activityStore: ActivityStore;
    public readonly grid: bpa.Grid;
    private _activities: {
        [activityId:string]:Activity
    } = {};

    constructor(scene: Scene) {
        this.activityStore = new ActivityStore(scene);
        if (scene["grid"].type === 1) {
            this.grid = new ProximitySquareGrid()
        }
        this._sceneId = scene.uuid;
    }

    /**
     * bpa can enable activities
     * settings can enable activities
     * scene config can enable activities
     */
    public addActivity(activityClass: bpa.ActivityClass) {
        if(this._activities[activityClass.defaultData.id]){
            this._activities[activityClass.defaultData.id].destruct();
        }
        this._activities[activityClass.defaultData.id] = new activityClass(this,this._sceneId);
    }

    /**
     * users can get Activities around a token
     * tokens have a center and a rotation
     */
    public getProximityActivities(request: bpa.ProximityRequest): bpa.ProximityResult {
        const grids: Point[] = this.grid.getProximityGrids(request);
        const hitArea: bpa.HitArea = this._filterGridsBehindWalls(request.token.center, grids);
        const actorId = request.token.actor?.uuid;
        if(!actorId){
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        const result: bpa.ProximityResult = {
            origin: request.token.center,
            actorId: actorId,
            activities: [],
            hitArea: hitArea
        }
        for (const activity of Object.values(this._activities)) {
            if (activity.isAvailable(actorId, hitArea)) {
                result.activities.push({
                    id: activity.id,
                    name: activity.name,
                })
            }
        }
        return result;
    }

    /**
     * users can execute an activity within proximity range.
     */
    public async executeActivity(request: bpa.ActivityRequest) {
        const activity: Activity = this._activities[request.activityId];
        await activity.execute(request.actorId, request.hitArea);
    }

    /**
     * add wallIds and remove grids behind walls
     */
    private _filterGridsBehindWalls(origin: Point, grids: Point[]): bpa.HitArea {
        const hitArea: bpa.HitArea = {
            gridIds: [],
            wallIds: []
        }
        if (canvas?.grid?.grid) {
            for (const point of grids) {
                //!"§&(/)=$ again who defines first row then col a.k.a y,x why not x,y !!!! and ofc it had been other way around at least typescript claims that is had been x,y !!!
                const pixel = canvas.grid.grid.getPixelsFromGridPosition(point.y,point.x);
                const center = canvas.grid.grid.getCenter(pixel[1], pixel[0]);
                const wall = this._getCollisionWall(origin, center);
                if (!wall) {
                    hitArea.gridIds.push(this.grid.getGridId(point));
                } else {
                    if (!hitArea.wallIds.includes(wall.id)) {
                        hitArea.wallIds.push(wall.id);
                    }
                }
            }

        }
        return hitArea;
    }

    private _getCollisionWall(origin: Point, destination: PointArray): Wall | undefined {
        const result = CONFIG.Canvas["losBackend"].testCollision(origin, {x:destination[1],y:destination[0]}, {type: "move", mode: "closest"});
        let wall = undefined;
        let lastDistance:number|undefined = undefined;
        //when hitting multiple walls in the same distance e.g. on an edge get the wall that is closest to origin.
        for(const pEdge of result?.edges?.values() || []){
            const centerX = (pEdge.A.x+pEdge.B.x)/2;
            const centerY = (pEdge.A.y+pEdge.B.y)/2;
            const squareDistance = Math.pow((centerX-origin.x),2)+Math.pow((centerY-origin.y),2);
            if(lastDistance == undefined || lastDistance>squareDistance){
                wall = pEdge.wall;
                lastDistance = squareDistance;
            }
        }
        return wall;
    }


}