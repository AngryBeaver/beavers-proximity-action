import {TestHandler} from "./TestHandler.js";
import {SquareGrid} from "./SquareGrid.js";

export const PriorityTypeOrder:PriorityType[] = ["normal","fallback"];

export class ActionGridClass implements ActionGrid {

    private grid: Grid = new SquareGrid();
    private activities: {
        [activityId: string]: Activity;
    } = {};
    private actions: {
        [actionId: string]: Action;
    } = {};
    private wallActions: {
        fallback: string[],
        normal: string[],
    } = {fallback: [], normal: []};
    private gridActions: {
        fallback: string[],
        normal: string[],
    } = {fallback: [], normal: []};


    public async executeActivity(activityId: string, request: ProximityRequest, actor: Actor) {
        const actions: { [actionId: string]: ActionData } = {};
        const activity = this.activities[activityId];
        const actionGrid = {};
        for (const gridId of gridIds) {
            const actionId = this.actionGrid[gridId];
            const action = this.actions[actionId];
            if (action.activityId === activityId) {
                if (action.activityResults.length === 0 || action.type !== "once") {
                    if (action.type === "once") {
                        actions[action.id] = action;
                    }
                    let hasActor = false;
                    let hasGrid = false;
                    let hasBoth = false;
                    for (const activityResult of action.activityResults) {
                        if (activityResult.actorId === actor.id) {
                            hasActor = true;
                        }
                        if (activityResult.gridId === gridId) {
                            if (activityResult.actorId === actor.id) {
                                hasBoth = true;
                            }
                            hasGrid = true;
                        }
                    }
                    if ((action.type === "once")
                        || (action.type === "perGrid" && !hasGrid)
                        || (action.type === "perActor" && !hasActor)
                        || (action.type === "all" && !hasBoth)) {
                        actions[action.id] = action;
                        actionGrid[gridId] = actionGrid[gridId] || [];
                        actionGrid[gridId][action.id] = action;
                    }
                }
            }
        }
        const activityResult = new TestHandler(activity.testOptions, actor).test();
        for (const [gridId, actions] of Object.entries(actionGrid)) {
            this.activityResultGrid[activityId][gridId] = activityResult;
        }
        for (const action of Object.values(actions)) {
            this.activities[activityId].test
            //we need the grids the action has been triggered on
            //we need more action Types as of can the action be triggered on multiple grids once each always.
            //activity has the callbackFunction for activityResult
            //action has a callbackFunction with input activityResult.
        }


    }

    getProximity(request: ProximityRequest): VisualActivity[] {
        const result: {
            [activityId: string]: string[]
        } = {};
        const priorityGrid: {
            [gridId: string]: PriorityType
        } = {};
        const actorId = request.token?.actor?.id;
        const origin = request.token.center;
        if (!actorId) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        //get all grid fields.
        const proximityGrids = this.grid.getProximityGrids(request);
        //filter grids that hit walls
        const resultGrids: [gridId: string, wall: Wall | null][] = this._filterGridsThatHitWalls(origin, proximityGrids);
        for (const [gridId, wall] of resultGrids) {
            if (wall != null) {
                //get wallActions available on each wall Grid.
                for(const priority of PriorityTypeOrder) {
                    if(priorityGrid[gridId] !== priority) {
                        for (const actionId of this.wallActions[priority]) {
                            const action = this.actions[actionId];
                            const activityId = action.activityId;
                            if (action.isMatchingWall(wall) && action.isAvailable(gridId, actorId, wall)) {
                                result[activityId] = result[activityId] || [];
                                result[activityId].push(gridId);
                                priorityGrid[gridId] = priority;
                            }
                        }
                    }
                }
            } else {
                //get gridActions available on each wall without Grid.
                for(const priority of PriorityTypeOrder) {
                    if(priorityGrid[gridId] !== priority) {
                        for (const actionId of this.gridActions[priority]) {
                            const action = this.actions[actionId];
                            const activityId = action.activityId;
                            if (action.isMatchingGrid(gridId) && action.isAvailable(gridId, actorId)) {
                                result[activityId] = result[activityId] || [];
                                result[activityId].push(gridId);
                                priorityGrid[gridId] = priority;
                            }
                        }
                    }
                }
            }
        }
        return Object.entries(result).map(([id,gridIds])=>{ return {...this.activities[id],gridIds:gridIds,origin:origin}})
    }

    registerAction(register: RegisterAction): string {
        return "";
    }

    registerActivity(register: RegisterActivity): string {
        return "";
    }

    unregisterAction(id: number): void {
        delete this.activities[id];
    }

    unregisterActivity(activityId: string): void {
    }

    private test(activityId, request: ProximityRequest) {
        const activity = this.activities[activityId];
        const proximityGrids = this.grid.getProximityGrids(request);
        //filter grids that hit walls
        const resultGrids: [gridId: string, wall: Wall | null][] = this._filterGridsThatHitWalls(request.token.center, proximityGrids);
        for (const [gridId, wall] of resultGrids) {
            if (wall != null) {
                //get wallActions available on each wall Grid.
                for (const actionId of this.globalActions.wall) {
                    const action = this.actions[actionId];
                    if (this._isAvailableActivity(gridId, action.activityId, actorId)) {
                        this._addAvailableActivityGridToResult(gridId, action.activityId, result);
                    }

                }
            }
        }

    }



    private _addAvailableActivityGridToResult(gridId: string, activityId: string, result: { [activityId: string]: string[] }) {
        if (!result[activityId]) {
            result[activityId] = []
        }

    }

    //add wallgrids and remove grids behind wallgrids.
    private _filterGridsThatHitWalls(origin: Point, proximityGrids: ProximityGrids): [gridId: string, wall: Wall | null][] {
        const result: [gridId: string, wall: Wall | null][] = [];
        const previousWalls: string[] = [];
        for (const [distance, grids] of proximityGrids) {
            const currentWalls: string[] = [];
            for (const gridId of grids) {
                const wall = this._getCollisionWall(origin, gridId);
                if (wall == null) {
                    result.push([gridId, null]);
                } else {
                    //remove wallGrids that had been detected in a closer distance
                    if (wall.id in previousWalls) {
                        currentWalls.push(wall.id);
                        result.push([gridId, wall]);
                    }
                }
            }
            previousWalls.push(...currentWalls);
        }
        return result;
    }

    private _getCollisionWall(origin: Point, gridId: string): Wall | null {
        const destination = this.grid.centerOfGridId(gridId);
        const result = CONFIG.Canvas["losBackend"].testCollision(origin, destination, {type: "move", mode: "closest"});
        return result?.edges?.values()?.next()?.value?.wall;
    }

}