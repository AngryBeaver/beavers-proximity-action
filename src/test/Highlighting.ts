export class Highlighting {
    public drawPolygon(origin: Point, points: Point[]) {
        const g = (game as Game);
        if (origin && points.length > 1 && g) {
            const polygon = {
                fillColor: g.user?.color,
                strokeColor: g.user?.color,
                fontFamily: CONFIG.defaultFontFamily,
                x: 0,
                y: 0,
                author: g.user?.id,
                shape: {
                    // @ts-ignore
                    type: Drawing.SHAPE_TYPES.POLYGON,
                    points: [origin.x, origin.y],
                    bezierFactor: 0
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

    public drawPolygon2(origin: Point, points: number[]) {
        const g = (game as Game);
        if (origin && points.length > 2 && g) {
            const polygon = {
                fillColor: g.user?.color,
                strokeColor: g.user?.color,
                fontFamily: CONFIG.defaultFontFamily,
                x: 0,
                y: 0,
                author: g.user?.id,
                shape: {
                    // @ts-ignore
                    type: Drawing.SHAPE_TYPES.POLYGON,
                    points: [origin.x, origin.y],
                    bezierFactor: 0
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
            //@ts-ignore
            document.strokeColor = g.user?.color || document.strokeColor;
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

    public todocwpg(p: Point) {
        var x = new ClockwiseSweepShape();
        // @ts-ignore
        x.initialize(p, {debug: false, radius: 2000, angle: 90, type: "sight"});
        x.compute();
        x.visualize();
        return x;
    }

    public getWalls(c: ClockwiseSweepPolygon) {
        const result: { polygons: Point[][], walls: {} } = {
            polygons: [],
            walls: {},
        }
        const points: Point[] = [];
        let polygon: Point[] = [];
        for (let i = 0; i < c.points.length; i = i + 2) {
            var point = {x: c.points[i], y: c.points[i + 1]};
            points.push(point);
            c.vertices.forEach(v => {
                if (v.x == point.x && v.y == point.y) {
                    // @ts-ignore
                    if (!v.isBlockingCCW) {
                        if (polygon.length > 0) {
                            result.polygons.push(polygon);
                        }
                        polygon = [];
                    } else {
                        v.cwEdges.forEach(e => {
                            if (e["wall"]) {
                                result.walls[e["wall"].id] = e["wall"];
                            }
                        })
                        polygon.push(point);
                    }
                }

            })
        }
        if (polygon.length > 0) {
            result.polygons.push(polygon);
        }
        return result;
    }

}


export class ClockwiseSweepShape extends ClockwiseSweepPolygon {


    /**
     * how far can two edges be that walls are still considered connected
     */
    inaccuracyTolerance: number = 5

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
    wallPolygons: number[][] = [];

    wallSegments: { walls: Wall[], polygonPoints: number[], wallPoints: Point[][] }[] = [];

    sweepPoints = [];

    currentWallVertices: PolygonVertex[] = [];
    previousWallVertices: PolygonVertex[] = [];

    /** @inheritdoc */
    _compute() {
        this.cornersEncountered.clear();
        this.edgesEncountered.clear();
        this.sweepPoints = [];
        this.wallPolygons = [];
        this.currentWallVertices = [];
        this.previousWallVertices = [];
        this.wallPolygons.push([]);
        this.wallSegments = [];
        this.addEmptyWallSegment();
        super._compute();
        this.connectLastToFirstWallSegments();

        const points = this.points;
        this.wallSegments.forEach((wallSegment) => {
            this.points = wallSegment.polygonPoints;
            this._constrainBoundaryShapes();
            wallSegment.polygonPoints = this.points;
        });
        this.points = points;
    }



    addWallToSegment(pt) {
        //fix me only edges that are found clockwise and next counterclockwise
        let index = this.wallSegments.length - 1;
        const currentWallPoints: Point[] = [];
        const currentWalls: Wall[] = [];
        const edges = index === 0 ? pt.ccwEdges : pt.cwEdges;

        edges.forEach(edge => {
            if (!edge.wall?.id?.startsWith("BoundOuter")) {
                currentWalls.push(edge.wall)
                currentWallPoints.push({x: edge.wall.vertices.a.x, y: edge.wall.vertices.a.y});
                currentWallPoints.push({x: edge.wall.vertices.b.x, y: edge.wall.vertices.b.y});
            }
        });

        if (currentWalls.length > 0) {
            const previousWallPoints = this.wallSegments[index].wallPoints.slice(-1)[0];
            if (previousWallPoints && !this.areWallsConnected(previousWallPoints, currentWallPoints)) {
                this.addEmptyWallSegment();
                index = this.wallSegments.length - 1;
            }
            //add currentWalls
            this._addPoint(this.wallSegments[index].polygonPoints, pt);
            this.wallSegments[index].walls.push(...currentWalls);
            this.wallSegments[index].wallPoints.push(currentWallPoints);
        } else {
            this.addEmptyWallSegment();
        }
    }

    areWallsConnected(previousWallPoints: Point[], currentWallPoints: Point[]): boolean {
        const distanceOfTwoPoints = function (pointA, pointB): number {
            return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y)
        }
        return !!previousWallPoints.find(pP => currentWallPoints.find(cP => distanceOfTwoPoints(pP, cP) < this.inaccuracyTolerance));
    }

    addEmptyWallSegment() {
        const index = this.wallSegments.length - 1;
        if (index == -1 || this.wallSegments[index].polygonPoints.length > 0) {
            this.wallSegments.push({walls: [], polygonPoints: [], wallPoints: []});
        }
    }

    connectLastToFirstWallSegments() {
        if (this.wallSegments.length > 1) {
            const lastWallSegments = this.wallSegments.pop();
            if (lastWallSegments) {
                const firstWallPoints = this.wallSegments[0].wallPoints[0];
                const lastWallPoints = lastWallSegments.wallPoints.slice(-1)[0];
                if (this.areWallsConnected(firstWallPoints, lastWallPoints)) {
                    lastWallSegments.walls.forEach(w=>{
                        const hasWall = this.wallSegments[0].walls.filter(w2=>w2===w).length>0;
                        if(!hasWall){
                            this.wallSegments[0].walls.unshift(w);
                        }

                    });
                    this.wallSegments[0].polygonPoints.unshift(...lastWallSegments.polygonPoints);
                    this.wallSegments[0].wallPoints.unshift(...lastWallSegments.wallPoints);
                } else {
                    this.wallSegments.push(lastWallSegments);
                }
            }
        }
    }


    captureWalls(edges, pt: PolygonVertex) {
        this.addWallToSegment(pt);
        this.addPoint(pt);
        this._addPoint(this.sweepPoints, pt);
        let hasCorrectWall = pt.cwEdges.size === 0;
        this.previousWallVertices = [...this.currentWallVertices]
        this.currentWallVertices = [];
        //get walls that are connected to this dot
        pt.cwEdges.forEach(edge => {
            this.edgesEncountered.add(edge.wall);
            if (!edge.wall?.id?.startsWith("BoundOuter")) {
                this.wallSegments
                if (edge.wall?.vertices) {
                    this.currentWallVertices.push(edge.wall.vertices.a);
                    this.currentWallVertices.push(edge.wall.vertices.b);
                }

            }
        });
        if (this.currentWallVertices.length > 0) {
            if (this.previousWallVertices.length !== 0) {
                if (!this.previousWallVertices.find(v =>
                    this.currentWallVertices.find(v2 =>
                        (((v2.x - v.x) * (v2.x - v.x)) + ((v2.y - v.y) * (v2.y - v.y))) < this.inaccuracyTolerance)
                )) {
                    if (this.wallPolygons[this.wallPolygons.length - 1].length > 0) {
                        this.wallPolygons.push([]);
                    }
                }
            }
            hasCorrectWall = true;
        }
        if (hasCorrectWall) {
            this._addPoint(this.wallPolygons[this.wallPolygons.length - 1], pt);
        } else {
            if (this.wallPolygons[this.wallPolygons.length - 1].length > 0) {
                this.wallPolygons.push([]);
            }
        }
    }

    /**
     * Determine the result for the sweep at a given vertex
     * @param {PolygonVertex} vertex      The target vertex
     * @param {EdgeSet} activeEdges       The set of active edges
     * @param {boolean} hasCollinear      Are there collinear vertices behind the target vertex?
     * @inheritdoc
     */
    _determineSweepResult(vertex, activeEdges, hasCollinear = false) {

        // Determine whether the target vertex is behind some other active edge
        const {isBehind, wasLimited} = this._isVertexBehindActiveEdges(vertex, activeEdges);

        // Case 1 - Some vertices can be ignored because they are behind other active edges
        if (isBehind) return;

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
        if (!nccw) {
            this._switchEdge(result, activeEdges);
            result.collisions.forEach(pt => {
                if (pt.isEndpoint) this.cornersEncountered.add(keyFromPoint(pt.x, pt.y));
                this.captureWalls(pt.cwEdges, pt);
            });
            return;
        }

        // Case 3 - Limited edges in both directions
        // We can only guarantee this case if we don't have collinear endpoints
        const ccwLimited = !result.wasLimited && vertex.isLimitingCCW;
        const cwLimited = !result.wasLimited && vertex.isLimitingCW;
        if (!hasCollinear && cwLimited && ccwLimited) return;

        // Case 4 - Non-limited edges in both directions
        if (!ccwLimited && !cwLimited && nccw && vertex.cwEdges.size) {
            result.collisions.push(result.target);
            this.captureWalls(result.cwEdges, result.target);
            return;
        }

        // Case 5 - Otherwise switching edges or edge types
        this._switchEdge(result, activeEdges);
        result.collisions.forEach(pt => {
            if (pt.isEndpoint) this.cornersEncountered.add(keyFromPoint(pt.x, pt.y));
            this.captureWalls(pt.cwEdges, pt);
        });
    }

    _addPoint(points: number[], {x, y}: PolygonVertex) {
        const l = points.length;
        if ((x === points[l - 2]) && (y === points[l - 1])) return;
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