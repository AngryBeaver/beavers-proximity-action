import {CollisionDetection} from "../classes/CollisionDetection.js";

export class TileCollision {

    static getCollision(points:number[]){
        const result:string[] = [];
        const polygon = CollisionDetection.polyPointsToPolygon(points)
        canvas?.scene?.tiles.forEach(tileDocument=>{
            const polygon2 = CollisionDetection.boundsToPolygon(tileDocument as Bounds);
            if(tileDocument.id && CollisionDetection.polygonIntersection(polygon,polygon2)){
                result.push(tileDocument.id);
            }
        });
        return result;
    }

}