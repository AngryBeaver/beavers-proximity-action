export class CollisionDetection {

    static doBoundsCollide(bounds1, bounds2):boolean{
        return !(
            bounds1.x+bounds1.width < bounds2.x ||
            bounds1.y+bounds1.height < bounds2.y ||
            bounds1.x > bounds2.x+bounds2.width ||
            bounds1.y > bounds2.y+bounds2.height
        );
    }

    static polygonIntersection(polygon1:Polygon, polygon2:Polygon): boolean{
        //fastCheck
        if(!CollisionDetection.doBoundsCollide(polygon1.bounds,polygon2.bounds)) return false;
        //intersectionCheck
        for (let i = 0; i < polygon1.edges.length; i++) {
            const edge1 = polygon1.edges[i];
            for (let j = 0; j < polygon2.edges.length; j++) {
                const edge2 = polygon2.edges[j];
                if (CollisionDetection.edgeIntersection(edge1,edge2,true)) {
                    return true;
                }
            }
        }
        //completelyWithin
        if(CollisionDetection.isPolygonInsidePolygon(polygon1,polygon2) ||
            CollisionDetection.isPolygonInsidePolygon(polygon2,polygon1)) return true;
        return false
    }

    static polyPointsToPolygon(points:number[]):Polygon{
        const edges: Edge[] = [];
        let x:number = points[0];
        let y:number = points[0];
        let maxX:number = points[1];
        let maxY:number = points[1];
        for(let i = 0; i < points.length-1; i=i+2){
            let next = i+2;
            if(next > points.length) next = 0;
            if(!x || points[i]<x){
                x = points[i];
            }
            if(!maxX || points[i]>x){
                maxX = points[i];
            }
            if(!y || points[i+1]<y){
                y = points[i+1];
            }
            if(!maxY || points[i+1]>x){
                maxY = points[i+1];
            }
            edges.push({
                p1: {x:points[i],y:points[i+1]},
                p2: {x:points[next],y:points[next+1]}
            });
        }
        return {edges:edges,bounds:{x:x,y:y,width:maxX-x,height:maxY-y}};
    }

    static boundsToPolygon(bounds:Bounds):Polygon {
        const edges: Edge[] = [];
        edges.push({
            p1: {x: bounds.x, y: bounds.y},
            p2: {x: bounds.x, y: bounds.y + bounds.height},
        });
        edges.push({
            p1: {x: bounds.x, y: bounds.y + bounds.height},
            p2: {x: bounds.x + bounds.width, y: bounds.y + bounds.height}
        });
        edges.push({
            p1: {x: bounds.x + bounds.width, y: bounds.y + bounds.height},
            p2: {x: bounds.x + bounds.width, y: bounds.y}
        });
        edges.push({
            p1: {x: bounds.x + bounds.width, y: bounds.y},
            p2: {x: bounds.x, y: bounds.y},
        });
        return {edges:edges,bounds:bounds};
    }

    static edgeIntersection(edge1:Edge,edge2:Edge,asSegment=true):Point|null{
        const a = edge2.p1;
        const b = edge2.p2;
        const e = edge1.p1;
        const f = edge1.p2;

        const a1 = b.y - a.y;
        const a2 = f.y - e.y;
        const b1 = a.x - b.x;
        const b2 = e.x - f.x;
        const c1 = (b.x * a.y) - (a.x * b.y);
        const c2 = (f.x * e.y) - (e.x * f.y);
        const denom = (a1 * b2) - (a2 * b1);

        if (denom === 0) {
            return null;
        }
        const point = {
            x:((b1 * c2) - (b2 * c1)) / denom,
            y:((a2 * c1) - (a1 * c2)) / denom
        };

        if (asSegment) {
            const uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y));
            const ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc;
            const ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;

            if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                return point;
            } else {
                return null;
            }
        }

        return point;
    }
    static isPointInside(edges:Edge[],point:Point) {
        //inside when the pointRay hits an odd time edges.
        let inside = false;
        var pointEdge:Edge = {
            p1: point,
            p2: {x: point.x, y: point.y - 10}
        };
        for (let i = 0; i < edges.length; i++) {
            const collisionPoint = CollisionDetection.edgeIntersection(edges[i],pointEdge,false);
            if( collisionPoint && collisionPoint.y <= point.y && collisionPoint.x >= Math.min(edges[i].p1.x,edges[i].p2.x) &&
                collisionPoint.x <= Math.max(edges[i].p1.x,edges[i].p2.x)){
                inside = !inside;
            }
        }
        return inside;
    }

    static isPolygonInsidePolygon(polygon1:Polygon, polygon2:Polygon) {
        for(let i= 0; i< polygon1.edges.length; i++){
            if(CollisionDetection.isPointInside(polygon1.edges,polygon2.edges[i].p1)){
                return true;
            }
            if(CollisionDetection.isPointInside(polygon1.edges,polygon2.edges[i].p2)){
                return true;
            }
        }
        return false;
    }

}