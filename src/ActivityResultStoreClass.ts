export class ActivityResultStoreClass implements ActivityResultStore {

    _data:{
        [actionId:string]:ActivityResultData[]
    }

    constructor(){
        //TODO load store data;
        this._data = {};
    }

    public get(actionId:string):ActivityResultData[]{
        return this._data[actionId] || [];
    }

    public add(actionId:string,result:ActivityResultData){
        this.get(actionId).push(result);
        //todo store data;
    }
}