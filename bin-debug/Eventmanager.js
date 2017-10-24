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
var Eventmanager = (function (_super) {
    __extends(Eventmanager, _super);
    function Eventmanager(type, bubbles, cancelable) {
        if (bubbles === void 0) { bubbles = false; }
        if (cancelable === void 0) { cancelable = false; }
        var _this = _super.call(this, type, bubbles, cancelable) || this;
        _this._year = 0;
        _this._month = 0;
        _this._date = 0;
        _this._where = '';
        _this._todo = '';
        return _this;
    }
    Eventmanager.GOTO_GIRL = '女孩';
    return Eventmanager;
}(egret.Event));
__reflect(Eventmanager.prototype, "Eventmanager");
//# sourceMappingURL=Eventmanager.js.map