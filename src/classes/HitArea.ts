import {bpa} from "../bpaTypes.js";
import {ClockwiseSweepShape} from "../canvas/ClockwiseSweepShape.js";
import {TileCollision} from "../canvas/TileCollision";

export class HitArea implements bpa.HitArea {
    tileIds: string[];
    wallIds: string[];
    polygon: number[];

    static from(proximityRequest:bpa.ProximityRequest){
        const hitArea = new HitArea;
        const cwss = ClockwiseSweepShape.from(proximityRequest);
        if(cwss){
            hitArea.polygon = cwss.points;
            hitArea.wallIds = cwss.resultWalls.map(w=>w.id);
            hitArea.tileIds = TileCollision.getCollision(cwss.points);
        }
        return hitArea;
    }

    serialize():bpa.HitArea {
        return {tileIds:this.tileIds,wallIds:this.wallIds,polygon:this.polygon}
    }
}