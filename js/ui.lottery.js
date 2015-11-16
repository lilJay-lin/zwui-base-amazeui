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
    thanks: 'thanks' //thanks :�޽�Ʒ������Ĭ���н�Ʒ
};

Lottery.prototype.configMap = {
    cover: 'gray',
    duration: 20, //������ֱ����С
    award: '' //����
};

Lottery.prototype.stateMap = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    award: '', //����
    canDeal: true //���ιο������ùο��¼������������飬һ�ιο�����ֻ�ܴ���һ��
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

    //���ý����ʾ��Ӧ��div������canvas��ʼ��
    me.setAward(me.configMap.award);
};

//canvas��ʼ��
Lottery.prototype.resizeCanvas = function(){
    var me = this,
        state = me.stateMap,
        $canvas = state.$canvas,
        $box = state.$box;

    //���ÿ��
    $canvas[0].width = state.width = $box.width();
    $canvas[0].height = state.height = $box.height();
    me.offsetX = $box.offset().left;
    me.offsetY = $box.offset().top;
};

//����cavas���ֲ�
Lottery.prototype.layer = function(){
    var me = this,
        stateMap = me.stateMap,
        ctx = stateMap.$canvas[0].getContext('2d');


    //Ŀ��ͼ����ʾԴͼ��canvas����ֱ�ӻ������ֲ�
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, stateMap.width, stateMap.height);
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, stateMap.width, stateMap.height);
};

//��ֵ�ιο�״̬
Lottery.prototype.refresh = function(){
    var me = this,
        state = me.stateMap,
        $canvas = state.$canvas,
        $box = state.$box;

    //resizeCanvas���ÿ��
    me.resizeCanvas();

    //������ֲ�
    me.layer();

    //����¼�
    me.$el.trigger('removeTapEvent.lottery.zwui');
    me.addEvent();
};


//������ɣ�������Ʒ��ʾ
Lottery.prototype.gameOver = function(){
    var me = this;

    me.setVisible(false);

    me.$el.trigger('gameover', [me.configMap.award]);
};

//�ιο�����¼�
Lottery.prototype.addEvent = function(){
    var me = this,
        canvas = me.stateMap.$canvas[0],
        ctx = canvas.getContext('2d'),
        x1, y1, a = duration = me.configMap.duration,
        timeout, totimes = 100;

    //���Ϊ�յ�ʱ������canvas�¼�
    if(me.stateMap.award !== ''){
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = a * 2;
        ctx.globalCompositeOperation = "destination-out";
        canvas.addEventListener("touchstart", tapstartHandler);
        canvas.addEventListener("touchend", tapendHandler );
        function tapstartHandler(e){
            //$('.tip').hide();
            //��ʼ�ο�����
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

        //���ڴ�С�䶯ʱ����Ҫ���³�ʼ��canvas���ṩ����¼�
        me.$el.one("removeTapEvent.lottery.zwui",function(){
            //console.count('canvas-removeTapEvent');
            canvas.removeEventListener("touchstart", tapstartHandler);
            canvas.removeEventListener("touchend", tapendHandler );
        });
    }

    //ȫ���¼������ڱ䶯ʱ�����³�ʼ��canvas//TODO:Ӧ�üӸ�ʱ�����ƣ�resize�����PC�˴�����ʱ��ִ�����Ⱥܶ�
    $(window).on('resize', function(e){
        me && me.refresh();
    });
};


Lottery.prototype.on = function(){
    var slice = [].slice;
    this.$el.on.apply(this.$el, slice.call(arguments));
};

//���ý�Ʒ����Ʒ������ɺ���ӻ����¼�// thanks :�޽�Ʒ������Ĭ���н�Ʒ
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