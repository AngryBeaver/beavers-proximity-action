import { NAMESPACE } from "../Settings.js";
import { TileActivity } from "../activities/TileActivity.js";
import { WallActivity } from "../activities/WallActivity.js";
import { RegionActivity } from "../activities/RegionActivity.js";

export class BeaversProximityApp implements BeaversProximityAppI {

  private activities: {
    byId: { [id: string]: ActivityClass };
    byType: { [type in EntityType]: Array<ActivityClass> };
  } = { byId: {}, byType: { wall: [], tile: [], region: [] } };

  public addActivity(activityClass: ActivityClass) {
    this.activities.byId[activityClass.id] = activityClass;
    if (activityClass.prototype instanceof TileActivity) {
      this.activities.byType.tile.push(activityClass);
    } else if (activityClass.prototype instanceof WallActivity) {
      this.activities.byType.wall.push(activityClass);
    } else if (activityClass.prototype instanceof RegionActivity) {
      this.activities.byType.region.push(activityClass);
    } else {
      console.warn(`${NAMESPACE} | Unknown Activity entity type for ${activityClass.id}`);
    }
    (game as ReadyGame)[NAMESPACE].Settings.addActivity(activityClass);
  }

  public getActivities(type: EntityType): Array<ActivityClass> {
    return this.activities.byType[type];
  }

  public getActivity(activityId: string): ActivityClass {
    return this.activities.byId[activityId];
  }

  /**
   * Detect nearby/visible entities for the given initiator using the initiator token’s senses.
   * Returns ActivityHits grouped by activity id.
   */
  public scan(initiator: InitiatorI): ProximityResponse {
    const token = this.getInitiatorToken(initiator);
    const origin = token?.center ?? { x: 0, y: 0 } as any;

    const acc: { [id: string]: ActivityHit } = {};

    // Gather candidates by type
    const tilePlaceables: PlaceableObject[] = canvas?.tiles?.placeables ?? [];
    const wallPlaceables: PlaceableObject[] = canvas?.walls?.placeables ?? [];
    // @ts-ignore
    const regionPlaceables: PlaceableObject[] = canvas?.regions?.placeables ?? [];

    // Tiles
    for (const t of tilePlaceables) {
      const entity = t as any; // Tile
      this.collectEntityActivities("tile", entity, initiator, origin, acc);
    }

    // Walls
    for (const w of wallPlaceables) {
      const entity = w as any; // Wall
      this.collectEntityActivities("wall", entity, initiator, origin, acc);
    }

    // Regions (if layer present)
    for (const r of regionPlaceables) {
      const entity = r as any; // Region-like
      this.collectEntityActivities("region", entity, initiator, origin, acc);
    }

    return {
      origin: origin as any,
      initiator: initiator as any,
      activities: Object.values(acc),
    };
  }

  private getInitiatorToken(initiator: InitiatorI): Token | undefined {
    beaversSystemInterface.D
    const sceneMatches = initiator.sceneId === canvas?.scene?.id;
    if (!sceneMatches) return undefined;
    const token = canvas?.tokens?.get(initiator.tokenId as any) as unknown as Token | undefined;
    return token;
  }

  private collectEntityActivities(
    type: EntityType,
    entity: any,
    initiator: InitiatorI,
    origin: Point,
    acc: { [id: string]: ActivityHit },
  ) {
    const entityId = entity.id;

    // 1) Entity-attached activities (per-entity configs)
    const attached = this.getEntityConfigs(type, entity);
    for (const config of Object.values(attached.activities) as EntityConfig[]) {
      const activity = this.getActivity(config.activityId);
      if (!activity) continue;
      if (!this.isDetectable(activity, type, entity, initiator, origin)) continue;
      this.pushHit(acc, activity, type, entityId);
    }

    // 2) Globally enabled activities (ActivityData.enabled filters)
    for (const activity of this.getActivities(type)) {
      const worldData = (game as Game)[NAMESPACE].Settings.getActivityData(activity.id);
      const enabledFilters = worldData?.enabled ?? [];
      const match = enabledFilters.some(f =>
        // @ts-ignore
        foundry.utils.getProperty(entity, f.attribute) === f.value);
      if (!match) continue;
      if (!this.isDetectable(activity, type, entity, initiator, origin)) continue;
      this.pushHit(acc, activity, type, entityId);
    }
  }

  private pushHit(
    acc: { [id: string]: ActivityHit },
    activity: ActivityClass,
    type: EntityType,
    entityId: string,
  ) {
    acc[activity.id] = acc[activity.id] || {
      activityId: activity.id,
      name: activity.template.name,
      type,
      entityIds: [],
    };
    acc[activity.id].entityIds.push(entityId);
  }

  private getEntityConfigs(type: EntityType, entity: any): EntityConfigs {
    if (type === "tile") return (canvas?.tiles as any)?.documentClass?.getFlags?.(entity) ?? this.readFlags(entity);
    if (type === "wall") return this.readFlags(entity);
    if (type === "region") return this.readFlags(entity);
    return { activities: {} } as EntityConfigs;
  }

  private readFlags(entity: any): EntityConfigs {
    // @ts-ignore
    return foundry.utils.getProperty(entity.document
      || {}, `flags.${NAMESPACE}`) || { activities: {} };
  }

  private isDetectable(
    activity: ActivityClass,
    type: EntityType,
    entity: any,
    initiator: InitiatorI,
    origin: Point,
  ): boolean {
    const det = activity.template.detection ?? { mode: "sight" as const };

    // Entity representative points
    const points = this.sampleEntityPoints(type, entity);

    switch (det.mode) {
      case "radius": {
        const r = Math.max(0, det.radius ?? 0);
        return points.some(p => this.withinRadius(origin, p, r));
      }
      case "touch": {
        // First pass: use movement collision (treats windows and closed doors as blockers).
        return points.some(p => this.canTouch(origin, p));
      }
      case "sight":
      default: {
        return points.some(p => this.hasSight(origin, p));
      }
    }
  }

  private withinRadius(a: Point, b: Point, r: number): boolean {
    const dx = (a.x as number) - (b.x as number);
    const dy = (a.y as number) - (b.y as number);
    const dist = Math.hypot(dx, dy) / (canvas?.dimensions?.size || 1); // convert to grid units
    return dist <= r;
  }

  private canTouch(a: Point, b: Point): boolean {
    const collided = CONFIG.Canvas.polygonBackends.move.testCollision(
      a as any, b as any,
      { mode: "any" }
    );
    return !collided;
  }

  private hasSight(a: Point, b: Point): boolean {
    // Prefer Foundry’s visibility helper if available
    const visAny = (canvas as any)?.effects?.visibility;
    if (visAny?.testVisibility) {
      return !!visAny.testVisibility(b, { object: null, tests: [{ ray: new Ray(a as any, b as any) }]} );
    }
    // Fallback to walls sight collision
    const collided = CONFIG.Canvas.polygonBackends.sight.testCollision(
      a as any, b as any,
      { mode: "any" }
    );
    return !collided;
  }

  private sampleEntityPoints(type: EntityType, entity: any): Point[] {
    // Tiles/Regions: use center
    if (type === "tile" || type === "region") {
      const c = (entity as any).center ?? entity.center?.();
      return [c ?? { x: entity.x + entity.width / 2, y: entity.y + entity.height / 2 }];
    }
    // Walls: use midpoint
    if (type === "wall") {
      const d = entity.document ?? entity;
      const mx = (d.c[0] + d.c[2]) / 2;
      const my = (d.c[1] + d.c[3]) / 2;
      return [{ x: mx, y: my } as any];
    }
    return [];
  }
}