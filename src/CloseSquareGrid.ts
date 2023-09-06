export class CloseSquareGrid {
    distance:number;
    origin:Point;
    rotation:number;
    //highlight via highlight layer needs measuredTemplate -> grid.grid.highlightGridPosition(hl, {x, y, border, color});

    constructor(distance:number,origin:Point,rotation){
        this.distance = distance;
        this.origin = origin;
        this.rotation = Math.round(rotation/45);
    }

    public getGrids():Point[]{
        const x = this.origin.x;
        const y = this.origin.y;
        const grids: Point[]=[];
        // x x x
        // x o x
        // x x x
        for (let h=-this.distance ;h <= this.distance;h++) {
            for (let w = -this.distance; w <= this.distance; w++) {
                const p = {x:w,y:h}
                if(!(p.x === x && p.y === y)){
                    grids.push(p);
                }
            }
        }
        return grids;
    }

}