

export class Highlighting {
    public drawPolygon(origin:Point,points:Point[]) {
        const g = (game as Game);
        if (origin && points.length > 1 && g) {
            const polygon = {
                fillColor: g.user?.color,
                strokeColor: g.user?.color,
                fontFamily: CONFIG.defaultFontFamily,
                x: 0,
                y: 0,
                author: g.user?.id,
                shape:{
                    // @ts-ignore
                    type: Drawing.SHAPE_TYPES.POLYGON,
                    points:[origin.x,origin.y],
                    bezierFactor:0
                }
            }
            points.forEach(p => {
                polygon["shape"].points.push(p.x, p.y);
            })
            const createData = Canvas.layers.drawings.layerClass.placeableClass.normalizeShape(polygon);
            const cls = getDocumentClass("Drawing");
            const scene = (canvas as Canvas).scene;
            // @ts-ignore
            const document = new cls(createData, {parent: scene});
            const drawing = new Canvas.layers.drawings.layerClass.placeableClass(document);
            const drawingsLayer = (canvas as Canvas).layers.find(l => l.name === "DrawingsLayer");
            if (drawingsLayer) {
                drawingsLayer["preview"].addChild(drawing);
            }
            drawing.draw();
            // @ts-ignore
            //cls.create(createData,{parent:scene}); not preview !
        }
    }
    public drawPolygon2(origin:Point,points:number[]) {
        const g = (game as Game);
        if (origin && points.length > 2 && g) {
            const polygon = {
                fillColor: g.user?.color,
                strokeColor: g.user?.color,
                fontFamily: CONFIG.defaultFontFamily,
                x: 0,
                y: 0,
                author: g.user?.id,
                shape:{
                    // @ts-ignore
                    type: Drawing.SHAPE_TYPES.POLYGON,
                    points:[origin.x,origin.y],
                    bezierFactor:0
                }
            }
            points.forEach(p => {
                polygon["shape"].points.push(p);
            })

            const createData = Canvas.layers.drawings.layerClass.placeableClass.normalizeShape(polygon);
            const cls = getDocumentClass("Drawing");
            const scene = (canvas as Canvas).scene;
            //@ts-ignore
            const document = new cls(createData, {parent: scene});

            const drawing = new Canvas.layers.drawings.layerClass.placeableClass(document);
            const drawingsLayer = (canvas as Canvas).layers.find(l => l.name === "DrawingsLayer");
            if (drawingsLayer) {
                drawingsLayer["preview"].addChild(drawing);
            }
            drawing.draw();
            // @ts-ignore
            //cls.create(createData,{parent:scene});
        }
    }
    public todocwpg(p:Point){
        var x = new ClockwiseSweepShape();
        // @ts-ignore
        x.initialize(p,{debug:false,radius:2000,angle:90,type:"sight"});
        x.compute();
        x.visualize();
        return x;
    }

    public getWalls(c:ClockwiseSweepPolygon){
        const result:{polygons:Point[][],walls:{}} = {
            polygons:[],
            walls:{},
        }
        const points:Point[] = [];
        let polygon:Point[] = [];
        for(let i=0;i<c.points.length;i=i+2){
            var point = {x:c.points[i],y:c.points[i+1]};
            points.push(point);
            c.vertices.forEach(v=>{
                if(v.x == point.x && v.y == point.y){
                    // @ts-ignore
                    if(!v.isBlockingCCW){
                        if(polygon.length > 0){
                            result.polygons.push(polygon);
                        }
                        polygon = [];
                    }else{
                        v.cwEdges.forEach(e=>{
                            if(e["wall"]){
                                result.walls[e["wall"].id]=e["wall"];
                            }
                        })
                        polygon.push(point);
                    }
                }

            })
        }
        if(polygon.length > 0){
            result.polygons.push(polygon);
        }
        return result;
    }

}


export class ClockwiseSweepShape extends ClockwiseSweepPolygon {
    /**
     * "Corner" points encountered. Corners are when the sweep hits a non-limited wall
     * and must extend the sweep beyond that point.
     * @type {Point[]}
     */
    cornersEncountered = new Set();

    /**
     * "Edges" or walls encountered. Added if the wall forms part of the polygon.
     * @type {Set<Wall>}
     */
    edgesEncountered = new Set();

    /**
     * Polygons for each wall section
     */
    wallPolygons:number[][] = [];

