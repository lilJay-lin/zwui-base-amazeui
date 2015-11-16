/**
 * Created by linxiaojie on 2015/11/11.
 */

var $ = require('jquery');
var UI = require('./core');
var supportTransition = UI.support.transition;

function Lottery(element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options || {});
    this.init();
}

Lottery.staticMap = {
    box: '.zw-lottery-box',
    again: '.zw-lottery-again',
    award: '.zw-lottery-award',
    canvas: 'canvas',
    thanks: 'thanks' //thanks :无奖品，其它默认有奖品
};

Lottery.prototype.configMap = {
    cover: 'gray',
    duration: 20, //划卡的直径大小
    award: '' //奖项
};

Lottery.prototype.stateMap = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    award: '', //奖项
    canDeal: true //初次刮卡，调用刮卡事件处理其他事情，一次刮卡流程只能触发一次
};

Lottery.prototype.init = function(){

    var me = this,
        static = Lottery.staticMap;

    me.stateMap = {
        $box: me.$(static.box),
        $award: me.$(static.award),
        $again: me.$(static.again),
        $canvas: me.$(static.canvas).first()
    };

    //设置奖项，显示相应的div，触发canvas初始化
    me.setAward(me.configMap.award);
};

//canvas初始化
Lottery.prototype.resizeCanvas = function(){
    var me = this,
        state = me.stateMap,
        $canvas = state.$canvas,
        $box = state.$box;

    //设置宽高
    $canvas[0].width = state.width = $box.width();
    $canvas[0].height = state.height = $box.height();
    me.offsetX = $box.offset().left;
    me.offsetY = $box.offset().top;
};

//生成cavas遮罩层
Lottery.prototype.layer = function(){
    var me = this,
        stateMap = me.stateMap,
        ctx = stateMap.$canvas[0].getContext('2d');


    //目标图上显示源图像，canvas上面直接绘制遮罩层
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, stateMap.width, stateMap.height);
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, stateMap.width, stateMap.height);
};

//充值刮刮卡状态
Lottery.prototype.refresh = function(){
    var me = this,
        state = me.stateMap,
        $canvas = state.$canvas,
        $box = state.$box;

    //resizeCanvas设置宽高
    me.resizeCanvas();

    //填充遮罩层
    me.layer();

    //添加事件
    me.$el.trigger('removeTapEvent.lottery.zwui');
    me.addEvent();
};


//操作完成，触发奖品显示
Lottery.prototype.gameOver = function(){
    var me = this;

    me.setVisible(false);

    me.$el.trigger('gameover', [me.configMap.award]);
};

//刮刮卡点击事件
Lottery.prototype.addEvent = function(){
    var me = this,
        canvas = me.stateMap.$canvas[0],
        ctx = canvas.getContext('2d'),
        x1, y1, a = duration = me.configMap.duration,
        timeout, totimes = 100;

    //奖项不为空的时候才添加canvas事件
    if(me.stateMap.award !== ''){
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = a * 2;
        ctx.globalCompositeOperation = "destination-out";
        canvas.addEventListener("touchstart", tapstartHandler);
        canvas.addEventListener("touchend", tapendHandler );
        function tapstartHandler(e){
            //$('.tip').hide();
            //开始刮卡触发
            if(me.stateMap.canDeal){
                me.stateMap.canDeal = false;
                me.$el.trigger('startgame');
            }

            //console.count('canvas-touchstart');
            clearTimeout(timeout)
            e.preventDefault();
            if (e.targetTouches) {
                e = e.targetTouches[0]
            }
            x1 = e.pageX - me.offsetX;
            y1 = e.pageY - me.offsetY;
            ctx.save();
            ctx.beginPath()
            ctx.arc(x1, y1, 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            canvas.addEventListener("touchmove", tapmoveHandler);
        }
        function tapendHandler(e){
            canvas.removeEventListener("touchmove", tapmoveHandler);
            timeout = setTimeout(function() {
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var dd = 0;
                for (var x = 0; x < imgData.width; x += duration) {
                    for (var y = 0; y < imgData.height; y += duration) {
                        var i = (y * imgData.width + x) * 4;
                        if (imgData.data[i + 3] > 0) {
                            dd++
                        }
                    }
                }
                if (dd / (imgData.width * imgData.height / (duration * duration)) < 0.5) {
                    me.gameOver();
                }
            }, totimes)
        }
        function tapmoveHandler(e) {
            clearTimeout(timeout)
            e.preventDefault();

            if (e.targetTouches) {
                e = e.targetTouches[e.targetTouches.length - 1];
            }
            x2 = e.pageX - me.offsetX;
            y2 = e.pageY - me.offsetY;
            ctx.save();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
            x1 = x2;
            y1 = y2;
        }

        //窗口大小变动时，需要重新初始化canvas，提供解绑事件
        me.$el.one("removeTapEvent.lottery.zwui",function(){
            //console.count('canvas-removeTapEvent');
            canvas.removeEventListener("touchstart", tapstartHandler);
            canvas.removeEventListener("touchend", tapendHandler );
        });
    }

    //全局事件，窗口变动时，重新初始化canvas//TODO:应该加个时间限制，resize如果是PC端触发的时候执行粒度很多
    $(window).on('resize', function(e){
        me && me.refresh();
    });
};


Lottery.prototype.on = function(){
    var slice = [].slice;
    this.$el.on.apply(this.$el, slice.call(arguments));
};

//设置奖品，奖品设置完成后，添加滑动事件// thanks :无奖品，其它默认有奖品
Lottery.prototype.setAward = function(award){
    var me = this,
        $award = me.stateMap.$award,
        $again = me.stateMap.$again;

    me.stateMap.award = award;
    me.setVisible(true);
    me.stateMap.canDeal = true;

    if(Lottery.staticMap.thanks === award){
        $again.css({visibility: 'visible'});
        $award.css({visibility: 'hidden'});
    }else{
        $again.css({visibility: 'hidden'});
        $award.css({visibility: 'visible'});
    };

    me.refresh();
};

Lottery.prototype.setVisible = function(status){
    this.stateMap.$canvas.toggle(!!status);
};

Lottery.prototype.$ = function(el){
    return this.$el.find(el);
};



Lottery.prototype.destroy = function(){
    this.$el.off('gameout');
    this.$el.off('startgame')
    this.$el.trigger('removeTapEvent.lottery.zwui');
};

module.exports = UI.lottery = Lottery;