(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/10/19.
 */

'use strict';

/* jshint -W040 */

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

if (typeof $ === 'undefined') {
    throw new Error('Zw UI 1.x requires jQuery ');
}

var UI = $.ZWUI || {};
var $win = $(window);
var doc = window.document;
var $html = $('html');

UI.VERSION = '1.0.0';

UI.DOMWatchers = [];
UI.DOMReady = false;


UI.support = {};

UI.support.transition = (function() {
    var transitionEnd = (function() {
        // https://developer.mozilla.org/en-US/docs/Web/Events/transitionend#Browser_compatibility
        var element = doc.body || doc.documentElement;
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (element.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }
    })();

    return transitionEnd && {end: transitionEnd};
})();

UI.utils = {};
/* jshint -W054 */
UI.utils.parseOptions = UI.utils.options = function(string) {
    if ($.isPlainObject(string)) {
        return string;
    }

    var start = (string ? string.indexOf('{') : -1);
    var options = {};

    if (start != -1) {
        try {
            options = (new Function('',
                'var json = ' + string.substr(start) +
                '; return JSON.parse(JSON.stringify(json));'))();
        } catch (e) {
        }
    }

    return options;
};

UI.ready = function(callback) {
    UI.DOMWatchers.push(callback);
    if (UI.DOMReady) {
        // console.log('Ready call');
        callback(document);
    }
};

$(function(){

    UI.DOMReady = true;

    // Run default init
    $.each(UI.DOMWatchers, function(i, watcher) {
        watcher(document);
    });

});

module.exports = UI;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/11/3.
 * ��������ͼƬ�����߱�����
 *
 * ҳ������֮��ִ�У�ִֻ��һ�Σ�
 * ����֮���޸ĸ�������ͼƬ��radio������Ч���ֶ�����
 *
 */
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var UI = require('./core');

function scale($el, radio){
    $el = $el.first();
    var w = window.getComputedStyle($el[0]).width;
    if(/%/g.test(w)){
        var parent = $el.parent();
        if(parent.length > 0){
            w = parent.width();
        }
    }else{
        w = parseFloat(w, 10);
    }

	$el.height(w * radio);
}

var Plugin = function(){
    this.each(function(){
        var $this = $(this),
            options;
        options = UI.utils.parseOptions($this.data('scale'));
        scale($this, options && options.radio || 1);

        return this;

    });
}

$.fn.imagescale = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="imagescale"]', context).imagescale();
});

module.exports = UI.imageScale = {
    scale: scale
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],3:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/11/4.
 */
/**
 * Created by linxiaojie on 2015/10/21.
 */
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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
/*    ������width��Ĭ��ʹ��item����
    �ٷֱ� ����Ϊviewport�İٷֱȿ���*/
    width: 0,
    //ë����Ч������//��λrem
    filterWidth: 0,
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
    move: 0, //�Ƿ����ƶ�
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

//Slider��ʼ����
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

//����slider����ʽ���ý�������
Scroll.prototype.create = function(){
    var me = this,
        stateMap = me.stateMap,
        cfg = me.configMap,
        len = stateMap.length,
        width = me.configMap.width;

    if(len > 1){
        var viewportWidth = stateMap.$viewport.width(),
            itemWidth = stateMap.$scrollItem.eq(0).innerWidth();
        //�ٷֱ� ����Ϊviewport�İٷֱȿ���
        if(/%/g.test(width)){
            width = viewportWidth * parseFloat(width) / 100;
        }else{
            //û������width��ʹ��itemWidth
            width = !width ? itemWidth : width * me.getRootSize();
        }


        /*
            �������󳤶ȺͿɻ�������
            ˮƽ���������󻬶�����Ϊ - ˮƽ����
            ���һ�������Ϊ 0
         */
        var max = len * width + me.configMap.filterWidth * me.getRootSize();
        //����һ��������������minTransform����Ϊ0
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

    /*    һ����������ֻ�ж�һ�Σ��ж����ĸ������Ĵ���������slider��ˮƽ�����ģ�����ֹtouchmove�¼�
     ������ֱ�������ƶ�����֮��Ȼ*/
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

 //�޸���ȡtransform ��ios���������ģ�����֮ǰ��sliderд
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],4:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/10/21.
 */
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var UI = require('./core');
var supportTransition =  UI.support.transition;



var Slider = function (element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options);

    this.init();
};

Slider.staticMap = {
    slider: '.zw-slider',
    sliders: '.zw-sliders',
    sliderItem: '.zw-sliders > li',
    viewport: '.zw-viewport',
    activeClass: '.zw-slider-active',
    canSliderPx: 120
};

Slider.prototype.configMap = {
    direction: 'horizontal', //滑动方向
    animateTime: 400, //动画时间
    auto: true, //自动播放
    autoDuration: 2000, //自动播放间隔时间
    defaultActiveIndex: null, //从1开始， max : length
    namespace: 'zw',
    hasControlNav: true
};

Slider.prototype.stateMap = {
    activeIndex: null,
    length: 0,
    transitioning: null,
    $sliders: null,
    $slidersItem: null,
    perMove:0,
    offsetX: 0,
    offsetY: 0,
    move: 0, //是否可移动
    check: 0,//是否校验触摸方向
    delta: {
        x: 0,
        y: 0
    },
    start: {
        x: 0,
        y: 0
    },
    pause: true, //暂停自动播放
    playTimeout: null
};

//Slider初始入口
Slider.prototype.init = function(){
    var me = this,
        static = Slider.staticMap,
        cfg = me.configMap,
        doc = document.documentElement,
        body = document.body;
    var scrollLeft = doc & doc.scrollLeft || body.scrollLeft || 0;
    var scrollTop = doc & doc.scrollTop || body.scrollTop || 0;
    me.stateMap = $.extend({}, me.stateMap, {
        $sliders: me.$(static.sliders),
        $sliderItem: me.$(static.sliderItem),
        $viewport: me.$(static.viewport),
        offsetX: scrollLeft,
        offsetY: scrollTop
    });

    var st = me.stateMap;

    var activeIndex = typeof cfg.defaultActiveIndex === 'number' ? cfg.defaultActiveIndex : 1;
    st.length = st.$sliderItem.length;
    st.activeIndex = activeIndex < 1 ? 1 : activeIndex > st.length ? st.length : activeIndex;

    if(supportTransition){
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

    }

    function ready(){
        me.play();
        me.addEvent();
    };

    me.$el.on('ready.slider.zwui', $.proxy(ready, me));

    this.create();
};

//完成slider的样式设置结果布局
Slider.prototype.create = function(){
    var me = this,
        stateMap = me.stateMap,
        cfg = me.configMap;

    //st.$viewport = $('<div class="' + cfg.namespace + '-viewport" />').appendTo(me.$el).append(st.$sliders);


    if(stateMap.length > 1){

        var addCount = 2;

        //复制前后节点
        stateMap.$sliders.append(me.uniqueId(stateMap.$sliderItem.first().clone().addClass('clone').attr('aria-hidden', 'true')))
            .prepend(me.uniqueId(stateMap.$sliderItem.last().clone().addClass('clone').attr('aria-hidden', 'true')));

        stateMap.$newSliderItem = me.$(Slider.staticMap.sliderItem);
        stateMap.length =  stateMap.$newSliderItem.length;

        var width = typeof stateMap.$viewport == 'undefined' ? me.$el.width() : stateMap.$viewport.width();

        if(cfg.direction === 'horizontal'){
            stateMap.$sliders.width(((addCount + stateMap.length) * 200) + '%');
            stateMap.perMove = width;
            stateMap.$newSliderItem.css({
                //display: 'block',
                visibility: 'visible',
                float: 'left',
                width: width + 'px'
            });
        }else{//Todo: slider vertical
            /*stateMap.$sliders.height(((addCount + stateMap.length) * 200) + '%').css("position", "absolute").width("100%");
             stateMap.$newSliderItem.css({
             display: 'block',
             width: '100%'
             });*/
        }

/*        if(!supportTransition){
            stateMap.$sliders.css({
                position: 'absolute',
                left: '0'
            })
        }*/

        me.position(-width * stateMap.activeIndex , 0);
        me.createControlNav();
        me.setActive(stateMap.activeIndex);

        me.$el.trigger('ready.slider.zwui');
    }

};

Slider.prototype.addEvent = function(){
    var me = this;
    //me.stateMap.$viewport.on("click",function(){
    //    this.pre();
    //}.bind(this));

    me.$el.on("touchstart.slider.zwui", $.proxy(me.startMove, me));
    me.$el.on("touchmove.slider.zwui", $.proxy(me.durMove, me));
    me.$el.on("touchend.slider.zwui", $.proxy(me.endMove, me));

    var callback = $.proxy(function(){
        var me = this,
            length = me.stateMap.length,
            activeIndex = me.stateMap.activeIndex; //Math.abs(me.getTransform() / me.stateMap.perMove) ;

        me.stateMap.transitioning = false;

        var newIndex = me.getNewActiveIndex(activeIndex);

        if(activeIndex !== newIndex ){
            me.setActive(newIndex);
            me.position(-me.stateMap.perMove * newIndex, 0);
        }

        me.$el.trigger("slider.end", newIndex);

    },this);

    if(supportTransition){
        me.stateMap.$sliders.on(supportTransition.end, callback);
    }
};


/* active 为最后一张（clone)，重置为第一张的位置
 active 为第0张(clone),重置为倒数第二张*/
Slider.prototype.getNewActiveIndex = function(idx){
    var me = this,
        len = me.stateMap.length;
    if(idx == len -1 ){
        idx = 1;
    }else if(idx == 0 ){
        idx = len - 2;
    }
    return idx;
};

/*Slider.prototype.doMath = function(){
 var me = this,
 cfg = me.configMap,
 direction = cfg.direction,
 stateMap = me.stateMap;
 stateMap.$slidersItem = me.$(Slider.staticMap.sliderItem);
 stateMap.length =  stateMap.$slidersItem.length;

 var width = typeof stateMap.$viewport == 'undefined' ? me.$el.width() : stateMap.$viewport.width();

 if(direction === 'horizontal'){
 stateMap.perMove = width;
 stateMap.$slidersItem.css({
 display: 'block',
 float: 'left',
 width: width + 'px'
 });
 me.position(-width * stateMap.activeIndex , 0);
 me.setActive(stateMap.activeIndex);
 }
 };*/

Slider.prototype.startMove = function(e){
    var me = this,
        start = me.stateMap.start,
        stateMap = me.stateMap;

    //暂停自动播放
    me.pausePlay();

    if(stateMap.transitioning){
        return ;
    }


    if(e.originalEvent){
        e = e.originalEvent;
    }
    var touch = e.touches[0];
    start.x = touch.pageX || (touch.clientX + stateMap.offsetX);
    start.y = touch.pageY || (touch.clientY + stateMap.offsetY);

    stateMap.move = stateMap.check =  1;
};

