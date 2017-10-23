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
                width: 40,
                height: 40,
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
        this.option['kid']['width'] = e * .9;
        this.option['kid']['height'] = e * .9;
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
        var p = this.option['gameArr'][0][0]['obj'];
        p.x = 0;
        p.y = 0;
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