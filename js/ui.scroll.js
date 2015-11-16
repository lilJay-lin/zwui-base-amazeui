/**
 * Created by linxiaojie on 2015/11/4.
 */
/**
 * Created by linxiaojie on 2015/10/21.
 */
var $ = require('jquery');
var UI = require('./core');
var supportTransition = UI.support.transition;

var Scroll = function (element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options);

    this.init();
};

Scroll.staticMap = {
    scroll: '.zw-scroll',
    scrolls: '.zw-scrolls',
    scrollItem: '.zw-scroll-item',
    viewport: '.zw-viewport'
};

Scroll.prototype.configMap = {
/*    ������width��Ĭ��ʹ��item���
    �ٷֱ� ����Ϊviewport�İٷֱȿ��*/
    width: 0,
    //ë����Ч�����//��λrem
    filterRightWidth: 0,
    filterLeftWidth: 0,
    radio: 0.5 //����������������
};

Scroll.prototype.stateMap = {
    length: 0,
    $scrolls: null,
    $scrollItem: null,
    offsetX: 0,
    offsetY: 0,
    lastTransform: 0,
    minTransform: 0,
    maxTransform: 0,
    move: 0, //�Ƿ���ƶ�
    check: 0,//�Ƿ�У�鴥������
    delta: {
        x: 0,
        y: 0
    },
    start: {
        x: 0,
        y: 0
    }
};

//Slider��ʼ���
Scroll.prototype.init = function(){
    var me = this,
        static = Scroll.staticMap,
        cfg = me.configMap,
        doc = document.documentElement,
        body = document.body;

    var scrollLeft = doc & doc.scrollLeft || body.scrollLeft || 0;
    var scrollTop = doc & doc.scrollTop || body.scrollTop || 0;

    me.stateMap = $.extend({}, me.stateMap, {
        $scrolls: me.$(static.scrolls),
        $scrollItem: me.$(static.scrollItem),
        $viewport: me.$(static.viewport),
        offsetX: scrollLeft,
        offsetY: scrollTop
    });

    var st = me.stateMap;

    st.length = st.$scrollItem.length

    st.pfx = (function(){
        var transPfxNames = {
            WebkitTransition: '-webkit-',
            MozTransition: '-moz-',
            OTransition: '-o-',
            transition: ''
        };
        for(var name in transPfxNames){
            if(me.$el[0].style[name] != 'undefined'){
                return transPfxNames[name];
            }
        }
    })();

    st.styleTransform = st.pfx === '' ? 'transform' : st.pfx.replace(/-/g,'') + 'Transform';

    function ready(){
        me.addEvent();
        me.stateMap.$scrolls.css('visibility', 'visible');
        me.$el.trigger('show.Scroll.zwui');
    };

    me.$el.on('ready.Scroll.zwui', $.proxy(ready, me));

    this.create();
};

//���slider����ʽ���ý������
Scroll.prototype.create = function(){
    var me = this,
        stateMap = me.stateMap,
        cfg = me.configMap,
        len = stateMap.length,
        width = me.configMap.width;

    if(len > 1){
        var viewportWidth = stateMap.$viewport.width(),
            itemWidth = stateMap.$scrollItem.eq(0).innerWidth();
        //�ٷֱ� ����Ϊviewport�İٷֱȿ��
        if(/%/g.test(width)){
            width = viewportWidth * parseFloat(width) / 100;
        }else{
            //û������width��ʹ��itemWidth
            width = !width ? itemWidth : width * me.getRootSize();
        }


        /*
            ������󳤶ȺͿɻ�������
            ˮƽ���������󻬶����Ϊ - ˮƽ���
            ���һ������Ϊ 0
         */
        var max = len * width + (me.configMap.filterRightWidth + me.configMap.filterLeftWidth) * me.getRootSize();
        //����һ������������minTransform����Ϊ0
        stateMap.minTransform = - ( max > viewportWidth ? max - viewportWidth : 0);
        //console.log(stateMap.minTransform)
        stateMap.maxTransform = 0;

        stateMap.$scrolls.width(max);
        stateMap.$scrollItem.css({
            display: 'block',
            float: 'left',
            width: width + 'px'
        });

        me.$el.trigger('ready.Scroll.zwui');
    }

};

Scroll.prototype.getRootSize = function(){
    var fontSize, $dummy, root = document.documentElement;
    if(!root){
        $dummy = $('<div style="font-size:1rem"/>');
        $(document.body).append($dummy);
        root = $dummy[0];
    }
    fontSize = parseInt(window.getComputedStyle(root).fontSize);

    $dummy && ($dummy.remove());
    return isNaN(fontSize)? 10 : fontSize;
};

