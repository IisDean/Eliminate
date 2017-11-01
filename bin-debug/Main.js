var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        //游戏过程数据
        _this.gameObj = {
            iconObj: null,
            coords: {
                start: [],
                move: []
            }
        };
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onGroupComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadConfig("resource/default.res.json", "resource/");
        RES.loadGroup("preload");
        RES.loadGroup("creature");
    };
    Main.prototype.onGroupComplete = function (event) {
        this.option = {
            gameWidth: egret.MainContext.instance.stage.stageWidth,
            gameHeight: egret.MainContext.instance.stage.stageHeight,
            row: [6, 8],
            kid: {
                width: 60,
                height: 60,
                imgList: ['list_1_png', 'list_2_png', 'list_3_png', 'list_4_png', 'list_5_png', 'list_6_png'],
            },
            gameArr: [],
        };
        switch (event.groupName) {
            case 'preload':
                this.createBitmapByName('game_bg', 0, 0, this.option['gameWidth'], this.option['gameHeight']);
                break;
            case 'creature':
                this.initGame();
                break;
        }
    };
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == 'creature') {
            console.log("creature资源加载进度：" + event.itemsLoaded + '/' + event.itemsTotal);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceProgress, this);
        }
    };
    //初始游戏
    Main.prototype.initGame = function () {
        var $this = this;
        this.option['gameArr'] = [];
        var a = this.option['gameWidth'] * .1, //起点
        b = this.option['gameHeight'] * .2, //起点
        c = this.option['gameWidth'] * .9 - a, //宽度
        d = this.option['gameHeight'] * .8 - b, //高度
        e = c / this.option['row'][0], //行间距
        f = d / this.option['row'][1]; //列间距
        this.option['gameCoords'] = {
            minX: a,
            maxX: c + a,
            minH: b,
            maxH: d + b
        };
        this.option['kid']['width'] = e;
        this.option['kid']['height'] = e;
        for (var i = 0; i < this.option['row'][0]; i++) {
            this.option['gameArr'][i] = [];
            for (var j = 0; j < this.option['row'][1]; j++) {
                var index = Math.ceil(Math.random() * 5);
                this.option['gameArr'][i].push({
                    imgSrc: this.option['kid']['imgList'][index],
                    loca: [a + e * (i + 1), b + f * (j + 1)]
                });
            }
        }
        var w = this.option['kid']['width'], h = this.option['kid']['height'];
        this.option['gameArr'].forEach(function (ev, index) {
            ev.forEach(function (ev2, index2) {
                var src = ev2['imgSrc'], x = ev2['loca'][0] - w, y = ev2['loca'][1] - h;
                $this.option['gameArr'][index][index2]['obj'] = $this.createBitmapByName(src, x, y, w, h);
            });
        });
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.isTouch, this);
        console.log(w, h);
    };
    //开始触摸
    Main.prototype.onTouch = function (evt) {
        this.gameObj['coords']['start'][0] = evt.localX;
        this.gameObj['coords']['start'][1] = evt.localY;
        this.touch = true;
    };
    //寻找滑动的图标对象
    Main.prototype.seachIconObj = function (x, y) {
        var $this = this;
        var activeIcon = [];
        $this.option['gameArr'].forEach(function (ev, index) {
            ev.forEach(function (ev2, index2) {
                for (var i = 0; i < ev2.loca.length; i++) {
                    if (Math.abs(x - ev2.loca[0]) < $this.option['kid']['width'] && Math.abs(y - ev2.loca[1]) < $this.option['kid']['height']) {
                        activeIcon = [index, index2];
                    }
                }
            });
        });
        return activeIcon;
    };
    //滑动
    Main.prototype.isTouch = function (evt) {
        if (!this.touch)
            return false; //滑动阻止
        this.touch = false; //滑动状态变更
        var touchStart = this.gameObj['coords']['start'];
        var touchOption = this.option['gameCoords'];
        if (touchStart[0] < touchOption['minX'] || touchStart[0] > touchOption['maxX'] || touchStart[1] < touchOption['minH'] || touchStart[1] > touchOption['maxH'])
            return false; //不在游戏区域
        this.gameObj['iconObj'] = this.seachIconObj(this.gameObj['coords']['start'][0], this.gameObj['coords']['start'][1]); //寻找滑动的图标对象
        this.gameObj['coords']['move'][0] = evt.localX;
        this.gameObj['coords']['move'][1] = evt.localY;
        var x = this.gameObj['coords']['move'][0] - touchStart[0], y = this.gameObj['coords']['move'][1] - touchStart[1];
        this.gameObj['direction'] = this.isDirection(x, y); //滑动方向
        var aX = this.gameObj['iconObj'][0], aY = this.gameObj['iconObj'][1];
        this.locaChange(this.gameObj['direction'], aX, aY);
    };
    // 更换位置
    Main.prototype.locaChange = function (direction, c, d) {
        var a = 0, b = 0;
        switch (direction) {
            case 1://上
                b -= 1;
                break;
            case 2://右
                a += 1;
                break;
            case 3://下
                b += 1;
                break;
            case 4://左
                a -= 1;
                break;
        }
        var e = this.option['gameArr'][c][d]['obj'];
        this.option['gameArr'][c][d]['obj'] = this.option['gameArr'][c + a][d + b]['obj'];
        this.option['gameArr'][c + a][d + b]['obj'] = e;
        var w = this.option['kid']['width'], h = this.option['kid']['height'];
        this.option['gameArr'][c][d]['obj'].x = this.option['gameArr'][c][d]['loca'][0] - w;
        this.option['gameArr'][c][d]['obj'].y = this.option['gameArr'][c][d]['loca'][1] - h;
        this.option['gameArr'][c + a][d + b]['obj'].x = this.option['gameArr'][c + a][d + b]['loca'][0] - w;
        this.option['gameArr'][c + a][d + b]['obj'].y = this.option['gameArr'][c + a][d + b]['loca'][1] - h;
    };
    //滑动方向判断
    Main.prototype.isDirection = function (X, Y) {
        var result = 0;
        if (Math.abs(X) > Math.abs(Y) && X > 0) {
            result = 2; //右滑
        }
        else if (Math.abs(X) > Math.abs(Y) && X < 0) {
            result = 4; //左滑
        }
        else if (Math.abs(Y) > Math.abs(X) && Y > 0) {
            result = 3; //下滑
        }
        else if (Math.abs(Y) > Math.abs(X) && Y < 0) {
            result = 1; //上滑
        }
        else {
            console.log('错误'); //点击
        }
        return result;
    };
    //图形绘制
    Main.prototype.createBitmapByName = function (name, x, y, w, h) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        result.x = x;
        result.y = y;
        result.width = w;
        result.height = h;
        this.addChild(result);
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map