Slider.prototype.durMove = function(e){

    var me = this,
        stateMap = me.stateMap,
        start = stateMap.start,
        delta = stateMap.delta,
        dir = me.configMap.direction;

    if(stateMap.transitioning || !stateMap.move){
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

    /*    一个触摸过程只判断一次，判断是哪个方向的触摸，如果slider是水平方向的，则禁止touchmove事件
     处理垂直方向的移动，反之亦然*/
    if(stateMap.check){
        var t = Math.abs(delta.x) > Math.abs(delta.y);
        stateMap.move = dir === 'horizontal' ? t
            : !t;
    }

    stateMap.check = !1;

    if(stateMap.move){
        e.preventDefault();

        var m = - stateMap.activeIndex * stateMap.perMove +
            (dir === 'horizontal' ? delta.x : delta.y);

        me.position(m, 0);
    }
};

Slider.prototype.endMove = function(e){
    var me = this,
        stateMap = me.stateMap,
        start = stateMap.start,
        delta = stateMap.delta;

    //开始自动播放
    me.play();

    var distance = me.configMap.direction === 'horizontal' ? Math.abs(delta.x) : Math.abs(delta.y);
    var val = me.configMap.direction === 'horizontal' ? delta.x : delta.y;

    if(stateMap.move && distance > Slider.staticMap.canSliderPx){
        if(val > 0 ){
            me.pre();
        }else{
            me.next();
        }
    }else{
        var m = - stateMap.activeIndex * stateMap.perMove;
        me.position(m, 0);
    }

    stateMap.move = stateMap.check = !1;
    start.x = start.y = delta.x = delta.y = 0;

};

Slider.prototype.autoPlay  = function(){
    var me = this,
        cfg = me.configMap;

    if(!me.stateMap.pause){
        clearTimeout(me.stateMap.playTimeout);
        var cb = $.proxy(function(){
            //console.count('timeoutplay');
            this.stateMap.playTimeout = null;
            if(!this.stateMap.pause){
                this.next();
                this.autoPlay();
            }
        },me);
        var duration = cfg.animateTime + cfg.autoDuration ;
        me.stateMap.playTimeout = setTimeout(cb, duration);
    }
};

Slider.prototype.play = function(){
    var me = this;

    if(me.configMap.auto && me.stateMap.pause){
        me.stateMap.pause = false;
        me.autoPlay();
    }

};

Slider.prototype.pausePlay = function(){
    var me = this;

    clearTimeout(me.stateMap.playTimeout);

    me.stateMap.pause = true;
};

Slider.prototype.pre = function(){
    var me = this,
        stateMap = this.stateMap,
        activeIndex = stateMap.activeIndex;

    //不用判断是否超出length有效值，动画结束之后会判断如果为最后一张或第一张，重置位置
    activeIndex -- ;


    if(!!stateMap.transitioning){
        return ;
    }

    var move = - stateMap.perMove * activeIndex;

    me.setActive(activeIndex);
    me.position(move, me.configMap.animateTime);
};

Slider.prototype.next = function(){
    var me = this,
        stateMap = this.stateMap,
        activeIndex = stateMap.activeIndex;

    //不用判断是否超出length有效值，动画结束之后会判断如果为最后一张或第一张，重置位置
    activeIndex ++ ;


    if(!!stateMap.transitioning){
        return ;
    }

    var move = - stateMap.perMove * activeIndex;

    me.setActive(activeIndex);
    me.position(move, me.configMap.animateTime);
};


//设置activeIndex 和 activeClass
Slider.prototype.setActive = function (index){
    var me = this,
        stateMap = me.stateMap,
        activeClass = Slider.staticMap.activeClass;

    stateMap.activeIndex = index;
    stateMap.$newSliderItem.removeClass(activeClass);
    stateMap.$newSliderItem.eq(index).addClass(activeClass);

    if(me.configMap.hasControlNav){
        me.$el.trigger("switchControlNav.slider.zwui", index);
    }

};

//设置tranform
Slider.prototype.position = function(move, duration, callback){
    var me = this,
        stateMap = this.stateMap,
        $sliders = stateMap.$sliders;

    if(!!me.stateMap.transitioning){
        return ;
    }

    me.stateMap.transitioning =  duration === 0 ? false : true;

    move = isNaN(move) ?  0 : move;

    if(supportTransition){
        $sliders.css(stateMap.pfx+"transition-duration", (duration / 1000) + 's');
        $sliders.css(stateMap.pfx+"transform","translate3d("+ move + "px,0,0)");
        //TODO : add vertial transform
    }else{//TODO : add unsupportTransition deal : support to ie8 +
/*        $sliders.animate({
            left: move + 'px'
        },duration,function(){
            me.stateMap.transitioning = false;
        })*/
    }
};


//底部导航
Slider.prototype.createControlNav = function(){
    var me = this,
        stateMap = me.stateMap;

    if(!me.configMap.hasControlNav){
        return ;
    }
    var $controlNav = $('<ol class="' + me.configMap.namespace + '-control-nav '  + '"></ol>');

    var l = stateMap.$sliderItem.length,
        i = 0;
    for(;i<l;i++){
        $controlNav.append('<li><a data-index = ' + (i + 1) + '>' + (i + 1) + '</a></li>');
    }

    stateMap.$viewport.append($controlNav);
    stateMap.$controlNavItem = $controlNav.find('li a');

    function switchControlNavManal(e){
        e.preventDefault();
        if(e.originalEvent){
            e = e.originalEvent;
        }
        var me = this,
            _$this = $(e.target);

        var index = _$this.data('index');

        if(!isNaN(index) && !this.stateMap.transitioning){
            var cur = me.stateMap.activeIndex;
            if(cur === index){
                return ;
            }
            //暂停自动播放
            me.pausePlay();

            me.stateMap.$controlNavItem.removeClass('zw-active');
            _$this.addClass('zw-active');
            me.setActive(index);
            me.position(-me.stateMap.perMove * index , me.configMap.animateTime);
        }

        return false;
    };

    function switchControlNavAuto(e, index){

        var len = this.stateMap.length;

        index = this.getNewActiveIndex(index) - 1;

        this.stateMap.$controlNavItem.removeClass('zw-active');
        this.stateMap.$controlNavItem.eq(index).addClass('zw-active');

    };

    me.$el.on("touchstart.slider.zwui", '.zw-control-nav a' , $.proxy(switchControlNavManal, me));
    me.$el.on("switchControlNav.slider.zwui", $.proxy(switchControlNavAuto, me));
};

//获取当前transform的尺寸
/*Slider.prototype.getTransform = function(){

 //修改下取transform ，ios会有问题的，按照之前的slider写
 //var transformPx = $sliders.data("transform") ?  0 : $sliders.data("transform");
 var temp = this.stateMap.$sliders[0].style[this.stateMap.styleTransform];

 var t =  temp.length > 0 ? parseInt(temp.split('translate3d(')[1],10) : 0;

 return isNaN(t) ? 0 : t;
 };*/

//复制的节点加唯一id
Slider.prototype.uniqueId = function($clone) {
    // Append _clone to current level and children elements with id attributes
    $clone.filter('[id]').add($clone.find('[id]')).each(function() {
        var $this = $(this);
        $this.attr('id', $this.attr('id') + '_clone');
    });
    return $clone;
};

Slider.prototype.$ = function(el){
    return this.$el.find(el);
};

Slider.prototype.destroy = function(){
    this.$el.off(".slider.zwui");
    this.stateMap.$sliders.off(supportTransition.end);
    if(this.staticMap.playTimeout){
        clearTimeout(this.staticMap.playTimeout);
    }
};

var Plugin = function(){

    this.each(function(){
        var $this = $(this),
            el = Slider.staticMap.slider;
        var $slider = $this.is(el) && $this || $this.closest(el);

        var options = UI.utils.parseOptions($slider.data('slider'));

        var slider = new Slider($slider[0], options);

        return this;
    });

};

$.fn.slider = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="slider"]', context).slider();
});

module.exports = UI.slider = Slider;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],5:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/10/19.
 */
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var UI = require('./core');
var supportTransition = UI.support.transition;

var Tabs = function(element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options || {});
    this.init();
    this.addEvent();
};

Tabs.staticMap = {
    tabs: '.zw-tabs',
    activeClass: 'zw-active',
    tabNav: '.zw-tabs-nav',
    tabNavItem: '.zw-tabs-nav > li',
    nav: '.zw-tabs-nav a',
    tabPanel: '.zw-tab-panel'
};

Tabs.prototype.configMap = {
    defaultActiveIndex: null
};

Tabs.prototype.stateMap = {
    activeIndex: null,
    transitioning: null
};

Tabs.prototype.$ = function(el){
    return this.$el.find(el);
}
Tabs.prototype.init = function(){
    var me = this,
        cfg = Tabs.staticMap,
        idx = me.configMap.defaultActiveIndex,
        activeIndex = idx ? idx : 0;

    me.stateMap = {
        $tabNav: me.$(cfg.tabNav),
        $tabNavItem: me.$(cfg.tabNavItem),
        $nav: me.$(cfg.nav),
        $tabPanel: me.$(cfg.tabPanel)
    };

/*    var curNav = me.stateMap.$tabNav.find("." + cfg.activeClass);*/

    //样式是否指定了active Class ://默认使用配置，无配置显示第一个
/*    if(curNav.length > 0 ){
        index = me.stateMap.$tabNavItem.index(curNav.first());
    }*/
    var len = me.stateMap.$tabNavItem.length;
    activeIndex = activeIndex > len - 1 ? len - 1 : activeIndex;

    me.goto(activeIndex);
};

Tabs.prototype.addEvent = function(){
    var me = this,
        cfg = Tabs.staticMap;
    var stateMap = this.stateMap;

    me.$el.on("touchstart.tabs.zwui", cfg.nav, function(e){
        e.preventDefault();
        me.goto($(this))
    });

};

/*Tabs.prototype.open = function($nav){
    var me = this;
    if(!$nav
        || !$nav.length
        || me.transitioning
        || $nav.parent('li').hasClass(Tabs.staticMap.activeClass)){
        return ;
    }

    var index = me.stateMap.nav.index($nav);

    if(~index){
        me.goto(index);
    }
};*/

Tabs.prototype.goto = function ($nav){

    var me = this,
        index = typeof $nav === 'number' ? $nav : me.stateMap.$nav.index($nav);

    $nav = typeof $nav === 'number' ? me.stateMap.$nav.eq(index) : $($nav);

    if(!$nav
        || !$nav.length
        || me.transitioning
        || $nav.parent('li').hasClass(Tabs.staticMap.activeClass)){
        return ;
    }

    this.transitioning = true;
    this.switchNav(index);
    this.switchPanel(index);
};

Tabs.prototype.switchNav = function(index){
    var stMap = this.stateMap,
        cfg = Tabs.staticMap;
    stMap.$tabNavItem.removeClass(cfg.activeClass);
    stMap.$tabNavItem.eq(index).addClass(cfg.activeClass);
    stMap.activeIndex = index;
};

Tabs.prototype.switchPanel = function(index){
    var stMap = this.stateMap,
        cfg = Tabs.staticMap;
    var $activeNav = stMap.$tabPanel.eq(index);
    stMap.$tabPanel.removeClass(cfg.activeClass);
    stMap.$tabPanel.eq(index).addClass(cfg.activeClass);
    stMap.activeIndex = index;

    var callback = $.proxy(function(){
        this.transitioning = false;
    },this);

    supportTransition ? $activeNav.one(supportTransition.end, callback) : callback;
};

Tabs.prototype.destroy = function(){
  this.$el.off(".tabs.zwui");
};

var Plugin = function(){
    this.each(function(){
        var $this = $(this),
            el = Tabs.staticMap.tabs,
            options;
        var $tabs = $this.is(el) && $this || $this.closest(el);

        options = UI.utils.parseOptions($tabs.data('tabs'));

        var tabs = new Tabs($tabs[0], options);

        return this;

    });
}

$.fn.tabs = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="tabs"]', context).tabs();
});

