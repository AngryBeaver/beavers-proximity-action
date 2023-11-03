import {ActivityStore} from "./ActivityStore.js";
import {ProximitySquareGrid} from "../app/ProximitySquareGrid.js";
import {Activity} from "./Activity.js";
import {bpa} from "../types.js";
import {NAMESPACE} from "../Settings.js";
import {SOCKET_EXECUTE_ACTIVITY} from "../main.js";

export class BPAEngine {
    public readonly _scene:Scene;
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
        this._scene = scene;
    }

    /**
     * bpa can enable activities
     * settings can enable activities
     * scene config can enable activities
     */
    public addActivity(activityClass: bpa.ActivityClass) {
        if(this._activities[activityClass.defaultData.id]){
            this._activities[activityClass.defaultData.id].disableHooks();
        }
        this._activities[activityClass.defaultData.id] = new activityClass(this,this._scene.uuid);
        if(this._scene.uuid === game[NAMESPACE].BeaversProximityAction.currentSceneId){
            this.enableHooks();
        }
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
    public async testActivity(request: bpa.ActivityRequest, options?: any) {
        const activity: Activity = this._activities[request.activityId];
        const testResult: bpa.TestResult|null = await activity.test(request.actorId, request.hitArea, options);
        if(testResult!= null){
            const activityResult: bpa.ActivityResult = {
                testResult: testResult,
                hitArea: request.hitArea,
                actorId: request.actorId
            }
            await game[NAMESPACE].socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY,this._scene.uuid,request.activityId,activityResult);
        }
    }
    /**
     * this should always be executed on gm client
     * @param testResult
     * @param hitArea
     * @param actorId
     */
    public async executeActivity(activityId:string,activityResult:bpa.ActivityResult){
        const activity: Activity = this._activities[activityId];
        await activity.executeActions(activityResult);
        //store global proximityHitArea not individual ActionHitAreas
        //todo update all clients activity data
        await this.activityStore.addResult(activityId, activityResult);
    }

    /**
     * this is called with every scene change so only hooks of actual scene are active
     */
    public disableHooks(){
        for(const activity of Object.values(this._activities)){
            activity.disableHooks();
        }
    }

    /**
     * this is called with every scene change so only hooks of actual scene are active
     */
    public enableHooks(){
        for(const activity of Object.values(this._activities)){
            activity.enableHooks();
        }
    }

    /**
     * add wallIds and remove grids behind walls
     * can only be executed on current scene e.g on userClient.
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