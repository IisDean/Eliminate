class Main extends egret.DisplayObjectContainer{
    private label: egret.TextField;
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
    private _textinfo:egret.TextField;

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
        this.option['gameCoords'] = {
            minX : a,
            maxX : c+a,
            minH : b,
            maxH : d+b
        };
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
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.onTouch,this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.isTouch,this);
    }

    //游戏过程数据
    private gameObj:Object = {
        iconObj : null,
        coords : {
            start : [],
            move : []
        }
    };

    private touch:boolean;//滑动准许
    //开始触摸
    private onTouch(evt:egret.TouchEvent){
        this.gameObj['coords']['start'][0] = evt.localX;
        this.gameObj['coords']['start'][1] = evt.localY;
        this.touch = true;
    }

    //寻找滑动的图标对象
    private seachIconObj(x,y){
        var $this = this;
        var activeIcon = [];
        $this.option['gameArr'].forEach(function(ev,index){
            ev.forEach(function(ev2,index2){
                for(var i=0;i<ev2.loca.length;i++){
                    if( Math.abs(x-ev2.loca[0]) < $this.option['kid']['width'] && Math.abs(y-ev2.loca[1]) < $this.option['kid']['height'] ){
                        activeIcon = [index,index2];
                    }
                }
            });
        });
        return activeIcon;
    }

    //滑动
    private isTouch(evt:egret.TouchEvent){
         if(!this.touch)return false;//滑动阻止
         this.touch = false;//滑动状态变更
         var touchStart = this.gameObj['coords']['start'];
         var touchOption = this.option['gameCoords'];
         if( touchStart[0] < touchOption['minX'] || touchStart[0] > touchOption['maxX'] || touchStart[1] < touchOption['minH'] || touchStart[1] > touchOption['maxH'] )return false;//不在游戏区域
         this.gameObj['iconObj'] = this.seachIconObj(this.gameObj['coords']['start'][0],this.gameObj['coords']['start'][1]);//寻找滑动的图标对象
         this.gameObj['coords']['move'][0] = evt.localX;
         this.gameObj['coords']['move'][1] = evt.localY;
         var x = this.gameObj['coords']['move'][0] - touchStart[0],
            y = this.gameObj['coords']['move'][1] - touchStart[1];
        this.gameObj['direction'] = this.isDirection(x,y);//滑动方向
        var aX = this.gameObj['iconObj'][0],
            aY = this.gameObj['iconObj'][1];
        this.locaChange(this.gameObj['direction'],this.option['gameArr'][aX][aY]['obj'])
    }

    // 更换位置
    private locaChange(direction,obj){
        switch(direction){
            case 1://上
                obj.y = obj.y - this.option['kid']['height'];
            break;
            case 2://右
                obj.x = obj.x + this.option['kid']['width'];
            break;
            case 3://下
                obj.y = obj.y + this.option['kid']['height'];
            break;
            case 4://左
                obj.x = obj.x - this.option['kid']['width'];
            break;
        }
    }

    //滑动方向判断
    private isDirection(X,Y){
        var result = 0;
        if( Math.abs(X) > Math.abs(Y) && X > 0 ) {
            result = 2;//右滑
        }else if ( Math.abs(X) > Math.abs(Y) && X < 0 ) {
            result = 4;//左滑
        }else if ( Math.abs(Y) > Math.abs(X) && Y > 0) {
            result = 3;//下滑
        }else if  ( Math.abs(Y) > Math.abs(X) && Y < 0 ) {
            result = 1;//上滑
        }else{
            console.log('错误');//点击
        }
        return result;
    }

    //图形绘制
    private createBitmapByName(name:string, x:number, y:number, w:number, h:number){
        var result:egret.Bitmap = new egret.Bitmap();
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