    sweepPoints=[];

    /** @inheritdoc */
    _compute() {
        this.cornersEncountered.clear();
        this.edgesEncountered.clear();
        this.sweepPoints=[];
        this.wallPolygons = [];
        this.wallPolygons.push([]);

        super._compute();
        const points = this.points;
        this.wallPolygons.forEach((wallPoints,index)=>{
            this.points = wallPoints;
            this._constrainBoundaryShapes();
            this.wallPolygons[index]=this.points;
        });
        this.points = points;
    }

    /**
     * Determine the result for the sweep at a given vertex
     * @param {PolygonVertex} vertex      The target vertex
     * @param {EdgeSet} activeEdges       The set of active edges
     * @param {boolean} hasCollinear      Are there collinear vertices behind the target vertex?
     * @inheritdoc
     */
    _determineSweepResult(vertex, activeEdges, hasCollinear=false) {
        const addPoints = function(edges,pt: PolygonVertex){
            this.addPoint(pt);
            let hasCorrectWall = false;
            pt.cwEdges.forEach(edge => {
                this.edgesEncountered.add(edge.wall);
                if(!edge.wall?.id?.startsWith("BoundOuter")){
                    hasCorrectWall = true;
                }
            });
            this._addPoint(this.sweepPoints,pt);
            if(hasCorrectWall){
                this._addPoint(this.wallPolygons[this.wallPolygons.length-1],pt);
            }else{
                if(this.wallPolygons[this.wallPolygons.length-1].length > 0){
                    this.wallPolygons.push([]);
                }
            }
        }.bind(this);
        // Determine whether the target vertex is behind some other active edge
        const {isBehind, wasLimited} = this._isVertexBehindActiveEdges(vertex, activeEdges);

        // Case 1 - Some vertices can be ignored because they are behind other active edges
        if ( isBehind ) return;

        // Construct the CollisionResult object
        const result = new CollisionResult({
            target: vertex,
            cwEdges: vertex.cwEdges,
            ccwEdges: vertex.ccwEdges,
            isLimited: vertex.isLimited,
            isBehind,
            wasLimited
        });

        // Case 2 - No counter-clockwise edge, so begin a new edge
        // Note: activeEdges always contain the vertex edge, so never empty
        const nccw = vertex.ccwEdges.size;
        if ( !nccw ) {
            this._switchEdge(result, activeEdges);
            result.collisions.forEach(pt => {
                if ( pt.isEndpoint ) this.cornersEncountered.add(keyFromPoint(pt.x, pt.y));
                addPoints(pt.cwEdges,pt);
            });
            return;
        }

        // Case 3 - Limited edges in both directions
        // We can only guarantee this case if we don't have collinear endpoints
        const ccwLimited = !result.wasLimited && vertex.isLimitingCCW;
        const cwLimited = !result.wasLimited && vertex.isLimitingCW;
        if ( !hasCollinear && cwLimited && ccwLimited ) return;

        // Case 4 - Non-limited edges in both directions
        if ( !ccwLimited && !cwLimited && nccw && vertex.cwEdges.size ) {
            result.collisions.push(result.target);
            addPoints(result.cwEdges,result.target);
            return;
        }

        // Case 5 - Otherwise switching edges or edge types
        this._switchEdge(result, activeEdges);
        result.collisions.forEach(pt => {
            if ( pt.isEndpoint ) this.cornersEncountered.add(keyFromPoint(pt.x, pt.y));
            addPoints(pt.cwEdges,pt);
        });
    }

    _addPoint (points:number[],{x, y}:PolygonVertex) {
        const l = points.length;
        if ( (x === points[l-2]) && (y === points[l-1]) ) return;
        points.push(x, y);
        return this;
    };
}
//  Same as PolygonVertex
const MAX_TEXTURE_SIZE = Math.pow(2, 16);
const INV_MAX_TEXTURE_SIZE = 1 / MAX_TEXTURE_SIZE;

/**
 * Construct an integer key from a 2d point.
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function keyFromPoint(x, y) {
    return (MAX_TEXTURE_SIZE * x) + y;
}

/**
 * Construct a 2d point from an integer key.
 * Reverse of keyFromPoint
 */
export function pointFromKey(key) {
    const x = ~~(key * INV_MAX_TEXTURE_SIZE);
    const y = key % MAX_TEXTURE_SIZE;
    return {x, y};
}