Scroll.prototype.addEvent = function(){
    var me = this;
    //me.stateMap.$viewport.on("click",function(){
    //    this.pre();
    //}.bind(this));

    me.$el.on("touchstart.Scroll.zwui", $.proxy(me.startMove, me));
    me.$el.on("touchmove.Scroll.zwui", $.proxy(me.durMove, me));
    me.$el.on("touchend.Scroll.zwui", $.proxy(me.endMove, me));

};

Scroll.prototype.startMove = function(e){
    var me = this,
        start = me.stateMap.start,
        stateMap = me.stateMap;
    if(e.originalEvent){
        e = e.originalEvent;
    }
    var touch = e.touches[0];
    stateMap.lastTransform = me.getTransform();
    start.x = touch.pageX || (touch.clientX + stateMap.offsetX);
    start.y = touch.pageY || (touch.clientY + stateMap.offsetY);

    //console.log(start.x + ' '+ start.y)

    stateMap.move = stateMap.check =  1;
};

Scroll.prototype.durMove = function(e){

    var me = this,
        stateMap = me.stateMap,
        start = stateMap.start,
        delta = stateMap.delta;

    if(!stateMap.move){
        return ;
    }

    if(e.originalEvent){
        e = e.originalEvent;
    }
    var touch = e.changedTouches[e.changedTouches.length - 1];
    var x2 = touch.pageX || (touch.clientX + stateMap.offsetX);
    var y2 = touch.pageY || (touch.clientY + stateMap.offsetY);

    delta.x = x2 - start.x;
    delta.y = y2 - start.y;

    /*    һ����������ֻ�ж�һ�Σ��ж����ĸ�����Ĵ��������slider��ˮƽ����ģ����ֹtouchmove�¼�
     ����ֱ������ƶ�����֮��Ȼ*/
    if(stateMap.check){
        stateMap.move = Math.abs(delta.x) > Math.abs(delta.y);
    }

    stateMap.check = !1;

    if(stateMap.move){
        e.preventDefault();

        var m = stateMap.lastTransform + delta.x * me.configMap.radio;

        //m = m > stateMap.maxTransform ? stateMap.maxTransform
        //    : m < stateMap.minTransform ? stateMap.minTransform : m;
/*        console.log({
            max: stateMap.maxTransform,
            min: stateMap.minTransform,
            m: stateMap.lastTransform,
            x: delta.x,
            total: m
        });*/

        me.position(m, 0);
    }
};

Scroll.prototype.endMove = function(e){
    var me = this,
        stateMap = me.stateMap,
        start = stateMap.start,
        delta = stateMap.delta;

    var m = stateMap.lastTransform + delta.x * me.configMap.radio;

    m = m > stateMap.maxTransform ? stateMap.maxTransform
        : m < stateMap.minTransform ? stateMap.minTransform : m;

    me.position(m, 0);

    stateMap.move = stateMap.check = !1;
    start.x = start.y = delta.x = delta.y = 0;

};

//����tranform
Scroll.prototype.position = function(move, duration, callback){
    var stateMap = this.stateMap,
        $scrolls = stateMap.$scrolls;

    move = isNaN(move) ?  0 : move;

    if(supportTransition){
        $scrolls.css(stateMap.pfx+"transition-duration", (duration / 1000) + 's');
        $scrolls.css(stateMap.pfx+"transform","translate3d("+ move + "px,0,0)");
        //TODO : add vertial transform
    }
};

//��ȡ��ǰtransform�ĳߴ�
Scroll.prototype.getTransform = function(){

 //�޸���ȡtransform ��ios��������ģ�����֮ǰ��sliderд
 //var transformPx = $sliders.data("transform") ?  0 : $sliders.data("transform");
 var temp = this.stateMap.$scrolls[0].style[this.stateMap.styleTransform];

 var t =  temp.length > 0 ? parseInt(temp.split('translate3d(')[1],10) : 0;

 return isNaN(t) ? 0 : t;
 };

Scroll.prototype.$ = function(el){
    return this.$el.find(el);
};

Scroll.prototype.destroy = function(){
    this.$el.off(".Scroll.zwui");
};

var Plugin = function(){

    this.each(function(){
        var $this = $(this),
            el = Scroll.staticMap.scroll;
        var $scroll = $this.is(el) && $this || $this.closest(el);

        var options = UI.utils.parseOptions($scroll.data('scroll'));

        var slider = new Scroll($scroll[0], options);

        return this;
    });

};

$.fn.scroll = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="scroll"]', context).scroll();
});

module.exports = UI.scroll = Scroll;