module.exports = UI.tabs = Tabs;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],6:[function(require,module,exports){
var UI = require("./core")
require("./ui.imagescale")
require("./ui.scroll")
require("./ui.slider")
require("./ui.tabs")

module.exports = $.ZWUI = UI;

},{"./core":1,"./ui.imagescale":2,"./ui.scroll":3,"./ui.slider":4,"./ui.tabs":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb3JlLmpzIiwianMvdWkuaW1hZ2VzY2FsZS5qcyIsImpzL3VpLnNjcm9sbC5qcyIsImpzL3VpLnNsaWRlci5qcyIsImpzL3VpLnRhYnMuanMiLCJqcy96d3VpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3BqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMC8xOS5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKiBqc2hpbnQgLVcwNDAgKi9cclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcclxuXHJcbmlmICh0eXBlb2YgJCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignWncgVUkgMS54IHJlcXVpcmVzIGpRdWVyeSAnKTtcclxufVxyXG5cclxudmFyIFVJID0gJC5aV1VJIHx8IHt9O1xyXG52YXIgJHdpbiA9ICQod2luZG93KTtcclxudmFyIGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcclxudmFyICRodG1sID0gJCgnaHRtbCcpO1xyXG5cclxuVUkuVkVSU0lPTiA9ICd7e1ZFUlNJT059fSc7XHJcblxyXG5VSS5ET01XYXRjaGVycyA9IFtdO1xyXG5VSS5ET01SZWFkeSA9IGZhbHNlO1xyXG5cclxuXHJcblVJLnN1cHBvcnQgPSB7fTtcclxuXHJcblVJLnN1cHBvcnQudHJhbnNpdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICAgIHZhciB0cmFuc2l0aW9uRW5kID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy90cmFuc2l0aW9uZW5kI0Jyb3dzZXJfY29tcGF0aWJpbGl0eVxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jLmJvZHkgfHwgZG9jLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG4gICAgICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgICAgICAgIE1velRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIHJldHVybiB0cmFuc2l0aW9uRW5kICYmIHtlbmQ6IHRyYW5zaXRpb25FbmR9O1xyXG59KSgpO1xyXG5cclxuVUkudXRpbHMgPSB7fTtcclxuLyoganNoaW50IC1XMDU0ICovXHJcblVJLnV0aWxzLnBhcnNlT3B0aW9ucyA9IFVJLnV0aWxzLm9wdGlvbnMgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIGlmICgkLmlzUGxhaW5PYmplY3Qoc3RyaW5nKSkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXJ0ID0gKHN0cmluZyA/IHN0cmluZy5pbmRleE9mKCd7JykgOiAtMSk7XHJcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIGlmIChzdGFydCAhPSAtMSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAobmV3IEZ1bmN0aW9uKCcnLFxyXG4gICAgICAgICAgICAgICAgJ3ZhciBqc29uID0gJyArIHN0cmluZy5zdWJzdHIoc3RhcnQpICtcclxuICAgICAgICAgICAgICAgICc7IHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGpzb24pKTsnKSkoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvcHRpb25zO1xyXG59O1xyXG5cclxuVUkucmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgVUkuRE9NV2F0Y2hlcnMucHVzaChjYWxsYmFjayk7XHJcbiAgICBpZiAoVUkuRE9NUmVhZHkpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnUmVhZHkgY2FsbCcpO1xyXG4gICAgICAgIGNhbGxiYWNrKGRvY3VtZW50KTtcclxuICAgIH1cclxufTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBVSS5ET01SZWFkeSA9IHRydWU7XHJcblxyXG4gICAgLy8gUnVuIGRlZmF1bHQgaW5pdFxyXG4gICAgJC5lYWNoKFVJLkRPTVdhdGNoZXJzLCBmdW5jdGlvbihpLCB3YXRjaGVyKSB7XHJcbiAgICAgICAgd2F0Y2hlcihkb2N1bWVudCk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBsaW54aWFvamllIG9uIDIwMTUvMTEvMy5cclxuICog77+977+977+977+977+977+977+977+9zbzGrO+/ve+/ve+/ve+/ve+/vd+x77+977+977+977+977+9XHJcbiAqXHJcbiAqINKz77+977+977+977+977+977+91q7vv73vv73WtO+/vdCj77+91rvWtO+/ve+/vdK777+9zqPvv71cclxuICog77+977+977+977+91q7vv73vv73vv73euMS477+977+977+977+977+977+977+9zbzGrO+/ve+/vXJhZGlv77+977+977+977+977+977+90Kfvv73vv73vv73Wtu+/ve+/ve+/ve+/ve+/vVxyXG4gKlxyXG4gKi9cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL2NvcmUnKTtcclxuXHJcbmZ1bmN0aW9uIHNjYWxlKCRlbCwgcmFkaW8pe1xyXG4gICAgJGVsID0gJGVsLmZpcnN0KCk7XHJcbiAgICB2YXIgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCRlbFswXSkud2lkdGg7XHJcbiAgICBpZigvJS9nLnRlc3Qodykpe1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgaWYocGFyZW50Lmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICB3ID0gcGFyZW50LndpZHRoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgdyA9IHBhcnNlRmxvYXQodywgMTApO1xyXG4gICAgfVxyXG5cclxuXHQkZWwuaGVpZ2h0KHcgKiByYWRpbyk7XHJcbn1cclxuXHJcbnZhciBQbHVnaW4gPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgb3B0aW9ucztcclxuICAgICAgICBvcHRpb25zID0gVUkudXRpbHMucGFyc2VPcHRpb25zKCR0aGlzLmRhdGEoJ3NjYWxlJykpO1xyXG4gICAgICAgIHNjYWxlKCR0aGlzLCBvcHRpb25zICYmIG9wdGlvbnMucmFkaW8gfHwgMSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0pO1xyXG59XHJcblxyXG4kLmZuLmltYWdlc2NhbGUgPSBQbHVnaW47XHJcblxyXG5VSS5yZWFkeShmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICQoJ1tkYXRhLXp3LXdpZGdldD1cImltYWdlc2NhbGVcIl0nLCBjb250ZXh0KS5pbWFnZXNjYWxlKCk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSS5pbWFnZVNjYWxlID0ge1xyXG4gICAgc2NhbGU6IHNjYWxlXHJcbn07IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGlueGlhb2ppZSBvbiAyMDE1LzExLzQuXHJcbiAqL1xyXG4vKipcclxuICogQ3JlYXRlZCBieSBsaW54aWFvamllIG9uIDIwMTUvMTAvMjEuXHJcbiAqL1xyXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vY29yZScpO1xyXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSBVSS5zdXBwb3J0LnRyYW5zaXRpb247XHJcblxyXG52YXIgU2Nyb2xsID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWwgPSAkKGVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuY29uZmlnTWFwID0gJC5leHRlbmQoe30sIHRoaXMuY29uZmlnTWFwLCBvcHRpb25zKTtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxufTtcclxuXHJcblNjcm9sbC5zdGF0aWNNYXAgPSB7XHJcbiAgICBzY3JvbGw6ICcuenctc2Nyb2xsJyxcclxuICAgIHNjcm9sbHM6ICcuenctc2Nyb2xscycsXHJcbiAgICBzY3JvbGxJdGVtOiAnLnp3LXNjcm9sbC1pdGVtJyxcclxuICAgIHZpZXdwb3J0OiAnLnp3LXZpZXdwb3J0J1xyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5jb25maWdNYXAgPSB7XHJcbi8qICAgIO+/ve+/ve+/ve+/ve+/ve+/vXdpZHRo77+977+9xKzvv73vv73Kue+/ve+/vWl0ZW3vv73vv73vv73vv71cclxuICAgIO+/vdm31rHvv70g77+977+977+977+9zqp2aWV3cG9ydO+/vcSw2bfWsci/77+977+977+9Ki9cclxuICAgIHdpZHRoOiAwLFxyXG4gICAgLy/Dq++/ve+/ve+/ve+/vdCn77+977+977+977+977+977+9Ly/vv73vv73Ou3JlbVxyXG4gICAgZmlsdGVyV2lkdGg6IDAsXHJcbiAgICByYWRpbzogMC41IC8v77+977+977+977+977+977+977+977+977+977+977+977+977+977+977+977+9XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLnN0YXRlTWFwID0ge1xyXG4gICAgbGVuZ3RoOiAwLFxyXG4gICAgJHNjcm9sbHM6IG51bGwsXHJcbiAgICAkc2Nyb2xsSXRlbTogbnVsbCxcclxuICAgIG9mZnNldFg6IDAsXHJcbiAgICBvZmZzZXRZOiAwLFxyXG4gICAgbGFzdFRyYW5zZm9ybTogMCxcclxuICAgIG1pblRyYW5zZm9ybTogMCxcclxuICAgIG1heFRyYW5zZm9ybTogMCxcclxuICAgIG1vdmU6IDAsIC8v77+9x7fvv73vv73vv73vv73Gtu+/vVxyXG4gICAgY2hlY2s6IDAsLy/vv73Ht++/vdCj77+96bSl77+977+977+977+977+977+9XHJcbiAgICBkZWx0YToge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfSxcclxuICAgIHN0YXJ0OiB7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwXHJcbiAgICB9XHJcbn07XHJcblxyXG4vL1NsaWRlcu+/ve+/vcq877+977+977+977+9XHJcblNjcm9sbC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRpYyA9IFNjcm9sbC5zdGF0aWNNYXAsXHJcbiAgICAgICAgY2ZnID0gbWUuY29uZmlnTWFwLFxyXG4gICAgICAgIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IGRvYyAmIGRvYy5zY3JvbGxMZWZ0IHx8IGJvZHkuc2Nyb2xsTGVmdCB8fCAwO1xyXG4gICAgdmFyIHNjcm9sbFRvcCA9IGRvYyAmIGRvYy5zY3JvbGxUb3AgfHwgYm9keS5zY3JvbGxUb3AgfHwgMDtcclxuXHJcbiAgICBtZS5zdGF0ZU1hcCA9ICQuZXh0ZW5kKHt9LCBtZS5zdGF0ZU1hcCwge1xyXG4gICAgICAgICRzY3JvbGxzOiBtZS4kKHN0YXRpYy5zY3JvbGxzKSxcclxuICAgICAgICAkc2Nyb2xsSXRlbTogbWUuJChzdGF0aWMuc2Nyb2xsSXRlbSksXHJcbiAgICAgICAgJHZpZXdwb3J0OiBtZS4kKHN0YXRpYy52aWV3cG9ydCksXHJcbiAgICAgICAgb2Zmc2V0WDogc2Nyb2xsTGVmdCxcclxuICAgICAgICBvZmZzZXRZOiBzY3JvbGxUb3BcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBzdCA9IG1lLnN0YXRlTWFwO1xyXG5cclxuICAgIHN0Lmxlbmd0aCA9IHN0LiRzY3JvbGxJdGVtLmxlbmd0aFxyXG5cclxuICAgIHN0LnBmeCA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciB0cmFuc1BmeE5hbWVzID0ge1xyXG4gICAgICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnLXdlYmtpdC0nLFxyXG4gICAgICAgICAgICBNb3pUcmFuc2l0aW9uOiAnLW1vei0nLFxyXG4gICAgICAgICAgICBPVHJhbnNpdGlvbjogJy1vLScsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICcnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3IodmFyIG5hbWUgaW4gdHJhbnNQZnhOYW1lcyl7XHJcbiAgICAgICAgICAgIGlmKG1lLiRlbFswXS5zdHlsZVtuYW1lXSAhPSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNQZnhOYW1lc1tuYW1lXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pKCk7XHJcblxyXG4gICAgc3Quc3R5bGVUcmFuc2Zvcm0gPSBzdC5wZnggPT09ICcnID8gJ3RyYW5zZm9ybScgOiBzdC5wZngucmVwbGFjZSgvLS9nLCcnKSArICdUcmFuc2Zvcm0nO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlYWR5KCl7XHJcbiAgICAgICAgbWUuYWRkRXZlbnQoKTtcclxuICAgICAgICBtZS5zdGF0ZU1hcC4kc2Nyb2xscy5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xyXG4gICAgICAgIG1lLiRlbC50cmlnZ2VyKCdzaG93LlNjcm9sbC56d3VpJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1lLiRlbC5vbigncmVhZHkuU2Nyb2xsLnp3dWknLCAkLnByb3h5KHJlYWR5LCBtZSkpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlKCk7XHJcbn07XHJcblxyXG4vL++/ve+/ve+/ve+/vXNsaWRlcu+/ve+/ve+/ve+/vcq977+977+977+9w73vv73vv73vv73vv73vv73vv73vv71cclxuU2Nyb2xsLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIGNmZyA9IG1lLmNvbmZpZ01hcCxcclxuICAgICAgICBsZW4gPSBzdGF0ZU1hcC5sZW5ndGgsXHJcbiAgICAgICAgd2lkdGggPSBtZS5jb25maWdNYXAud2lkdGg7XHJcblxyXG4gICAgaWYobGVuID4gMSl7XHJcbiAgICAgICAgdmFyIHZpZXdwb3J0V2lkdGggPSBzdGF0ZU1hcC4kdmlld3BvcnQud2lkdGgoKSxcclxuICAgICAgICAgICAgaXRlbVdpZHRoID0gc3RhdGVNYXAuJHNjcm9sbEl0ZW0uZXEoMCkuaW5uZXJXaWR0aCgpO1xyXG4gICAgICAgIC8v77+92bfWse+/vSDvv73vv73vv73vv73OqnZpZXdwb3J077+9xLDZt9axyL/vv73vv73vv71cclxuICAgICAgICBpZigvJS9nLnRlc3Qod2lkdGgpKXtcclxuICAgICAgICAgICAgd2lkdGggPSB2aWV3cG9ydFdpZHRoICogcGFyc2VGbG9hdCh3aWR0aCkgLyAxMDA7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIC8vw7vvv73vv73vv73vv73vv73vv713aWR0aO+/ve+/vcq577+977+9aXRlbVdpZHRoXHJcbiAgICAgICAgICAgIHdpZHRoID0gIXdpZHRoID8gaXRlbVdpZHRoIDogd2lkdGggKiBtZS5nZXRSb290U2l6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICAgIO+/ve+/ve+/ve+/ve+/ve+/ve+/vfOzpLbIus2/ybvvv73vv73vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgy67Gve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vfO7rLbvv73vv73vv73vv73vv73OqiAtIMuuxr3vv73vv73vv73vv71cclxuICAgICAgICAgICAg77+977+977+90rvvv73vv73vv73vv73vv73vv73vv73OqiAwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIG1heCA9IGxlbiAqIHdpZHRoICsgbWUuY29uZmlnTWFwLmZpbHRlcldpZHRoICogbWUuZ2V0Um9vdFNpemUoKTtcclxuICAgICAgICAvL++/ve+/ve+/ve+/vdK777+977+977+977+977+977+977+977+977+977+977+977+977+977+9bWluVHJhbnNmb3Jt77+977+977+977+9zqowXHJcbiAgICAgICAgc3RhdGVNYXAubWluVHJhbnNmb3JtID0gLSAoIG1heCA+IHZpZXdwb3J0V2lkdGggPyBtYXggLSB2aWV3cG9ydFdpZHRoIDogMCk7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzdGF0ZU1hcC5taW5UcmFuc2Zvcm0pXHJcbiAgICAgICAgc3RhdGVNYXAubWF4VHJhbnNmb3JtID0gMDtcclxuXHJcbiAgICAgICAgc3RhdGVNYXAuJHNjcm9sbHMud2lkdGgobWF4KTtcclxuICAgICAgICBzdGF0ZU1hcC4kc2Nyb2xsSXRlbS5jc3Moe1xyXG4gICAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxyXG4gICAgICAgICAgICBmbG9hdDogJ2xlZnQnLFxyXG4gICAgICAgICAgICB3aWR0aDogd2lkdGggKyAncHgnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1lLiRlbC50cmlnZ2VyKCdyZWFkeS5TY3JvbGwuend1aScpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuZ2V0Um9vdFNpemUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGZvbnRTaXplLCAkZHVtbXksIHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICBpZighcm9vdCl7XHJcbiAgICAgICAgJGR1bW15ID0gJCgnPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxcmVtXCIvPicpO1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKCRkdW1teSk7XHJcbiAgICAgICAgcm9vdCA9ICRkdW1teVswXTtcclxuICAgIH1cclxuICAgIGZvbnRTaXplID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUocm9vdCkuZm9udFNpemUpO1xyXG5cclxuICAgICRkdW1teSAmJiAoJGR1bW15LnJlbW92ZSgpKTtcclxuICAgIHJldHVybiBpc05hTihmb250U2l6ZSk/IDEwIDogZm9udFNpemU7XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLmFkZEV2ZW50ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAvL21lLnN0YXRlTWFwLiR2aWV3cG9ydC5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcclxuICAgIC8vICAgIHRoaXMucHJlKCk7XHJcbiAgICAvL30uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hzdGFydC5TY3JvbGwuend1aVwiLCAkLnByb3h5KG1lLnN0YXJ0TW92ZSwgbWUpKTtcclxuICAgIG1lLiRlbC5vbihcInRvdWNobW92ZS5TY3JvbGwuend1aVwiLCAkLnByb3h5KG1lLmR1ck1vdmUsIG1lKSk7XHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaGVuZC5TY3JvbGwuend1aVwiLCAkLnByb3h5KG1lLmVuZE1vdmUsIG1lKSk7XHJcblxyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5zdGFydE1vdmUgPSBmdW5jdGlvbihlKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhcnQgPSBtZS5zdGF0ZU1hcC5zdGFydCxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwO1xyXG4gICAgaWYoZS5vcmlnaW5hbEV2ZW50KXtcclxuICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgfVxyXG4gICAgdmFyIHRvdWNoID0gZS50b3VjaGVzWzBdO1xyXG4gICAgc3RhdGVNYXAubGFzdFRyYW5zZm9ybSA9IG1lLmdldFRyYW5zZm9ybSgpO1xyXG4gICAgc3RhcnQueCA9IHRvdWNoLnBhZ2VYIHx8ICh0b3VjaC5jbGllbnRYICsgc3RhdGVNYXAub2Zmc2V0WCk7XHJcbiAgICBzdGFydC55ID0gdG91Y2gucGFnZVkgfHwgKHRvdWNoLmNsaWVudFkgKyBzdGF0ZU1hcC5vZmZzZXRZKTtcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0LnggKyAnICcrIHN0YXJ0LnkpXHJcblxyXG4gICAgc3RhdGVNYXAubW92ZSA9IHN0YXRlTWFwLmNoZWNrID0gIDE7XHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLmR1ck1vdmUgPSBmdW5jdGlvbihlKXtcclxuXHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gbWUuc3RhdGVNYXAsXHJcbiAgICAgICAgc3RhcnQgPSBzdGF0ZU1hcC5zdGFydCxcclxuICAgICAgICBkZWx0YSA9IHN0YXRlTWFwLmRlbHRhO1xyXG5cclxuICAgIGlmKCFzdGF0ZU1hcC5tb3ZlKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGUub3JpZ2luYWxFdmVudCl7XHJcbiAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcclxuICAgIH1cclxuICAgIHZhciB0b3VjaCA9IGUuY2hhbmdlZFRvdWNoZXNbZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggLSAxXTtcclxuICAgIHZhciB4MiA9IHRvdWNoLnBhZ2VYIHx8ICh0b3VjaC5jbGllbnRYICsgc3RhdGVNYXAub2Zmc2V0WCk7XHJcbiAgICB2YXIgeTIgPSB0b3VjaC5wYWdlWSB8fCAodG91Y2guY2xpZW50WSArIHN0YXRlTWFwLm9mZnNldFkpO1xyXG5cclxuICAgIGRlbHRhLnggPSB4MiAtIHN0YXJ0Lng7XHJcbiAgICBkZWx0YS55ID0geTIgLSBzdGFydC55O1xyXG5cclxuICAgIC8qICAgINK777+977+977+977+977+977+977+977+977+977+91rvvv73Qtu+/vdK777+9zqPvv73vv73Qtu+/ve+/ve+/ve+/vcS477+977+977+977+977+977+9xLTvv73vv73vv73vv73vv73vv73vv73vv73vv71zbGlkZXLvv73vv73Lrsa977+977+977+977+977+9xKPvv73vv73vv73vv73vv73WuXRvdWNobW92Ze+/vcK877+9XHJcbiAgICAg77+977+977+977+977+977+91rHvv73vv73vv73vv73vv73vv73vv73Gtu+/ve+/ve+/ve+/ve+/vdau77+977+9yLsqL1xyXG4gICAgaWYoc3RhdGVNYXAuY2hlY2spe1xyXG4gICAgICAgIHN0YXRlTWFwLm1vdmUgPSBNYXRoLmFicyhkZWx0YS54KSA+IE1hdGguYWJzKGRlbHRhLnkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRlTWFwLmNoZWNrID0gITE7XHJcblxyXG4gICAgaWYoc3RhdGVNYXAubW92ZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB2YXIgbSA9IHN0YXRlTWFwLmxhc3RUcmFuc2Zvcm0gKyBkZWx0YS54ICogbWUuY29uZmlnTWFwLnJhZGlvO1xyXG5cclxuICAgICAgICAvL20gPSBtID4gc3RhdGVNYXAubWF4VHJhbnNmb3JtID8gc3RhdGVNYXAubWF4VHJhbnNmb3JtXHJcbiAgICAgICAgLy8gICAgOiBtIDwgc3RhdGVNYXAubWluVHJhbnNmb3JtID8gc3RhdGVNYXAubWluVHJhbnNmb3JtIDogbTtcclxuLyogICAgICAgIGNvbnNvbGUubG9nKHtcclxuICAgICAgICAgICAgbWF4OiBzdGF0ZU1hcC5tYXhUcmFuc2Zvcm0sXHJcbiAgICAgICAgICAgIG1pbjogc3RhdGVNYXAubWluVHJhbnNmb3JtLFxyXG4gICAgICAgICAgICBtOiBzdGF0ZU1hcC5sYXN0VHJhbnNmb3JtLFxyXG4gICAgICAgICAgICB4OiBkZWx0YS54LFxyXG4gICAgICAgICAgICB0b3RhbDogbVxyXG4gICAgICAgIH0pOyovXHJcblxyXG4gICAgICAgIG1lLnBvc2l0aW9uKG0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5lbmRNb3ZlID0gZnVuY3Rpb24oZSl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gbWUuc3RhdGVNYXAsXHJcbiAgICAgICAgc3RhcnQgPSBzdGF0ZU1hcC5zdGFydCxcclxuICAgICAgICBkZWx0YSA9IHN0YXRlTWFwLmRlbHRhO1xyXG5cclxuICAgIHZhciBtID0gc3RhdGVNYXAubGFzdFRyYW5zZm9ybSArIGRlbHRhLnggKiBtZS5jb25maWdNYXAucmFkaW87XHJcblxyXG4gICAgbSA9IG0gPiBzdGF0ZU1hcC5tYXhUcmFuc2Zvcm0gPyBzdGF0ZU1hcC5tYXhUcmFuc2Zvcm1cclxuICAgICAgICA6IG0gPCBzdGF0ZU1hcC5taW5UcmFuc2Zvcm0gPyBzdGF0ZU1hcC5taW5UcmFuc2Zvcm0gOiBtO1xyXG5cclxuICAgIG1lLnBvc2l0aW9uKG0sIDApO1xyXG5cclxuICAgIHN0YXRlTWFwLm1vdmUgPSBzdGF0ZU1hcC5jaGVjayA9ICExO1xyXG4gICAgc3RhcnQueCA9IHN0YXJ0LnkgPSBkZWx0YS54ID0gZGVsdGEueSA9IDA7XHJcblxyXG59O1xyXG5cclxuLy/vv73vv73vv73vv710cmFuZm9ybVxyXG5TY3JvbGwucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24obW92ZSwgZHVyYXRpb24sIGNhbGxiYWNrKXtcclxuICAgIHZhciBzdGF0ZU1hcCA9IHRoaXMuc3RhdGVNYXAsXHJcbiAgICAgICAgJHNjcm9sbHMgPSBzdGF0ZU1hcC4kc2Nyb2xscztcclxuXHJcbiAgICBtb3ZlID0gaXNOYU4obW92ZSkgPyAgMCA6IG1vdmU7XHJcblxyXG4gICAgaWYoc3VwcG9ydFRyYW5zaXRpb24pe1xyXG4gICAgICAgICRzY3JvbGxzLmNzcyhzdGF0ZU1hcC5wZngrXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCIsIChkdXJhdGlvbiAvIDEwMDApICsgJ3MnKTtcclxuICAgICAgICAkc2Nyb2xscy5jc3Moc3RhdGVNYXAucGZ4K1widHJhbnNmb3JtXCIsXCJ0cmFuc2xhdGUzZChcIisgbW92ZSArIFwicHgsMCwwKVwiKTtcclxuICAgICAgICAvL1RPRE8gOiBhZGQgdmVydGlhbCB0cmFuc2Zvcm1cclxuICAgIH1cclxufTtcclxuXHJcbi8v77+977+9yKHvv73vv73HsHRyYW5zZm9ybe+/vcSz37Tvv71cclxuU2Nyb2xsLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbigpe1xyXG5cclxuIC8v77+93rjvv73vv73vv73IoXRyYW5zZm9ybSDvv73vv71pb3Pvv73vv73vv73vv73vv73vv73vv73vv73vv73Eo++/ve+/ve+/ve+/ve+/vdaux7Dvv73vv71zbGlkZXLQtFxyXG4gLy92YXIgdHJhbnNmb3JtUHggPSAkc2xpZGVycy5kYXRhKFwidHJhbnNmb3JtXCIpID8gIDAgOiAkc2xpZGVycy5kYXRhKFwidHJhbnNmb3JtXCIpO1xyXG4gdmFyIHRlbXAgPSB0aGlzLnN0YXRlTWFwLiRzY3JvbGxzWzBdLnN0eWxlW3RoaXMuc3RhdGVNYXAuc3R5bGVUcmFuc2Zvcm1dO1xyXG5cclxuIHZhciB0ID0gIHRlbXAubGVuZ3RoID4gMCA/IHBhcnNlSW50KHRlbXAuc3BsaXQoJ3RyYW5zbGF0ZTNkKCcpWzFdLDEwKSA6IDA7XHJcblxyXG4gcmV0dXJuIGlzTmFOKHQpID8gMCA6IHQ7XHJcbiB9O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS4kID0gZnVuY3Rpb24oZWwpe1xyXG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoZWwpO1xyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJGVsLm9mZihcIi5TY3JvbGwuend1aVwiKTtcclxufTtcclxuXHJcbnZhciBQbHVnaW4gPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGVsID0gU2Nyb2xsLnN0YXRpY01hcC5zY3JvbGw7XHJcbiAgICAgICAgdmFyICRzY3JvbGwgPSAkdGhpcy5pcyhlbCkgJiYgJHRoaXMgfHwgJHRoaXMuY2xvc2VzdChlbCk7XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0gVUkudXRpbHMucGFyc2VPcHRpb25zKCRzY3JvbGwuZGF0YSgnc2Nyb2xsJykpO1xyXG5cclxuICAgICAgICB2YXIgc2xpZGVyID0gbmV3IFNjcm9sbCgkc2Nyb2xsWzBdLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9KTtcclxuXHJcbn07XHJcblxyXG4kLmZuLnNjcm9sbCA9IFBsdWdpbjtcclxuXHJcblVJLnJlYWR5KGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgJCgnW2RhdGEtenctd2lkZ2V0PVwic2Nyb2xsXCJdJywgY29udGV4dCkuc2Nyb2xsKCk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSS5zY3JvbGwgPSBTY3JvbGw7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGlueGlhb2ppZSBvbiAyMDE1LzEwLzIxLlxyXG4gKi9cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL2NvcmUnKTtcclxudmFyIHN1cHBvcnRUcmFuc2l0aW9uID0gIFVJLnN1cHBvcnQudHJhbnNpdGlvbjtcclxuXHJcblxyXG5cclxudmFyIFNsaWRlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsID0gJChlbGVtZW50KTtcclxuXHJcbiAgICB0aGlzLmNvbmZpZ01hcCA9ICQuZXh0ZW5kKHt9LCB0aGlzLmNvbmZpZ01hcCwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn07XHJcblxyXG5TbGlkZXIuc3RhdGljTWFwID0ge1xyXG4gICAgc2xpZGVyOiAnLnp3LXNsaWRlcicsXHJcbiAgICBzbGlkZXJzOiAnLnp3LXNsaWRlcnMnLFxyXG4gICAgc2xpZGVySXRlbTogJy56dy1zbGlkZXJzID4gbGknLFxyXG4gICAgdmlld3BvcnQ6ICcuenctdmlld3BvcnQnLFxyXG4gICAgYWN0aXZlQ2xhc3M6ICcuenctc2xpZGVyLWFjdGl2ZScsXHJcbiAgICBjYW5TbGlkZXJQeDogMTIwXHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLmNvbmZpZ01hcCA9IHtcclxuICAgIGRpcmVjdGlvbjogJ2hvcml6b250YWwnLCAvL+a7keWKqOaWueWQkVxyXG4gICAgYW5pbWF0ZVRpbWU6IDQwMCwgLy/liqjnlLvml7bpl7RcclxuICAgIGF1dG86IHRydWUsIC8v6Ieq5Yqo5pKt5pS+XHJcbiAgICBhdXRvRHVyYXRpb246IDIwMDAsIC8v6Ieq5Yqo5pKt5pS+6Ze06ZqU5pe26Ze0XHJcbiAgICBkZWZhdWx0QWN0aXZlSW5kZXg6IG51bGwsIC8v5LuOMeW8gOWni++8jCBtYXggOiBsZW5ndGhcclxuICAgIG5hbWVzcGFjZTogJ3p3JyxcclxuICAgIGhhc0NvbnRyb2xOYXY6IHRydWVcclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUuc3RhdGVNYXAgPSB7XHJcbiAgICBhY3RpdmVJbmRleDogbnVsbCxcclxuICAgIGxlbmd0aDogMCxcclxuICAgIHRyYW5zaXRpb25pbmc6IG51bGwsXHJcbiAgICAkc2xpZGVyczogbnVsbCxcclxuICAgICRzbGlkZXJzSXRlbTogbnVsbCxcclxuICAgIHBlck1vdmU6MCxcclxuICAgIG9mZnNldFg6IDAsXHJcbiAgICBvZmZzZXRZOiAwLFxyXG4gICAgbW92ZTogMCwgLy/mmK/lkKblj6/np7vliqhcclxuICAgIGNoZWNrOiAwLC8v5piv5ZCm5qCh6aqM6Kem5pG45pa55ZCRXHJcbiAgICBkZWx0YToge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfSxcclxuICAgIHN0YXJ0OiB7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwXHJcbiAgICB9LFxyXG4gICAgcGF1c2U6IHRydWUsIC8v5pqC5YGc6Ieq5Yqo5pKt5pS+XHJcbiAgICBwbGF5VGltZW91dDogbnVsbFxyXG59O1xyXG5cclxuLy9TbGlkZXLliJ3lp4vlhaXlj6NcclxuU2xpZGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGljID0gU2xpZGVyLnN0YXRpY01hcCxcclxuICAgICAgICBjZmcgPSBtZS5jb25maWdNYXAsXHJcbiAgICAgICAgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG4gICAgdmFyIHNjcm9sbExlZnQgPSBkb2MgJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQgfHwgMDtcclxuICAgIHZhciBzY3JvbGxUb3AgPSBkb2MgJiBkb2Muc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wIHx8IDA7XHJcbiAgICBtZS5zdGF0ZU1hcCA9ICQuZXh0ZW5kKHt9LCBtZS5zdGF0ZU1hcCwge1xyXG4gICAgICAgICRzbGlkZXJzOiBtZS4kKHN0YXRpYy5zbGlkZXJzKSxcclxuICAgICAgICAkc2xpZGVySXRlbTogbWUuJChzdGF0aWMuc2xpZGVySXRlbSksXHJcbiAgICAgICAgJHZpZXdwb3J0OiBtZS4kKHN0YXRpYy52aWV3cG9ydCksXHJcbiAgICAgICAgb2Zmc2V0WDogc2Nyb2xsTGVmdCxcclxuICAgICAgICBvZmZzZXRZOiBzY3JvbGxUb3BcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBzdCA9IG1lLnN0YXRlTWFwO1xyXG5cclxuICAgIHZhciBhY3RpdmVJbmRleCA9IHR5cGVvZiBjZmcuZGVmYXVsdEFjdGl2ZUluZGV4ID09PSAnbnVtYmVyJyA/IGNmZy5kZWZhdWx0QWN0aXZlSW5kZXggOiAxO1xyXG4gICAgc3QubGVuZ3RoID0gc3QuJHNsaWRlckl0ZW0ubGVuZ3RoO1xyXG4gICAgc3QuYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleCA8IDEgPyAxIDogYWN0aXZlSW5kZXggPiBzdC5sZW5ndGggPyBzdC5sZW5ndGggOiBhY3RpdmVJbmRleDtcclxuXHJcbiAgICBpZihzdXBwb3J0VHJhbnNpdGlvbil7XHJcbiAgICAgICAgc3QucGZ4ID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc1BmeE5hbWVzID0ge1xyXG4gICAgICAgICAgICAgICAgV2Via2l0VHJhbnNpdGlvbjogJy13ZWJraXQtJyxcclxuICAgICAgICAgICAgICAgIE1velRyYW5zaXRpb246ICctbW96LScsXHJcbiAgICAgICAgICAgICAgICBPVHJhbnNpdGlvbjogJy1vLScsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBmb3IodmFyIG5hbWUgaW4gdHJhbnNQZnhOYW1lcyl7XHJcbiAgICAgICAgICAgICAgICBpZihtZS4kZWxbMF0uc3R5bGVbbmFtZV0gIT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc1BmeE5hbWVzW25hbWVdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkoKTtcclxuXHJcbiAgICAgICAgc3Quc3R5bGVUcmFuc2Zvcm0gPSBzdC5wZnggPT09ICcnID8gJ3RyYW5zZm9ybScgOiBzdC5wZngucmVwbGFjZSgvLS9nLCcnKSArICdUcmFuc2Zvcm0nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZWFkeSgpe1xyXG4gICAgICAgIG1lLnBsYXkoKTtcclxuICAgICAgICBtZS5hZGRFdmVudCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtZS4kZWwub24oJ3JlYWR5LnNsaWRlci56d3VpJywgJC5wcm94eShyZWFkeSwgbWUpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZSgpO1xyXG59O1xyXG5cclxuLy/lrozmiJBzbGlkZXLnmoTmoLflvI/orr7nva7nu5PmnpzluIPlsYBcclxuU2xpZGVyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIGNmZyA9IG1lLmNvbmZpZ01hcDtcclxuXHJcbiAgICAvL3N0LiR2aWV3cG9ydCA9ICQoJzxkaXYgY2xhc3M9XCInICsgY2ZnLm5hbWVzcGFjZSArICctdmlld3BvcnRcIiAvPicpLmFwcGVuZFRvKG1lLiRlbCkuYXBwZW5kKHN0LiRzbGlkZXJzKTtcclxuXHJcblxyXG4gICAgaWYoc3RhdGVNYXAubGVuZ3RoID4gMSl7XHJcblxyXG4gICAgICAgIHZhciBhZGRDb3VudCA9IDI7XHJcblxyXG4gICAgICAgIC8v5aSN5Yi25YmN5ZCO6IqC54K5XHJcbiAgICAgICAgc3RhdGVNYXAuJHNsaWRlcnMuYXBwZW5kKG1lLnVuaXF1ZUlkKHN0YXRlTWFwLiRzbGlkZXJJdGVtLmZpcnN0KCkuY2xvbmUoKS5hZGRDbGFzcygnY2xvbmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJykpKVxyXG4gICAgICAgICAgICAucHJlcGVuZChtZS51bmlxdWVJZChzdGF0ZU1hcC4kc2xpZGVySXRlbS5sYXN0KCkuY2xvbmUoKS5hZGRDbGFzcygnY2xvbmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJykpKTtcclxuXHJcbiAgICAgICAgc3RhdGVNYXAuJG5ld1NsaWRlckl0ZW0gPSBtZS4kKFNsaWRlci5zdGF0aWNNYXAuc2xpZGVySXRlbSk7XHJcbiAgICAgICAgc3RhdGVNYXAubGVuZ3RoID0gIHN0YXRlTWFwLiRuZXdTbGlkZXJJdGVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdmFyIHdpZHRoID0gdHlwZW9mIHN0YXRlTWFwLiR2aWV3cG9ydCA9PSAndW5kZWZpbmVkJyA/IG1lLiRlbC53aWR0aCgpIDogc3RhdGVNYXAuJHZpZXdwb3J0LndpZHRoKCk7XHJcblxyXG4gICAgICAgIGlmKGNmZy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyl7XHJcbiAgICAgICAgICAgIHN0YXRlTWFwLiRzbGlkZXJzLndpZHRoKCgoYWRkQ291bnQgKyBzdGF0ZU1hcC5sZW5ndGgpICogMjAwKSArICclJyk7XHJcbiAgICAgICAgICAgIHN0YXRlTWFwLnBlck1vdmUgPSB3aWR0aDtcclxuICAgICAgICAgICAgc3RhdGVNYXAuJG5ld1NsaWRlckl0ZW0uY3NzKHtcclxuICAgICAgICAgICAgICAgIC8vZGlzcGxheTogJ2Jsb2NrJyxcclxuICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6ICd2aXNpYmxlJyxcclxuICAgICAgICAgICAgICAgIGZsb2F0OiAnbGVmdCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1lbHNley8vVG9kbzogc2xpZGVyIHZlcnRpY2FsXHJcbiAgICAgICAgICAgIC8qc3RhdGVNYXAuJHNsaWRlcnMuaGVpZ2h0KCgoYWRkQ291bnQgKyBzdGF0ZU1hcC5sZW5ndGgpICogMjAwKSArICclJykuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS53aWR0aChcIjEwMCVcIik7XHJcbiAgICAgICAgICAgICBzdGF0ZU1hcC4kbmV3U2xpZGVySXRlbS5jc3Moe1xyXG4gICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcclxuICAgICAgICAgICAgIHdpZHRoOiAnMTAwJSdcclxuICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgfVxyXG5cclxuLyogICAgICAgIGlmKCFzdXBwb3J0VHJhbnNpdGlvbil7XHJcbiAgICAgICAgICAgIHN0YXRlTWFwLiRzbGlkZXJzLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICBtZS5wb3NpdGlvbigtd2lkdGggKiBzdGF0ZU1hcC5hY3RpdmVJbmRleCAsIDApO1xyXG4gICAgICAgIG1lLmNyZWF0ZUNvbnRyb2xOYXYoKTtcclxuICAgICAgICBtZS5zZXRBY3RpdmUoc3RhdGVNYXAuYWN0aXZlSW5kZXgpO1xyXG5cclxuICAgICAgICBtZS4kZWwudHJpZ2dlcigncmVhZHkuc2xpZGVyLnp3dWknKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLmFkZEV2ZW50ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXM7XHJcbiAgICAvL21lLnN0YXRlTWFwLiR2aWV3cG9ydC5vbihcImNsaWNrXCIsZnVuY3Rpb24oKXtcclxuICAgIC8vICAgIHRoaXMucHJlKCk7XHJcbiAgICAvL30uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hzdGFydC5zbGlkZXIuend1aVwiLCAkLnByb3h5KG1lLnN0YXJ0TW92ZSwgbWUpKTtcclxuICAgIG1lLiRlbC5vbihcInRvdWNobW92ZS5zbGlkZXIuend1aVwiLCAkLnByb3h5KG1lLmR1ck1vdmUsIG1lKSk7XHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaGVuZC5zbGlkZXIuend1aVwiLCAkLnByb3h5KG1lLmVuZE1vdmUsIG1lKSk7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eShmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgICAgIGxlbmd0aCA9IG1lLnN0YXRlTWFwLmxlbmd0aCxcclxuICAgICAgICAgICAgYWN0aXZlSW5kZXggPSBtZS5zdGF0ZU1hcC5hY3RpdmVJbmRleDsgLy9NYXRoLmFicyhtZS5nZXRUcmFuc2Zvcm0oKSAvIG1lLnN0YXRlTWFwLnBlck1vdmUpIDtcclxuXHJcbiAgICAgICAgbWUuc3RhdGVNYXAudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbmV3SW5kZXggPSBtZS5nZXROZXdBY3RpdmVJbmRleChhY3RpdmVJbmRleCk7XHJcblxyXG4gICAgICAgIGlmKGFjdGl2ZUluZGV4ICE9PSBuZXdJbmRleCApe1xyXG4gICAgICAgICAgICBtZS5zZXRBY3RpdmUobmV3SW5kZXgpO1xyXG4gICAgICAgICAgICBtZS5wb3NpdGlvbigtbWUuc3RhdGVNYXAucGVyTW92ZSAqIG5ld0luZGV4LCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1lLiRlbC50cmlnZ2VyKFwic2xpZGVyLmVuZFwiLCBuZXdJbmRleCk7XHJcblxyXG4gICAgfSx0aGlzKTtcclxuXHJcbiAgICBpZihzdXBwb3J0VHJhbnNpdGlvbil7XHJcbiAgICAgICAgbWUuc3RhdGVNYXAuJHNsaWRlcnMub24oc3VwcG9ydFRyYW5zaXRpb24uZW5kLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuLyogYWN0aXZlIOS4uuacgOWQjuS4gOW8oO+8iGNsb25lKe+8jOmHjee9ruS4uuesrOS4gOW8oOeahOS9jee9rlxyXG4gYWN0aXZlIOS4uuesrDDlvKAoY2xvbmUpLOmHjee9ruS4uuWAkuaVsOesrOS6jOW8oCovXHJcblNsaWRlci5wcm90b3R5cGUuZ2V0TmV3QWN0aXZlSW5kZXggPSBmdW5jdGlvbihpZHgpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBsZW4gPSBtZS5zdGF0ZU1hcC5sZW5ndGg7XHJcbiAgICBpZihpZHggPT0gbGVuIC0xICl7XHJcbiAgICAgICAgaWR4ID0gMTtcclxuICAgIH1lbHNlIGlmKGlkeCA9PSAwICl7XHJcbiAgICAgICAgaWR4ID0gbGVuIC0gMjtcclxuICAgIH1cclxuICAgIHJldHVybiBpZHg7XHJcbn07XHJcblxyXG4vKlNsaWRlci5wcm90b3R5cGUuZG9NYXRoID0gZnVuY3Rpb24oKXtcclxuIHZhciBtZSA9IHRoaXMsXHJcbiBjZmcgPSBtZS5jb25maWdNYXAsXHJcbiBkaXJlY3Rpb24gPSBjZmcuZGlyZWN0aW9uLFxyXG4gc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcDtcclxuIHN0YXRlTWFwLiRzbGlkZXJzSXRlbSA9IG1lLiQoU2xpZGVyLnN0YXRpY01hcC5zbGlkZXJJdGVtKTtcclxuIHN0YXRlTWFwLmxlbmd0aCA9ICBzdGF0ZU1hcC4kc2xpZGVyc0l0ZW0ubGVuZ3RoO1xyXG5cclxuIHZhciB3aWR0aCA9IHR5cGVvZiBzdGF0ZU1hcC4kdmlld3BvcnQgPT0gJ3VuZGVmaW5lZCcgPyBtZS4kZWwud2lkdGgoKSA6IHN0YXRlTWFwLiR2aWV3cG9ydC53aWR0aCgpO1xyXG5cclxuIGlmKGRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKXtcclxuIHN0YXRlTWFwLnBlck1vdmUgPSB3aWR0aDtcclxuIHN0YXRlTWFwLiRzbGlkZXJzSXRlbS5jc3Moe1xyXG4gZGlzcGxheTogJ2Jsb2NrJyxcclxuIGZsb2F0OiAnbGVmdCcsXHJcbiB3aWR0aDogd2lkdGggKyAncHgnXHJcbiB9KTtcclxuIG1lLnBvc2l0aW9uKC13aWR0aCAqIHN0YXRlTWFwLmFjdGl2ZUluZGV4ICwgMCk7XHJcbiBtZS5zZXRBY3RpdmUoc3RhdGVNYXAuYWN0aXZlSW5kZXgpO1xyXG4gfVxyXG4gfTsqL1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5zdGFydE1vdmUgPSBmdW5jdGlvbihlKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhcnQgPSBtZS5zdGF0ZU1hcC5zdGFydCxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwO1xyXG5cclxuICAgIC8v5pqC5YGc6Ieq5Yqo5pKt5pS+XHJcbiAgICBtZS5wYXVzZVBsYXkoKTtcclxuXHJcbiAgICBpZihzdGF0ZU1hcC50cmFuc2l0aW9uaW5nKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZihlLm9yaWdpbmFsRXZlbnQpe1xyXG4gICAgICAgIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XHJcbiAgICB9XHJcbiAgICB2YXIgdG91Y2ggPSBlLnRvdWNoZXNbMF07XHJcbiAgICBzdGFydC54ID0gdG91Y2gucGFnZVggfHwgKHRvdWNoLmNsaWVudFggKyBzdGF0ZU1hcC5vZmZzZXRYKTtcclxuICAgIHN0YXJ0LnkgPSB0b3VjaC5wYWdlWSB8fCAodG91Y2guY2xpZW50WSArIHN0YXRlTWFwLm9mZnNldFkpO1xyXG5cclxuICAgIHN0YXRlTWFwLm1vdmUgPSBzdGF0ZU1hcC5jaGVjayA9ICAxO1xyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5kdXJNb3ZlID0gZnVuY3Rpb24oZSl7XHJcblxyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIHN0YXJ0ID0gc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgZGVsdGEgPSBzdGF0ZU1hcC5kZWx0YSxcclxuICAgICAgICBkaXIgPSBtZS5jb25maWdNYXAuZGlyZWN0aW9uO1xyXG5cclxuICAgIGlmKHN0YXRlTWFwLnRyYW5zaXRpb25pbmcgfHwgIXN0YXRlTWFwLm1vdmUpe1xyXG4gICAgICAgIHJldHVybiA7XHJcbiAgICB9XHJcbiAgICBpZihlLm9yaWdpbmFsRXZlbnQpe1xyXG4gICAgICAgIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XHJcbiAgICB9XHJcbiAgICB2YXIgdG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzW2UuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgeDIgPSB0b3VjaC5wYWdlWCB8fCAodG91Y2guY2xpZW50WCArIHN0YXRlTWFwLm9mZnNldFgpO1xyXG4gICAgdmFyIHkyID0gdG91Y2gucGFnZVkgfHwgKHRvdWNoLmNsaWVudFkgKyBzdGF0ZU1hcC5vZmZzZXRZKTtcclxuXHJcbiAgICBkZWx0YS54ID0geDIgLSBzdGFydC54O1xyXG4gICAgZGVsdGEueSA9IHkyIC0gc3RhcnQueTtcclxuXHJcbiAgICAvKiAgICDkuIDkuKrop6bmkbjov4fnqIvlj6rliKTmlq3kuIDmrKHvvIzliKTmlq3mmK/lk6rkuKrmlrnlkJHnmoTop6bmkbjvvIzlpoLmnpxzbGlkZXLmmK/msLTlubPmlrnlkJHnmoTvvIzliJnnpoHmraJ0b3VjaG1vdmXkuovku7ZcclxuICAgICDlpITnkIblnoLnm7TmlrnlkJHnmoTnp7vliqjvvIzlj43kuYvkuqbnhLYqL1xyXG4gICAgaWYoc3RhdGVNYXAuY2hlY2spe1xyXG4gICAgICAgIHZhciB0ID0gTWF0aC5hYnMoZGVsdGEueCkgPiBNYXRoLmFicyhkZWx0YS55KTtcclxuICAgICAgICBzdGF0ZU1hcC5tb3ZlID0gZGlyID09PSAnaG9yaXpvbnRhbCcgPyB0XHJcbiAgICAgICAgICAgIDogIXQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGVNYXAuY2hlY2sgPSAhMTtcclxuXHJcbiAgICBpZihzdGF0ZU1hcC5tb3ZlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHZhciBtID0gLSBzdGF0ZU1hcC5hY3RpdmVJbmRleCAqIHN0YXRlTWFwLnBlck1vdmUgK1xyXG4gICAgICAgICAgICAoZGlyID09PSAnaG9yaXpvbnRhbCcgPyBkZWx0YS54IDogZGVsdGEueSk7XHJcblxyXG4gICAgICAgIG1lLnBvc2l0aW9uKG0sIDApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5lbmRNb3ZlID0gZnVuY3Rpb24oZSl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gbWUuc3RhdGVNYXAsXHJcbiAgICAgICAgc3RhcnQgPSBzdGF0ZU1hcC5zdGFydCxcclxuICAgICAgICBkZWx0YSA9IHN0YXRlTWFwLmRlbHRhO1xyXG5cclxuICAgIC8v5byA5aeL6Ieq5Yqo5pKt5pS+XHJcbiAgICBtZS5wbGF5KCk7XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlID0gbWUuY29uZmlnTWFwLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gTWF0aC5hYnMoZGVsdGEueCkgOiBNYXRoLmFicyhkZWx0YS55KTtcclxuICAgIHZhciB2YWwgPSBtZS5jb25maWdNYXAuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBkZWx0YS54IDogZGVsdGEueTtcclxuXHJcbiAgICBpZihzdGF0ZU1hcC5tb3ZlICYmIGRpc3RhbmNlID4gU2xpZGVyLnN0YXRpY01hcC5jYW5TbGlkZXJQeCl7XHJcbiAgICAgICAgaWYodmFsID4gMCApe1xyXG4gICAgICAgICAgICBtZS5wcmUoKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgbWUubmV4dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICAgIHZhciBtID0gLSBzdGF0ZU1hcC5hY3RpdmVJbmRleCAqIHN0YXRlTWFwLnBlck1vdmU7XHJcbiAgICAgICAgbWUucG9zaXRpb24obSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGVNYXAubW92ZSA9IHN0YXRlTWFwLmNoZWNrID0gITE7XHJcbiAgICBzdGFydC54ID0gc3RhcnQueSA9IGRlbHRhLnggPSBkZWx0YS55ID0gMDtcclxuXHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLmF1dG9QbGF5ICA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIGNmZyA9IG1lLmNvbmZpZ01hcDtcclxuXHJcbiAgICBpZighbWUuc3RhdGVNYXAucGF1c2Upe1xyXG4gICAgICAgIGNsZWFyVGltZW91dChtZS5zdGF0ZU1hcC5wbGF5VGltZW91dCk7XHJcbiAgICAgICAgdmFyIGNiID0gJC5wcm94eShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUuY291bnQoJ3RpbWVvdXRwbGF5Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGVNYXAucGxheVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICBpZighdGhpcy5zdGF0ZU1hcC5wYXVzZSl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0b1BsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sbWUpO1xyXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGNmZy5hbmltYXRlVGltZSArIGNmZy5hdXRvRHVyYXRpb24gO1xyXG4gICAgICAgIG1lLnN0YXRlTWFwLnBsYXlUaW1lb3V0ID0gc2V0VGltZW91dChjYiwgZHVyYXRpb24pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXM7XHJcblxyXG4gICAgaWYobWUuY29uZmlnTWFwLmF1dG8gJiYgbWUuc3RhdGVNYXAucGF1c2Upe1xyXG4gICAgICAgIG1lLnN0YXRlTWFwLnBhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgbWUuYXV0b1BsYXkoKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLnBhdXNlUGxheSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzO1xyXG5cclxuICAgIGNsZWFyVGltZW91dChtZS5zdGF0ZU1hcC5wbGF5VGltZW91dCk7XHJcblxyXG4gICAgbWUuc3RhdGVNYXAucGF1c2UgPSB0cnVlO1xyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5wcmUgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IHRoaXMuc3RhdGVNYXAsXHJcbiAgICAgICAgYWN0aXZlSW5kZXggPSBzdGF0ZU1hcC5hY3RpdmVJbmRleDtcclxuXHJcbiAgICAvL+S4jeeUqOWIpOaWreaYr+WQpui2heWHumxlbmd0aOacieaViOWAvO+8jOWKqOeUu+e7k+adn+S5i+WQjuS8muWIpOaWreWmguaenOS4uuacgOWQjuS4gOW8oOaIluesrOS4gOW8oO+8jOmHjee9ruS9jee9rlxyXG4gICAgYWN0aXZlSW5kZXggLS0gO1xyXG5cclxuXHJcbiAgICBpZighIXN0YXRlTWFwLnRyYW5zaXRpb25pbmcpe1xyXG4gICAgICAgIHJldHVybiA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1vdmUgPSAtIHN0YXRlTWFwLnBlck1vdmUgKiBhY3RpdmVJbmRleDtcclxuXHJcbiAgICBtZS5zZXRBY3RpdmUoYWN0aXZlSW5kZXgpO1xyXG4gICAgbWUucG9zaXRpb24obW92ZSwgbWUuY29uZmlnTWFwLmFuaW1hdGVUaW1lKTtcclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gdGhpcy5zdGF0ZU1hcCxcclxuICAgICAgICBhY3RpdmVJbmRleCA9IHN0YXRlTWFwLmFjdGl2ZUluZGV4O1xyXG5cclxuICAgIC8v5LiN55So5Yik5pat5piv5ZCm6LaF5Ye6bGVuZ3Ro5pyJ5pWI5YC877yM5Yqo55S757uT5p2f5LmL5ZCO5Lya5Yik5pat5aaC5p6c5Li65pyA5ZCO5LiA5byg5oiW56ys5LiA5byg77yM6YeN572u5L2N572uXHJcbiAgICBhY3RpdmVJbmRleCArKyA7XHJcblxyXG5cclxuICAgIGlmKCEhc3RhdGVNYXAudHJhbnNpdGlvbmluZyl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbW92ZSA9IC0gc3RhdGVNYXAucGVyTW92ZSAqIGFjdGl2ZUluZGV4O1xyXG5cclxuICAgIG1lLnNldEFjdGl2ZShhY3RpdmVJbmRleCk7XHJcbiAgICBtZS5wb3NpdGlvbihtb3ZlLCBtZS5jb25maWdNYXAuYW5pbWF0ZVRpbWUpO1xyXG59O1xyXG5cclxuXHJcbi8v6K6+572uYWN0aXZlSW5kZXgg5ZKMIGFjdGl2ZUNsYXNzXHJcblNsaWRlci5wcm90b3R5cGUuc2V0QWN0aXZlID0gZnVuY3Rpb24gKGluZGV4KXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcCxcclxuICAgICAgICBhY3RpdmVDbGFzcyA9IFNsaWRlci5zdGF0aWNNYXAuYWN0aXZlQ2xhc3M7XHJcblxyXG4gICAgc3RhdGVNYXAuYWN0aXZlSW5kZXggPSBpbmRleDtcclxuICAgIHN0YXRlTWFwLiRuZXdTbGlkZXJJdGVtLnJlbW92ZUNsYXNzKGFjdGl2ZUNsYXNzKTtcclxuICAgIHN0YXRlTWFwLiRuZXdTbGlkZXJJdGVtLmVxKGluZGV4KS5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XHJcblxyXG4gICAgaWYobWUuY29uZmlnTWFwLmhhc0NvbnRyb2xOYXYpe1xyXG4gICAgICAgIG1lLiRlbC50cmlnZ2VyKFwic3dpdGNoQ29udHJvbE5hdi5zbGlkZXIuend1aVwiLCBpbmRleCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuLy/orr7nva50cmFuZm9ybVxyXG5TbGlkZXIucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24obW92ZSwgZHVyYXRpb24sIGNhbGxiYWNrKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSB0aGlzLnN0YXRlTWFwLFxyXG4gICAgICAgICRzbGlkZXJzID0gc3RhdGVNYXAuJHNsaWRlcnM7XHJcblxyXG4gICAgaWYoISFtZS5zdGF0ZU1hcC50cmFuc2l0aW9uaW5nKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG5cclxuICAgIG1lLnN0YXRlTWFwLnRyYW5zaXRpb25pbmcgPSAgZHVyYXRpb24gPT09IDAgPyBmYWxzZSA6IHRydWU7XHJcblxyXG4gICAgbW92ZSA9IGlzTmFOKG1vdmUpID8gIDAgOiBtb3ZlO1xyXG5cclxuICAgIGlmKHN1cHBvcnRUcmFuc2l0aW9uKXtcclxuICAgICAgICAkc2xpZGVycy5jc3Moc3RhdGVNYXAucGZ4K1widHJhbnNpdGlvbi1kdXJhdGlvblwiLCAoZHVyYXRpb24gLyAxMDAwKSArICdzJyk7XHJcbiAgICAgICAgJHNsaWRlcnMuY3NzKHN0YXRlTWFwLnBmeCtcInRyYW5zZm9ybVwiLFwidHJhbnNsYXRlM2QoXCIrIG1vdmUgKyBcInB4LDAsMClcIik7XHJcbiAgICAgICAgLy9UT0RPIDogYWRkIHZlcnRpYWwgdHJhbnNmb3JtXHJcbiAgICB9ZWxzZXsvL1RPRE8gOiBhZGQgdW5zdXBwb3J0VHJhbnNpdGlvbiBkZWFsIDogc3VwcG9ydCB0byBpZTggK1xyXG4vKiAgICAgICAgJHNsaWRlcnMuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgIGxlZnQ6IG1vdmUgKyAncHgnXHJcbiAgICAgICAgfSxkdXJhdGlvbixmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBtZS5zdGF0ZU1hcC50cmFuc2l0aW9uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSkqL1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbi8v5bqV6YOo5a+86IiqXHJcblNsaWRlci5wcm90b3R5cGUuY3JlYXRlQ29udHJvbE5hdiA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gbWUuc3RhdGVNYXA7XHJcblxyXG4gICAgaWYoIW1lLmNvbmZpZ01hcC5oYXNDb250cm9sTmF2KXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG4gICAgdmFyICRjb250cm9sTmF2ID0gJCgnPG9sIGNsYXNzPVwiJyArIG1lLmNvbmZpZ01hcC5uYW1lc3BhY2UgKyAnLWNvbnRyb2wtbmF2ICcgICsgJ1wiPjwvb2w+Jyk7XHJcblxyXG4gICAgdmFyIGwgPSBzdGF0ZU1hcC4kc2xpZGVySXRlbS5sZW5ndGgsXHJcbiAgICAgICAgaSA9IDA7XHJcbiAgICBmb3IoO2k8bDtpKyspe1xyXG4gICAgICAgICRjb250cm9sTmF2LmFwcGVuZCgnPGxpPjxhIGRhdGEtaW5kZXggPSAnICsgKGkgKyAxKSArICc+JyArIChpICsgMSkgKyAnPC9hPjwvbGk+Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGVNYXAuJHZpZXdwb3J0LmFwcGVuZCgkY29udHJvbE5hdik7XHJcbiAgICBzdGF0ZU1hcC4kY29udHJvbE5hdkl0ZW0gPSAkY29udHJvbE5hdi5maW5kKCdsaSBhJyk7XHJcblxyXG4gICAgZnVuY3Rpb24gc3dpdGNoQ29udHJvbE5hdk1hbmFsKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBpZihlLm9yaWdpbmFsRXZlbnQpe1xyXG4gICAgICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICBfJHRoaXMgPSAkKGUudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ID0gXyR0aGlzLmRhdGEoJ2luZGV4Jyk7XHJcblxyXG4gICAgICAgIGlmKCFpc05hTihpbmRleCkgJiYgIXRoaXMuc3RhdGVNYXAudHJhbnNpdGlvbmluZyl7XHJcbiAgICAgICAgICAgIHZhciBjdXIgPSBtZS5zdGF0ZU1hcC5hY3RpdmVJbmRleDtcclxuICAgICAgICAgICAgaWYoY3VyID09PSBpbmRleCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8v5pqC5YGc6Ieq5Yqo5pKt5pS+XHJcbiAgICAgICAgICAgIG1lLnBhdXNlUGxheSgpO1xyXG5cclxuICAgICAgICAgICAgbWUuc3RhdGVNYXAuJGNvbnRyb2xOYXZJdGVtLnJlbW92ZUNsYXNzKCd6dy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgXyR0aGlzLmFkZENsYXNzKCd6dy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgbWUuc2V0QWN0aXZlKGluZGV4KTtcclxuICAgICAgICAgICAgbWUucG9zaXRpb24oLW1lLnN0YXRlTWFwLnBlck1vdmUgKiBpbmRleCAsIG1lLmNvbmZpZ01hcC5hbmltYXRlVGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHN3aXRjaENvbnRyb2xOYXZBdXRvKGUsIGluZGV4KXtcclxuXHJcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMuc3RhdGVNYXAubGVuZ3RoO1xyXG5cclxuICAgICAgICBpbmRleCA9IHRoaXMuZ2V0TmV3QWN0aXZlSW5kZXgoaW5kZXgpIC0gMTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZU1hcC4kY29udHJvbE5hdkl0ZW0ucmVtb3ZlQ2xhc3MoJ3p3LWFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuc3RhdGVNYXAuJGNvbnRyb2xOYXZJdGVtLmVxKGluZGV4KS5hZGRDbGFzcygnenctYWN0aXZlJyk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaHN0YXJ0LnNsaWRlci56d3VpXCIsICcuenctY29udHJvbC1uYXYgYScgLCAkLnByb3h5KHN3aXRjaENvbnRyb2xOYXZNYW5hbCwgbWUpKTtcclxuICAgIG1lLiRlbC5vbihcInN3aXRjaENvbnRyb2xOYXYuc2xpZGVyLnp3dWlcIiwgJC5wcm94eShzd2l0Y2hDb250cm9sTmF2QXV0bywgbWUpKTtcclxufTtcclxuXHJcbi8v6I635Y+W5b2T5YmNdHJhbnNmb3Jt55qE5bC65a+4XHJcbi8qU2xpZGVyLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm0gPSBmdW5jdGlvbigpe1xyXG5cclxuIC8v5L+u5pS55LiL5Y+WdHJhbnNmb3JtIO+8jGlvc+S8muaciemXrumimOeahO+8jOaMieeFp+S5i+WJjeeahHNsaWRlcuWGmVxyXG4gLy92YXIgdHJhbnNmb3JtUHggPSAkc2xpZGVycy5kYXRhKFwidHJhbnNmb3JtXCIpID8gIDAgOiAkc2xpZGVycy5kYXRhKFwidHJhbnNmb3JtXCIpO1xyXG4gdmFyIHRlbXAgPSB0aGlzLnN0YXRlTWFwLiRzbGlkZXJzWzBdLnN0eWxlW3RoaXMuc3RhdGVNYXAuc3R5bGVUcmFuc2Zvcm1dO1xyXG5cclxuIHZhciB0ID0gIHRlbXAubGVuZ3RoID4gMCA/IHBhcnNlSW50KHRlbXAuc3BsaXQoJ3RyYW5zbGF0ZTNkKCcpWzFdLDEwKSA6IDA7XHJcblxyXG4gcmV0dXJuIGlzTmFOKHQpID8gMCA6IHQ7XHJcbiB9OyovXHJcblxyXG4vL+WkjeWItueahOiKgueCueWKoOWUr+S4gGlkXHJcblNsaWRlci5wcm90b3R5cGUudW5pcXVlSWQgPSBmdW5jdGlvbigkY2xvbmUpIHtcclxuICAgIC8vIEFwcGVuZCBfY2xvbmUgdG8gY3VycmVudCBsZXZlbCBhbmQgY2hpbGRyZW4gZWxlbWVudHMgd2l0aCBpZCBhdHRyaWJ1dGVzXHJcbiAgICAkY2xvbmUuZmlsdGVyKCdbaWRdJykuYWRkKCRjbG9uZS5maW5kKCdbaWRdJykpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAkdGhpcy5hdHRyKCdpZCcsICR0aGlzLmF0dHIoJ2lkJykgKyAnX2Nsb25lJyk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiAkY2xvbmU7XHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLiQgPSBmdW5jdGlvbihlbCl7XHJcbiAgICByZXR1cm4gdGhpcy4kZWwuZmluZChlbCk7XHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy4kZWwub2ZmKFwiLnNsaWRlci56d3VpXCIpO1xyXG4gICAgdGhpcy5zdGF0ZU1hcC4kc2xpZGVycy5vZmYoc3VwcG9ydFRyYW5zaXRpb24uZW5kKTtcclxuICAgIGlmKHRoaXMuc3RhdGljTWFwLnBsYXlUaW1lb3V0KXtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdGF0aWNNYXAucGxheVRpbWVvdXQpO1xyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIFBsdWdpbiA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgZWwgPSBTbGlkZXIuc3RhdGljTWFwLnNsaWRlcjtcclxuICAgICAgICB2YXIgJHNsaWRlciA9ICR0aGlzLmlzKGVsKSAmJiAkdGhpcyB8fCAkdGhpcy5jbG9zZXN0KGVsKTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBVSS51dGlscy5wYXJzZU9wdGlvbnMoJHNsaWRlci5kYXRhKCdzbGlkZXInKSk7XHJcblxyXG4gICAgICAgIHZhciBzbGlkZXIgPSBuZXcgU2xpZGVyKCRzbGlkZXJbMF0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbiQuZm4uc2xpZGVyID0gUGx1Z2luO1xyXG5cclxuVUkucmVhZHkoZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAkKCdbZGF0YS16dy13aWRnZXQ9XCJzbGlkZXJcIl0nLCBjb250ZXh0KS5zbGlkZXIoKTtcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJLnNsaWRlciA9IFNsaWRlcjsiLCIvKipcclxuICogQ3JlYXRlZCBieSBsaW54aWFvamllIG9uIDIwMTUvMTAvMTkuXHJcbiAqL1xyXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vY29yZScpO1xyXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSBVSS5zdXBwb3J0LnRyYW5zaXRpb247XHJcblxyXG52YXIgVGFicyA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWwgPSAkKGVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuY29uZmlnTWFwID0gJC5leHRlbmQoe30sIHRoaXMuY29uZmlnTWFwLCBvcHRpb25zIHx8IHt9KTtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgdGhpcy5hZGRFdmVudCgpO1xyXG59O1xyXG5cclxuVGFicy5zdGF0aWNNYXAgPSB7XHJcbiAgICB0YWJzOiAnLnp3LXRhYnMnLFxyXG4gICAgYWN0aXZlQ2xhc3M6ICd6dy1hY3RpdmUnLFxyXG4gICAgdGFiTmF2OiAnLnp3LXRhYnMtbmF2JyxcclxuICAgIHRhYk5hdkl0ZW06ICcuenctdGFicy1uYXYgPiBsaScsXHJcbiAgICBuYXY6ICcuenctdGFicy1uYXYgYScsXHJcbiAgICB0YWJQYW5lbDogJy56dy10YWItcGFuZWwnXHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS5jb25maWdNYXAgPSB7XHJcbiAgICBkZWZhdWx0QWN0aXZlSW5kZXg6IG51bGxcclxufTtcclxuXHJcblRhYnMucHJvdG90eXBlLnN0YXRlTWFwID0ge1xyXG4gICAgYWN0aXZlSW5kZXg6IG51bGwsXHJcbiAgICB0cmFuc2l0aW9uaW5nOiBudWxsXHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS4kID0gZnVuY3Rpb24oZWwpe1xyXG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoZWwpO1xyXG59XHJcblRhYnMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBjZmcgPSBUYWJzLnN0YXRpY01hcCxcclxuICAgICAgICBpZHggPSBtZS5jb25maWdNYXAuZGVmYXVsdEFjdGl2ZUluZGV4LFxyXG4gICAgICAgIGFjdGl2ZUluZGV4ID0gaWR4ID8gaWR4IDogMDtcclxuXHJcbiAgICBtZS5zdGF0ZU1hcCA9IHtcclxuICAgICAgICAkdGFiTmF2OiBtZS4kKGNmZy50YWJOYXYpLFxyXG4gICAgICAgICR0YWJOYXZJdGVtOiBtZS4kKGNmZy50YWJOYXZJdGVtKSxcclxuICAgICAgICAkbmF2OiBtZS4kKGNmZy5uYXYpLFxyXG4gICAgICAgICR0YWJQYW5lbDogbWUuJChjZmcudGFiUGFuZWwpXHJcbiAgICB9O1xyXG5cclxuLyogICAgdmFyIGN1ck5hdiA9IG1lLnN0YXRlTWFwLiR0YWJOYXYuZmluZChcIi5cIiArIGNmZy5hY3RpdmVDbGFzcyk7Ki9cclxuXHJcbiAgICAvL+agt+W8j+aYr+WQpuaMh+WumuS6hmFjdGl2ZSBDbGFzcyA6Ly/pu5jorqTkvb/nlKjphY3nva7vvIzml6DphY3nva7mmL7npLrnrKzkuIDkuKpcclxuLyogICAgaWYoY3VyTmF2Lmxlbmd0aCA+IDAgKXtcclxuICAgICAgICBpbmRleCA9IG1lLnN0YXRlTWFwLiR0YWJOYXZJdGVtLmluZGV4KGN1ck5hdi5maXJzdCgpKTtcclxuICAgIH0qL1xyXG4gICAgdmFyIGxlbiA9IG1lLnN0YXRlTWFwLiR0YWJOYXZJdGVtLmxlbmd0aDtcclxuICAgIGFjdGl2ZUluZGV4ID0gYWN0aXZlSW5kZXggPiBsZW4gLSAxID8gbGVuIC0gMSA6IGFjdGl2ZUluZGV4O1xyXG5cclxuICAgIG1lLmdvdG8oYWN0aXZlSW5kZXgpO1xyXG59O1xyXG5cclxuVGFicy5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBjZmcgPSBUYWJzLnN0YXRpY01hcDtcclxuICAgIHZhciBzdGF0ZU1hcCA9IHRoaXMuc3RhdGVNYXA7XHJcblxyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hzdGFydC50YWJzLnp3dWlcIiwgY2ZnLm5hdiwgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIG1lLmdvdG8oJCh0aGlzKSlcclxuICAgIH0pO1xyXG5cclxufTtcclxuXHJcbi8qVGFicy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCRuYXYpe1xyXG4gICAgdmFyIG1lID0gdGhpcztcclxuICAgIGlmKCEkbmF2XHJcbiAgICAgICAgfHwgISRuYXYubGVuZ3RoXHJcbiAgICAgICAgfHwgbWUudHJhbnNpdGlvbmluZ1xyXG4gICAgICAgIHx8ICRuYXYucGFyZW50KCdsaScpLmhhc0NsYXNzKFRhYnMuc3RhdGljTWFwLmFjdGl2ZUNsYXNzKSl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5kZXggPSBtZS5zdGF0ZU1hcC5uYXYuaW5kZXgoJG5hdik7XHJcblxyXG4gICAgaWYofmluZGV4KXtcclxuICAgICAgICBtZS5nb3RvKGluZGV4KTtcclxuICAgIH1cclxufTsqL1xyXG5cclxuVGFicy5wcm90b3R5cGUuZ290byA9IGZ1bmN0aW9uICgkbmF2KXtcclxuXHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIGluZGV4ID0gdHlwZW9mICRuYXYgPT09ICdudW1iZXInID8gJG5hdiA6IG1lLnN0YXRlTWFwLiRuYXYuaW5kZXgoJG5hdik7XHJcblxyXG4gICAgJG5hdiA9IHR5cGVvZiAkbmF2ID09PSAnbnVtYmVyJyA/IG1lLnN0YXRlTWFwLiRuYXYuZXEoaW5kZXgpIDogJCgkbmF2KTtcclxuXHJcbiAgICBpZighJG5hdlxyXG4gICAgICAgIHx8ICEkbmF2Lmxlbmd0aFxyXG4gICAgICAgIHx8IG1lLnRyYW5zaXRpb25pbmdcclxuICAgICAgICB8fCAkbmF2LnBhcmVudCgnbGknKS5oYXNDbGFzcyhUYWJzLnN0YXRpY01hcC5hY3RpdmVDbGFzcykpe1xyXG4gICAgICAgIHJldHVybiA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuc3dpdGNoTmF2KGluZGV4KTtcclxuICAgIHRoaXMuc3dpdGNoUGFuZWwoaW5kZXgpO1xyXG59O1xyXG5cclxuVGFicy5wcm90b3R5cGUuc3dpdGNoTmF2ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgdmFyIHN0TWFwID0gdGhpcy5zdGF0ZU1hcCxcclxuICAgICAgICBjZmcgPSBUYWJzLnN0YXRpY01hcDtcclxuICAgIHN0TWFwLiR0YWJOYXZJdGVtLnJlbW92ZUNsYXNzKGNmZy5hY3RpdmVDbGFzcyk7XHJcbiAgICBzdE1hcC4kdGFiTmF2SXRlbS5lcShpbmRleCkuYWRkQ2xhc3MoY2ZnLmFjdGl2ZUNsYXNzKTtcclxuICAgIHN0TWFwLmFjdGl2ZUluZGV4ID0gaW5kZXg7XHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS5zd2l0Y2hQYW5lbCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgIHZhciBzdE1hcCA9IHRoaXMuc3RhdGVNYXAsXHJcbiAgICAgICAgY2ZnID0gVGFicy5zdGF0aWNNYXA7XHJcbiAgICB2YXIgJGFjdGl2ZU5hdiA9IHN0TWFwLiR0YWJQYW5lbC5lcShpbmRleCk7XHJcbiAgICBzdE1hcC4kdGFiUGFuZWwucmVtb3ZlQ2xhc3MoY2ZnLmFjdGl2ZUNsYXNzKTtcclxuICAgIHN0TWFwLiR0YWJQYW5lbC5lcShpbmRleCkuYWRkQ2xhc3MoY2ZnLmFjdGl2ZUNsYXNzKTtcclxuICAgIHN0TWFwLmFjdGl2ZUluZGV4ID0gaW5kZXg7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrID0gJC5wcm94eShmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xyXG4gICAgfSx0aGlzKTtcclxuXHJcbiAgICBzdXBwb3J0VHJhbnNpdGlvbiA/ICRhY3RpdmVOYXYub25lKHN1cHBvcnRUcmFuc2l0aW9uLmVuZCwgY2FsbGJhY2spIDogY2FsbGJhY2s7XHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICB0aGlzLiRlbC5vZmYoXCIudGFicy56d3VpXCIpO1xyXG59O1xyXG5cclxudmFyIFBsdWdpbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBlbCA9IFRhYnMuc3RhdGljTWFwLnRhYnMsXHJcbiAgICAgICAgICAgIG9wdGlvbnM7XHJcbiAgICAgICAgdmFyICR0YWJzID0gJHRoaXMuaXMoZWwpICYmICR0aGlzIHx8ICR0aGlzLmNsb3Nlc3QoZWwpO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gVUkudXRpbHMucGFyc2VPcHRpb25zKCR0YWJzLmRhdGEoJ3RhYnMnKSk7XHJcblxyXG4gICAgICAgIHZhciB0YWJzID0gbmV3IFRhYnMoJHRhYnNbMF0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9KTtcclxufVxyXG5cclxuJC5mbi50YWJzID0gUGx1Z2luO1xyXG5cclxuVUkucmVhZHkoZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAkKCdbZGF0YS16dy13aWRnZXQ9XCJ0YWJzXCJdJywgY29udGV4dCkudGFicygpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUkudGFicyA9IFRhYnM7IiwidmFyIFVJID0gcmVxdWlyZShcIi4vY29yZVwiKVxucmVxdWlyZShcIi4vdWkuaW1hZ2VzY2FsZVwiKVxucmVxdWlyZShcIi4vdWkuc2Nyb2xsXCIpXG5yZXF1aXJlKFwiLi91aS5zbGlkZXJcIilcbnJlcXVpcmUoXCIuL3VpLnRhYnNcIilcblxubW9kdWxlLmV4cG9ydHMgPSAkLlpXVUkgPSBVSTtcbiJdfQ==
