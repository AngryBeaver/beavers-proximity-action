import {ClockwiseSweepShape} from "./ClockwiseSweepShape.js";
import {TileCollision} from "./TileCollision.js";

export class HitArea implements HitAreaData {
    tileIds: string[];
    wallIds: string[];
    polygon: number[];

    static create(hitArea: HitAreaData){
        const result = new HitArea();
        hitArea.tileIds = hitArea.tileIds;
        hitArea.wallIds = hitArea.wallIds;
        hitArea.polygon = hitArea.polygon;
        return result;
    }

    static from(token:Token,proximityRequest:ProximityRequest){
        const hitArea = new HitArea();
        const cwss = ClockwiseSweepShape.from(token,proximityRequest.distance,proximityRequest.type);
        if(cwss){
            hitArea.polygon = cwss.points;
            hitArea.wallIds = cwss.resultWalls.map(w=>w.id);
            hitArea.tileIds = TileCollision.getCollision(cwss.points);
        }
        return hitArea;
    }

    serialize():HitAreaData {
        return {tileIds:[...this.tileIds],wallIds:[...this.wallIds],polygon:[...this.polygon]}
    }

    isEmpty(): boolean {
        for (const tileId of this.tileIds) {
            return false;
        }
        for (const wallId of this.wallIds) {
            return false;
        }
        return true;
    }

}