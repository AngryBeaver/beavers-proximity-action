import {NAMESPACE} from "../Settings.js";

export class Utils {

    static getEntityConfigBy(entityActivityId:string):EntityConfig{
        const parts = entityActivityId.split("-");
        if(parts.length === 3) {
            return this.getEntityConfig(parts[0] as EntityType, parts[1], parts[2]);
        }else {
            throw new Error("not an entityActivityId");
        }
    }

    static getEntityConfig(type:EntityType,id:string,key:string):EntityConfig{
        return this.getEntityConfigs(type,id)[key] || {activityId:id,data:{}};
    }

    static getEntityConfigs(type:EntityType,id):EntityConfigs{
        return (this.getEntity(type,id)?.getFlag(NAMESPACE,"activities")) as EntityConfigs || {};
    }

    static getEntity(type:EntityType, id:string){
        let entity:TileDocument|WallDocument|undefined;
        if(type === "tile"){
            entity = (canvas as Canvas).scene?.tiles?.get(id);
        }
        if(type === "wall"){
            entity = (canvas as Canvas).scene?.walls?.get(id);
        }
        return entity;
    }
}