class Main extends egret.DisplayObjectContainer{
    public constructor(){
        super();
        
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }
    private onAddToStage(event:egret.Event) {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadConfig("resource/default.res.json", "resource/");
        RES.loadGroup("preload");
        RES.loadGroup("creature");
    }

    private option:Object;//游戏参数

    private onGroupComplete(event:RES.ResourceEvent):void{
        this.option = {
            gameWidth : egret.MainContext.instance.stage.stageWidth,//舞台宽度
            gameHeight : egret.MainContext.instance.stage.stageHeight,//舞台高度
            row : [6,8],
            kid : { //小动物
                width : 40,//宽
                height : 40,//高
                imgList : ['list_1_png','list_2_png','list_3_png','list_4_png','list_5_png','list_6_png'],//图像地址
            },
            gameArr : [],
        };
        switch( event.groupName ){
            case 'preload':
                this.createBitmapByName('game_bg',0,0,this.option['gameWidth'],this.option['gameHeight']);
            break;
            case 'creature':
                this.initGame();
            break;
        }
    }
    private onResourceProgress(event:RES.ResourceEvent):void{
        if( event.groupName == 'creature' ){
             console.log("creature资源加载进度："+event.itemsLoaded+'/'+event.itemsTotal);
             RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceProgress,this);
        }
    }
    //初始游戏
    private initGame(){
        var $this = this;
        this.option['gameArr'] = [];
        var a = this.option['gameWidth']*.1,//起点
            b = this.option['gameHeight']*.2,//起点
            c = this.option['gameWidth']*.9 - a,//宽度
            d = this.option['gameHeight']*.8 - b,//高度
            e = c / this.option['row'][0],//行间距
            f = d / this.option['row'][1];//列间距
        this.option['kid']['width'] = e*.9;
        this.option['kid']['height'] = e*.9;
        for(var i=0;i<this.option['row'][0];i++){
            this.option['gameArr'][i] = [];
            for(var j=0;j<this.option['row'][1];j++){
                var index = Math.ceil(Math.random()*5);
                this.option['gameArr'][i].push({
                    imgSrc : this.option['kid']['imgList'][index],
                    loca : [a+e*(i+1),b+f*(j+1)]
                });
            }
        }
        var w = this.option['kid']['width'],
            h = this.option['kid']['height'];
        this.option['gameArr'].forEach(function(ev,index){
            ev.forEach(function(ev2,index2){
                var src = ev2['imgSrc'],
                    x = ev2['loca'][0]-w,
                    y = ev2['loca'][1]-h;
                $this.option['gameArr'][index][index2]['obj'] = $this.createBitmapByName(src,x,y,w,h);
            });
        });
        var p = this.option['gameArr'][0][0]['obj'];
        p.x = 0;
        p.y = 0;
    }

    //图形绘制
    private createBitmapByName(name:string, x:number, y:number, w:number, h:number){
        let result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        result.x = x;
        result.y = y;
        result.width = w;
        result.height = h;
        this.addChild(result);
        return result;
    }
    
}