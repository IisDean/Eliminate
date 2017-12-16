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
        _this.gridArr = []; //扫描标记数组矩阵
        //游戏过程数据
        _this.gameObj = {
            iconObj: null,
            coords: {
                start: [],
                move: []
            }
        };
        _this.row_count = 0; //横向可消除数量
        _this.col_count = 0; //纵向可消除数量
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
            //  console.log("creature资源加载进度："+event.itemsLoaded+'/'+event.itemsTotal);
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
            this.gridArr[i] = []; //生成扫描标记数组
            for (var j = 0; j < this.option['row'][1]; j++) {
                var index = Math.floor(Math.random() * 6);
                this.option['gameArr'][i].push({
                    loca: [a + e * (i + 1), b + f * (j + 1)],
                    obj: {
                        imgSrc: this.option['kid']['imgList'][index],
                        index: index
                    }
                });
                this.gridArr[i][j] = 0; //生成扫描标记数组
            }
        }
        var w = this.option['kid']['width'], h = this.option['kid']['height'];
        this.option['gameArr'].forEach(function (ev, index) {
            ev.forEach(function (ev2, index2) {
                var src = ev2['obj']['imgSrc'], x = ev2['loca'][0] - w, y = ev2['loca'][1] - h;
                $this.option['gameArr'][index][index2]['obj']['dom'] = $this.createBitmapByName(src, x, y, w, h);
            });
        });
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouch, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.isTouch, this);
        // console.log( $this.option['gameArr'] );
        window['abs'] = $this.option['gameArr'];
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
        //滑动阻止
        if (!this.touch)
            return false;
        //滑动状态变更
        this.touch = false;
        var touchStart = this.gameObj['coords']['start'];
        var touchOption = this.option['gameCoords'];
        //不在游戏区域
        if (touchStart[0] < touchOption['minX'] || touchStart[0] > touchOption['maxX'] || touchStart[1] < touchOption['minH'] || touchStart[1] > touchOption['maxH'])
            return false;
        //寻找滑动的图标对象
        this.gameObj['iconObj'] = this.seachIconObj(this.gameObj['coords']['start'][0], this.gameObj['coords']['start'][1]);
        this.gameObj['coords']['move'][0] = evt.localX;
        this.gameObj['coords']['move'][1] = evt.localY;
        var x = this.gameObj['coords']['move'][0] - touchStart[0], y = this.gameObj['coords']['move'][1] - touchStart[1];
        //滑动方向
        this.gameObj['direction'] = this.isDirection(x, y);
        var aX = this.gameObj['iconObj'][0], aY = this.gameObj['iconObj'][1];
        this.locaChange(this.gameObj['direction'], aX, aY);
    };
    // 滑动方向判断
    Main.prototype.locaChange = function (direction, c, d) {
        var that = this, a = 0, b = 0, row = that.option['row'];
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
        // 判断边界
        if (c + a >= row[0] || c + a < 0 || d + b >= row[1] || d + b < 0) {
            return false;
        }
        //位置互换，判断是否满足消除条件
        that.exchangeLocation(a + c, b + d, c, d);
        console.log(a + c, b + d, c, d);
        var detection1 = that.detection(a + c, b + d), detection2 = that.detection(c, d);
        if (detection1 > 0 || detection2 > 0) {
            this.eliminate();
        }
        else {
            setTimeout(function () {
                that.exchangeLocation(a + c, b + d, c, d);
            }, 200);
        }
        ;
    };
    // 位置互换
    Main.prototype.exchangeLocation = function (a, b, c, d) {
        // console.log('位置互换');
        var e = this.option['gameArr'][c][d]['obj'];
        this.option['gameArr'][c][d]['obj'] = this.option['gameArr'][a][b]['obj'];
        this.option['gameArr'][a][b]['obj'] = e;
        var w = this.option['kid']['width'], h = this.option['kid']['height'], activeDom = this.option['gameArr'][c][d], nextDom = this.option['gameArr'][a][b];
        this.moveAnimation(activeDom['obj']['dom'], [activeDom['loca'][0] - w, activeDom['loca'][1] - h], 150);
        this.moveAnimation(nextDom['obj']['dom'], [nextDom['loca'][0] - w, nextDom['loca'][1] - h], 150);
    };
    //缓动效果
    Main.prototype.moveAnimation = function (obj, loca, time) {
        egret.Tween.get(obj).to({ x: loca[0], y: loca[1] }, time, egret.Ease.sineIn);
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
            console.log('方向错误'); //点击
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
    //扫描消除对象
    Main.prototype.detection = function (x, y) {
        console.log('aaa');
        var thisArr = this.option['gameArr'][x][y], thisType = thisArr['obj']['index'], scan_col = 1, //纵向可扫描
        scan_row = 1, //横向可扫描
        col_x = x, col_y = y, row_x = x, row_y = y;
        //如果该动物的左边与它自己相同，并且对应的标记数组大于0，就不继续扫描（因为代表已经扫过了一这行）
        if (x != 0 && this.option['gameArr'][x - 1][y] == thisType && this.gridArr[x - 1][y] > 0) {
            scan_row = 0;
        }
        //如果该动物的上边与它自己相同，并且对应的标记数组大于0，就不继续扫描（因为代表已经扫过了一这列）  
        if (y != 0 && this.option['gameArr'][x][y - 1] == thisType && this.gridArr[x][y - 1] > 0) {
            scan_col = 0;
        }
        // 横向扫描
        if (scan_row == 1) {
            for (var i = 1;; i++) {
                if (x - i < 0 || this.option['gameArr'][x - i][y]['obj']['index'] != thisType) {
                    break;
                }
                else if (this.option['gameArr'][x - i][y]['obj']['index'] == thisType) {
                    this.gridArr[x - i][y]++;
                    this.row_count++;
                    if (row_x != 0)
                        row_x--; //记下当前横向扫描最左边相同的动物
                }
            }
            for (var i = 0;; i++) {
                if (x + i >= this.option['row'][0] || this.option['gameArr'][x + i][y]['obj']['index'] != thisType) {
                    break;
                }
                else if (this.option['gameArr'][x + i][y]['obj']['index'] == thisType) {
                    this.gridArr[x + i][y]++;
                    this.row_count++;
                }
            }
            // 同一条线上的相同小动物没超过3个，取消标记
            if (this.row_count < 3) {
                for (var i = 0; i < this.row_count; i++) {
                    this.gridArr[row_x + i][row_y]--;
                }
                this.row_count = 0;
            }
        }
        // 纵向扫描
        if (scan_col == 1) {
            for (var i = 1;; i++) {
                if (y - i < 0 || this.option['gameArr'][x][y - i]['obj']['index'] != thisType) {
                    break;
                }
                else if (this.option['gameArr'][x][y - i]['obj']['index'] == thisType) {
                    this.gridArr[x][y - i]++;
                    this.col_count++;
                    if (col_y != 0)
                        col_y--; //记下当前横向扫描最上边相同的动物
                }
            }
            for (var i = 0;; i++) {
                if (y + i >= this.option['row'][1] || this.option['gameArr'][x][y + i]['obj']['index'] != thisType) {
                    break;
                }
                else if (this.option['gameArr'][x][y + i]['obj']['index'] == thisType) {
                    this.gridArr[x][y + i]++;
                    this.col_count++;
                }
            }
            // 同一条线上的相同小动物没超过3个，取消标记
            if (this.col_count < 3) {
                for (var j = 0; j < this.col_count; j++) {
                    this.gridArr[col_x][col_y + j]--;
                }
                this.col_count = 0;
            }
        }
        // console.log(this.gridArr);
        //有一行或者有一列满足消除，即相同的动物大于等于3，返回1，表示可以交换
        if (this.row_count >= 3 || this.col_count >= 3) {
            this.row_count = 0;
            this.col_count = 0;
            return 1;
        }
        else {
            this.row_count = 0;
            this.col_count = 0;
            return 0;
        }
    };
    //消除满足条件的动物
    Main.prototype.eliminate = function () {
        var that = this;
        setTimeout(function () {
            that.gridArr.forEach(function (ev, index) {
                ev.forEach(function (ev2, index2) {
                    if (ev2 > 0) {
                        var remove = that.option['gameArr'][index][index2]['obj'];
                        remove.imgSrc = remove['dom'].src = '123';
                        that.gridArr[index][index2] = 0;
                        if (remove['dom'].parent) {
                            remove['dom'].parent.removeChild(remove['dom']);
                        }
                        console.log(remove, that.option['gameArr'][index][index2]['obj']);
                    }
                });
            });
        }, 500);
    };
    // 下落
    Main.prototype.downDom = function () {
    };
    //判断数组中是否含有某个值 a 为数组 b为需要判断的值
    Main.prototype.isArray = function (a, b) {
        console.log(JSON.stringify(a), JSON.stringify(b));
        return JSON.stringify(a).indexOf(JSON.stringify(b));
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map