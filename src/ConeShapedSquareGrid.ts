export class ConeShapedSquareGrid {
    distance:number;
    origin:Point;
    rotation:number;
    //TODO get grids for cone shaped on grids
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
        if(this.rotation%2==0){
            //    x
            //  x x x
            //x x x x x
            //  x x x
            //    O
            for(let h=1 ;h <= this.distance;h++){
                const halfWidth = Math.min(h,this.distance-h,2);
                for(let w=-halfWidth;w<=halfWidth;w++){
                    if(this.rotation == 0){
                        grids.push({x:x+w,y:y-h})
                    }
                    if(this.rotation == 2){
                        grids.push({x:x+h,y:y+w})
                    }
                    if(this.rotation == 4){
                        grids.push({x:x+w,y:y+h})
                    }
                    if(this.rotation == 6){
                        grids.push({x:x-h,y:y+w})
                    }

                }
            }
        }
        if(this.rotation%2==1){
            //     x x x
            //   x x x x
            //   x x x x
            //   O x x
            for(let h=0 ;h < this.distance;h++){
                const offset = Math.max(0,h-2);
                const width = Math.min(5,h+3,this.distance,this.distance-h+2);
                for(let w=0;w<=width;w++){
                    const p = {x:x,y:y}
                    if(this.rotation == 1){
                        p.x = x+offset+width;
                        p.y = y-h;
                    }
                    if(this.rotation == 3){
                        p.x = x+offset+width;
                        p.y = y+h
                    }
                    if(this.rotation == 5){
                        p.x = x-offset-width;
                        p.y = y+h;
                    }
                    if(this.rotation == 7){
                        p.x = x-offset-width;
                        p.y = y-h;
                    }
                    if(!(p.x === x && p.y === y)){
                        grids.push(p);
                    }
                }
            }
        }
        return grids;
    }

}