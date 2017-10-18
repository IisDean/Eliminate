class Main extends egret.DisplayObjectContainer{
    public constructor()
    {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    private onAddToStage(event:egret.Event) {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
        RES.loadGroup("preload");
    }
    private onGroupComplete()
    {
        var width = egret.MainContext.instance.stage.stageWidth;
        var height = egret.MainContext.instance.stage.stageHeight;
        var img:egret.Bitmap = new egret.Bitmap();
        img.texture = RES.getRes("game_bg");
        img.x = 0;
        img.y = 0;
        img.width = width;
        img.height = height;
        this.addChild(img);
    }
}