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
            w = window.getComputedStyle(parent[0]).width;
        }
    }

    w = parseFloat(w, 10);

	!isNaN(w) && $el.height(w * radio);
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
 * Created by linxiaojie on 2015/11/11.
 */

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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

    //���ÿ���
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


    //Ŀ��ͼ����ʾԴͼ����canvas����ֱ�ӻ������ֲ�
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

    //resizeCanvas���ÿ���
    me.resizeCanvas();

    //�������ֲ�
    me.layer();

    //�����¼�
    me.$el.trigger('removeTapEvent.lottery.zwui');
    me.addEvent();
};


//�������ɣ�������Ʒ��ʾ
Lottery.prototype.gameOver = function(){
    var me = this;

    me.setVisible(false);

    me.$el.trigger('gameover', [me.configMap.award]);
};

//�ιο������¼�
Lottery.prototype.addEvent = function(){
    var me = this,
        canvas = me.stateMap.$canvas[0],
        ctx = canvas.getContext('2d'),
        x1, y1, a = duration = me.configMap.duration,
        timeout, totimes = 100;

    //���Ϊ�յ�ʱ��������canvas�¼�
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

        //���ڴ�С�䶯ʱ����Ҫ���³�ʼ��canvas���ṩ�����¼�
        me.$el.one("removeTapEvent.lottery.zwui",function(){
            //console.count('canvas-removeTapEvent');
            canvas.removeEventListener("touchstart", tapstartHandler);
            canvas.removeEventListener("touchend", tapendHandler );
        });
    }

    //ȫ���¼������ڱ䶯ʱ�����³�ʼ��canvas//TODO:Ӧ�üӸ�ʱ�����ƣ�resize������PC�˴�����ʱ��ִ�����Ⱥܶ�
    $(window).on('resize', function(e){
        me && me.refresh();
    });
};


Lottery.prototype.on = function(){
    var slice = [].slice;
    this.$el.on.apply(this.$el, slice.call(arguments));
};

//���ý�Ʒ����Ʒ�������ɺ������ӻ����¼�// thanks :�޽�Ʒ������Ĭ���н�Ʒ
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],4:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/11/11.
 */

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var UI = require('./core');
var supportTransition = UI.support.transition;

function Rotary(element, options){
    this.$el = $(element);
    this.configMap = $.extend({}, this.configMap, options || {});
    this.init();
    this.addEvent();
}

Rotary.staticMap = {
    dial: '.zw-rotary-dial',
    indicator: '.zw-rotary-indicator',
    btn: '.zw-rotary-btn'
};

/*
    awards:{
         1:{max_angle:0 ,min_angle:60  },
         2:{max_angle:270 ,min_angle:225 },
         3:{max_angle:45 ,min_angle: 0},
         thanks:{
            angles:[
             {max_angle:90 ,min_angle:45 },
             {max_angle:135 ,min_angle:90 },
             {max_angle:225 ,min_angle:180 },
             {max_angle:315 ,min_angle:270 },
             {max_angle:360 ,min_angle:315 }
            ]
         }
     }

 */
Rotary.prototype.configMap = {
    awards: {}, //�����б�����ʼ����������
    fixAngle: 5,
    duration: 2
};

Rotary.prototype.stateMap = {
    //award: ''//��������,��Ϊ�ղſ��Գ齱
};

Rotary.prototype.init = function(){
    var me = this,
        static = Rotary.staticMap;

    me.stateMap = {
        dial: me.$(static.dial),
        indicator: me.$(static.indicator)
    };
};

/*
    @rangle {number} ת����ת�Ƕ�
    @award {number} ����
    ִ����ת�������������մ����н������¼�������award

 */
Rotary.prototype.rotate = function(rangle, award){
    var me = this,
        duration = me.configMap.duration;

    me.animate(rangle);
    me.$el.trigger('gameover', [award]);
};

Rotary.prototype.animate = function(rangle, duration){
    var d = duration === undefined ? this.configMap.duration : duration;
    this.stateMap.dial.css({
        'transform' : 'rotate(' + rangle + 'deg)',
        'transition-duration' : d
    });
};


/*
    ��ʼת����Ϸ����ȡ���õĽ�����ת��Ӧ����ת�ĽǶ�
 */
Rotary.prototype.startGame = function(award){
    var me = this,ad,
        awards = me.configMap.awards;

    if(award == undefined || !(ad = awards[award])){
        return ;
    }

    var maxAngle ,minAngle;
    if(ad.angles){
        var rom = me.random(0, ad.angles.length - 1);
        maxAngle = ad.angles[rom].max_angle;
        minAngle = ad.angles[rom].min_angle;
    }else{
        maxAngle = ad.max_angle;
        minAngle = ad.min_angle;
    }

    //��Ҫָ�����У����������޸�
    var fixMax = maxAngle - me.configMap.fixAngle;
    var fixMin = minAngle + me.configMap.fixAngle;
    var angle = me.random(fixMin, fixMax);

    //����
    me.animate(0,0);
    //ת��
    me.rotate(angle, award);
};


Rotary.prototype.random = function(min, max){
    var choices = max - min +1;
    return Math.floor( Math.random() * choices + min);
},


Rotary.prototype.addEvent = function(){

};


Rotary.prototype.$ = function(el){
    return this.$el.find(el);
};



Rotary.prototype.destroy = function(){

};


module.exports = UI.rotary = Rotary;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],5:[function(require,module,exports){
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

},{"./core":1}],6:[function(require,module,exports){
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
    animateTime: 200, //动画时间
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

},{"./core":1}],7:[function(require,module,exports){
(function (global){
/**
 * Created by linxiaojie on 2015/11/11.
 */

var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var UI = require('./core');
var supportTransition = UI.support.transition;

function Demo(element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options || {});
    this.init();
    this.addEvent();
}

Demo.staticMap = {

};

Demo.prototype.configMap = {

};

Demo.prototype.stateMap = {

};

Demo.prototype.init = function(){

};

Demo.prototype.addEvent = function(){

};


Demo.prototype.$ = function(el){
    return this.$el.find(el);
};



Demo.prototype.destroy = function(){

};


var Plugin = function(){
    this.each(function(){
        var $this = $(this),
            el = Demo.staticMap.tabs,
            options;
        var $demo = $this.is(el) && $this || $this.closest(el);

        options = UI.utils.parseOptions($demo.data('demo'));

        var tabs = new Demo($demo[0], options);

        return this;

    });
};

$.fn.demo = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="tabs"]', context).demo();
});


module.exports = UI.demo = Demo;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core":1}],8:[function(require,module,exports){
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

},{"./core":1}],9:[function(require,module,exports){
var UI = require("./core")
require("./ui.imagescale")
require("./ui.lottery")
require("./ui.rotary")
require("./ui.scroll")
require("./ui.slider")
require("./ui.slot")
require("./ui.tabs")

module.exports = $.ZWUI = UI;

},{"./core":1,"./ui.imagescale":2,"./ui.lottery":3,"./ui.rotary":4,"./ui.scroll":5,"./ui.slider":6,"./ui.slot":7,"./ui.tabs":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb3JlLmpzIiwianMvdWkuaW1hZ2VzY2FsZS5qcyIsImpzL3VpLmxvdHRlcnkuanMiLCJqcy91aS5yb3RhcnkuanMiLCJqcy91aS5zY3JvbGwuanMiLCJqcy91aS5zbGlkZXIuanMiLCJqcy91aS5zbG90LmpzIiwianMvdWkudGFicy5qcyIsImpzL3p3dWkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMC8xOS5cclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKiBqc2hpbnQgLVcwNDAgKi9cclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcclxuXHJcbmlmICh0eXBlb2YgJCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignWncgVUkgMS54IHJlcXVpcmVzIGpRdWVyeSAnKTtcclxufVxyXG5cclxudmFyIFVJID0gJC5aV1VJIHx8IHt9O1xyXG52YXIgJHdpbiA9ICQod2luZG93KTtcclxudmFyIGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcclxudmFyICRodG1sID0gJCgnaHRtbCcpO1xyXG5cclxuVUkuVkVSU0lPTiA9ICd7e1ZFUlNJT059fSc7XHJcblxyXG5VSS5ET01XYXRjaGVycyA9IFtdO1xyXG5VSS5ET01SZWFkeSA9IGZhbHNlO1xyXG5cclxuXHJcblVJLnN1cHBvcnQgPSB7fTtcclxuXHJcblVJLnN1cHBvcnQudHJhbnNpdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICAgIHZhciB0cmFuc2l0aW9uRW5kID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy90cmFuc2l0aW9uZW5kI0Jyb3dzZXJfY29tcGF0aWJpbGl0eVxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jLmJvZHkgfHwgZG9jLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG4gICAgICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgICAgICAgIE1velRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIHJldHVybiB0cmFuc2l0aW9uRW5kICYmIHtlbmQ6IHRyYW5zaXRpb25FbmR9O1xyXG59KSgpO1xyXG5cclxuVUkudXRpbHMgPSB7fTtcclxuLyoganNoaW50IC1XMDU0ICovXHJcblVJLnV0aWxzLnBhcnNlT3B0aW9ucyA9IFVJLnV0aWxzLm9wdGlvbnMgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIGlmICgkLmlzUGxhaW5PYmplY3Qoc3RyaW5nKSkge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXJ0ID0gKHN0cmluZyA/IHN0cmluZy5pbmRleE9mKCd7JykgOiAtMSk7XHJcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xyXG5cclxuICAgIGlmIChzdGFydCAhPSAtMSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSAobmV3IEZ1bmN0aW9uKCcnLFxyXG4gICAgICAgICAgICAgICAgJ3ZhciBqc29uID0gJyArIHN0cmluZy5zdWJzdHIoc3RhcnQpICtcclxuICAgICAgICAgICAgICAgICc7IHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGpzb24pKTsnKSkoKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvcHRpb25zO1xyXG59O1xyXG5cclxuVUkucmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgVUkuRE9NV2F0Y2hlcnMucHVzaChjYWxsYmFjayk7XHJcbiAgICBpZiAoVUkuRE9NUmVhZHkpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnUmVhZHkgY2FsbCcpO1xyXG4gICAgICAgIGNhbGxiYWNrKGRvY3VtZW50KTtcclxuICAgIH1cclxufTtcclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHJcbiAgICBVSS5ET01SZWFkeSA9IHRydWU7XHJcblxyXG4gICAgLy8gUnVuIGRlZmF1bHQgaW5pdFxyXG4gICAgJC5lYWNoKFVJLkRPTVdhdGNoZXJzLCBmdW5jdGlvbihpLCB3YXRjaGVyKSB7XHJcbiAgICAgICAgd2F0Y2hlcihkb2N1bWVudCk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBsaW54aWFvamllIG9uIDIwMTUvMTEvMy5cclxuICog77+977+977+977+977+977+977+977+9zbzGrO+/ve+/ve+/ve+/ve+/vd+x77+977+977+977+977+9XHJcbiAqXHJcbiAqINKz77+977+977+977+977+977+91q7vv73vv73WtO+/vdCj77+91rvWtO+/ve+/vdK777+9zqPvv71cclxuICog77+977+977+977+91q7vv73vv73vv73euMS477+977+977+977+977+977+977+9zbzGrO+/ve+/vXJhZGlv77+977+977+977+977+977+90Kfvv73vv73vv73Wtu+/ve+/ve+/ve+/ve+/vVxyXG4gKlxyXG4gKi9cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL2NvcmUnKTtcclxuXHJcbmZ1bmN0aW9uIHNjYWxlKCRlbCwgcmFkaW8pe1xyXG4gICAgJGVsID0gJGVsLmZpcnN0KCk7XHJcbiAgICB2YXIgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCRlbFswXSkud2lkdGg7XHJcbiAgICBpZigvJS9nLnRlc3Qodykpe1xyXG4gICAgICAgIHZhciBwYXJlbnQgPSAkZWwucGFyZW50KCk7XHJcbiAgICAgICAgaWYocGFyZW50Lmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUocGFyZW50WzBdKS53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdyA9IHBhcnNlRmxvYXQodywgMTApO1xyXG5cclxuXHQhaXNOYU4odykgJiYgJGVsLmhlaWdodCh3ICogcmFkaW8pO1xyXG59XHJcblxyXG52YXIgUGx1Z2luID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIG9wdGlvbnM7XHJcbiAgICAgICAgb3B0aW9ucyA9IFVJLnV0aWxzLnBhcnNlT3B0aW9ucygkdGhpcy5kYXRhKCdzY2FsZScpKTtcclxuICAgICAgICBzY2FsZSgkdGhpcywgb3B0aW9ucyAmJiBvcHRpb25zLnJhZGlvIHx8IDEpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9KTtcclxufVxyXG5cclxuJC5mbi5pbWFnZXNjYWxlID0gUGx1Z2luO1xyXG5cclxuVUkucmVhZHkoZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAkKCdbZGF0YS16dy13aWRnZXQ9XCJpbWFnZXNjYWxlXCJdJywgY29udGV4dCkuaW1hZ2VzY2FsZSgpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUkuaW1hZ2VTY2FsZSA9IHtcclxuICAgIHNjYWxlOiBzY2FsZVxyXG59OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMS8xMS5cclxuICovXHJcblxyXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vY29yZScpO1xyXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSBVSS5zdXBwb3J0LnRyYW5zaXRpb247XHJcblxyXG5mdW5jdGlvbiBMb3R0ZXJ5KGVsZW1lbnQsIG9wdGlvbnMpe1xyXG4gICAgdGhpcy4kZWwgPSAkKGVsZW1lbnQpO1xyXG5cclxuICAgIHRoaXMuY29uZmlnTWFwID0gJC5leHRlbmQoe30sIHRoaXMuY29uZmlnTWFwLCBvcHRpb25zIHx8IHt9KTtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5Mb3R0ZXJ5LnN0YXRpY01hcCA9IHtcclxuICAgIGJveDogJy56dy1sb3R0ZXJ5LWJveCcsXHJcbiAgICBhZ2FpbjogJy56dy1sb3R0ZXJ5LWFnYWluJyxcclxuICAgIGF3YXJkOiAnLnp3LWxvdHRlcnktYXdhcmQnLFxyXG4gICAgY2FudmFzOiAnY2FudmFzJyxcclxuICAgIHRoYW5rczogJ3RoYW5rcycgLy90aGFua3MgOu+/vd6977+9xrfvv73vv73vv73vv73vv73vv73ErO+/ve+/ve+/vdC977+9xrdcclxufTtcclxuXHJcbkxvdHRlcnkucHJvdG90eXBlLmNvbmZpZ01hcCA9IHtcclxuICAgIGNvdmVyOiAnZ3JheScsXHJcbiAgICBkdXJhdGlvbjogMjAsIC8v77+977+977+977+977+977+91rHvv73vv73vv73vv73QoVxyXG4gICAgYXdhcmQ6ICcnIC8v77+977+977+977+9XHJcbn07XHJcblxyXG5Mb3R0ZXJ5LnByb3RvdHlwZS5zdGF0ZU1hcCA9IHtcclxuICAgIHdpZHRoOiAwLFxyXG4gICAgaGVpZ2h0OiAwLFxyXG4gICAgb2Zmc2V0WDogMCxcclxuICAgIG9mZnNldFk6IDAsXHJcbiAgICBhd2FyZDogJycsIC8v77+977+977+977+9XHJcbiAgICBjYW5EZWFsOiB0cnVlIC8v77+977+977+9zrnOv++/ve+/ve+/ve+/ve+/ve+/vcO5zr/vv73vv73CvO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vemjrNK777+9zrnOv++/ve+/ve+/ve+/ve+/vda777+93LTvv73vv73vv73Su++/ve+/vVxyXG59O1xyXG5cclxuTG90dGVyeS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0aWMgPSBMb3R0ZXJ5LnN0YXRpY01hcDtcclxuXHJcbiAgICBtZS5zdGF0ZU1hcCA9IHtcclxuICAgICAgICAkYm94OiBtZS4kKHN0YXRpYy5ib3gpLFxyXG4gICAgICAgICRhd2FyZDogbWUuJChzdGF0aWMuYXdhcmQpLFxyXG4gICAgICAgICRhZ2FpbjogbWUuJChzdGF0aWMuYWdhaW4pLFxyXG4gICAgICAgICRjYW52YXM6IG1lLiQoc3RhdGljLmNhbnZhcykuZmlyc3QoKVxyXG4gICAgfTtcclxuXHJcbiAgICAvL++/ve+/ve+/vcO977+977+97qOs77+977+9yr7vv73vv73Tpu+/ve+/vWRpdu+/ve+/ve+/ve+/ve+/ve+/vWNhbnZhc++/ve+/vcq877+977+9XHJcbiAgICBtZS5zZXRBd2FyZChtZS5jb25maWdNYXAuYXdhcmQpO1xyXG59O1xyXG5cclxuLy9jYW52YXPvv73vv73KvO+/ve+/vVxyXG5Mb3R0ZXJ5LnByb3RvdHlwZS5yZXNpemVDYW52YXMgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZSA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgICRjYW52YXMgPSBzdGF0ZS4kY2FudmFzLFxyXG4gICAgICAgICRib3ggPSBzdGF0ZS4kYm94O1xyXG5cclxuICAgIC8v77+977+977+9w7/vv73vv73vv71cclxuICAgICRjYW52YXNbMF0ud2lkdGggPSBzdGF0ZS53aWR0aCA9ICRib3gud2lkdGgoKTtcclxuICAgICRjYW52YXNbMF0uaGVpZ2h0ID0gc3RhdGUuaGVpZ2h0ID0gJGJveC5oZWlnaHQoKTtcclxuICAgIG1lLm9mZnNldFggPSAkYm94Lm9mZnNldCgpLmxlZnQ7XHJcbiAgICBtZS5vZmZzZXRZID0gJGJveC5vZmZzZXQoKS50b3A7XHJcbn07XHJcblxyXG4vL++/ve+/ve+/ve+/vWNhdmFz77+977+977+91rLvv71cclxuTG90dGVyeS5wcm90b3R5cGUubGF5ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIGN0eCA9IHN0YXRlTWFwLiRjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcblxyXG4gICAgLy/Ev++/ve+/vc2877+977+977+977+9yr7UtM2877+977+977+977+9Y2FudmFz77+977+977+977+91rHvv73Tu++/ve+/ve+/ve+/ve+/ve+/vday77+9XHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJzb3VyY2Utb3ZlclwiO1xyXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBzdGF0ZU1hcC53aWR0aCwgc3RhdGVNYXAuaGVpZ2h0KTtcclxuICAgIGN0eC5maWxsU3R5bGUgPSAnZ3JheSc7XHJcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgc3RhdGVNYXAud2lkdGgsIHN0YXRlTWFwLmhlaWdodCk7XHJcbn07XHJcblxyXG4vL++/ve+/vda177+9zrnOv++/vde0zKxcclxuTG90dGVyeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlID0gbWUuc3RhdGVNYXAsXHJcbiAgICAgICAgJGNhbnZhcyA9IHN0YXRlLiRjYW52YXMsXHJcbiAgICAgICAgJGJveCA9IHN0YXRlLiRib3g7XHJcblxyXG4gICAgLy9yZXNpemVDYW52YXPvv73vv73vv73Dv++/ve+/ve+/vVxyXG4gICAgbWUucmVzaXplQ2FudmFzKCk7XHJcblxyXG4gICAgLy/vv73vv73vv73vv73vv73vv73vv73Wsu+/vVxyXG4gICAgbWUubGF5ZXIoKTtcclxuXHJcbiAgICAvL++/ve+/ve+/ve+/ve+/vcK877+9XHJcbiAgICBtZS4kZWwudHJpZ2dlcigncmVtb3ZlVGFwRXZlbnQubG90dGVyeS56d3VpJyk7XHJcbiAgICBtZS5hZGRFdmVudCgpO1xyXG59O1xyXG5cclxuXHJcbi8v77+977+977+977+977+977+977+9yaPvv73vv73vv73vv73vv73vv73vv73Gt++/ve+/vcq+XHJcbkxvdHRlcnkucHJvdG90eXBlLmdhbWVPdmVyID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXM7XHJcblxyXG4gICAgbWUuc2V0VmlzaWJsZShmYWxzZSk7XHJcblxyXG4gICAgbWUuJGVsLnRyaWdnZXIoJ2dhbWVvdmVyJywgW21lLmNvbmZpZ01hcC5hd2FyZF0pO1xyXG59O1xyXG5cclxuLy/vv73Ouc6/77+977+977+977+977+977+9wrzvv71cclxuTG90dGVyeS5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBjYW52YXMgPSBtZS5zdGF0ZU1hcC4kY2FudmFzWzBdLFxyXG4gICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxyXG4gICAgICAgIHgxLCB5MSwgYSA9IGR1cmF0aW9uID0gbWUuY29uZmlnTWFwLmR1cmF0aW9uLFxyXG4gICAgICAgIHRpbWVvdXQsIHRvdGltZXMgPSAxMDA7XHJcblxyXG4gICAgLy/vv73vv73vv73usrvOqu+/vdW177+9yrHvv73vv73vv73vv73vv73vv73vv73vv71jYW52YXPvv73CvO+/vVxyXG4gICAgaWYobWUuc3RhdGVNYXAuYXdhcmQgIT09ICcnKXtcclxuICAgICAgICBjdHgubGluZUNhcCA9IFwicm91bmRcIjtcclxuICAgICAgICBjdHgubGluZUpvaW4gPSBcInJvdW5kXCI7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGEgKiAyO1xyXG4gICAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcImRlc3RpbmF0aW9uLW91dFwiO1xyXG4gICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0YXBzdGFydEhhbmRsZXIpO1xyXG4gICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGFwZW5kSGFuZGxlciApO1xyXG4gICAgICAgIGZ1bmN0aW9uIHRhcHN0YXJ0SGFuZGxlcihlKXtcclxuICAgICAgICAgICAgLy8kKCcudGlwJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAvL++/ve+/vcq877+9zr/vv73vv73vv73vv73vv71cclxuICAgICAgICAgICAgaWYobWUuc3RhdGVNYXAuY2FuRGVhbCl7XHJcbiAgICAgICAgICAgICAgICBtZS5zdGF0ZU1hcC5jYW5EZWFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBtZS4kZWwudHJpZ2dlcignc3RhcnRnYW1lJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vY29uc29sZS5jb3VudCgnY2FudmFzLXRvdWNoc3RhcnQnKTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgZSA9IGUudGFyZ2V0VG91Y2hlc1swXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHgxID0gZS5wYWdlWCAtIG1lLm9mZnNldFg7XHJcbiAgICAgICAgICAgIHkxID0gZS5wYWdlWSAtIG1lLm9mZnNldFk7XHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgICAgICAgICBjdHguYXJjKHgxLCB5MSwgMSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCB0YXBtb3ZlSGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHRhcGVuZEhhbmRsZXIoZSl7XHJcbiAgICAgICAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRhcG1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1nRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHZhciBkZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGltZ0RhdGEud2lkdGg7IHggKz0gZHVyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGltZ0RhdGEuaGVpZ2h0OyB5ICs9IGR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpID0gKHkgKiBpbWdEYXRhLndpZHRoICsgeCkgKiA0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nRGF0YS5kYXRhW2kgKyAzXSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRkKytcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkZCAvIChpbWdEYXRhLndpZHRoICogaW1nRGF0YS5oZWlnaHQgLyAoZHVyYXRpb24gKiBkdXJhdGlvbikpIDwgMC41KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWUuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdG90aW1lcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gdGFwbW92ZUhhbmRsZXIoZSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgZSA9IGUudGFyZ2V0VG91Y2hlc1tlLnRhcmdldFRvdWNoZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeDIgPSBlLnBhZ2VYIC0gbWUub2Zmc2V0WDtcclxuICAgICAgICAgICAgeTIgPSBlLnBhZ2VZIC0gbWUub2Zmc2V0WTtcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKHgyLCB5Mik7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgeDEgPSB4MjtcclxuICAgICAgICAgICAgeTEgPSB5MjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v77+977+977+92rTvv73Qoe+/veS2r8qx77+977+977+977+90qrvv73vv73vv73Cs++/vcq877+977+9Y2FudmFz77+977+977+94bmp77+977+977+977+977+9wrzvv71cclxuICAgICAgICBtZS4kZWwub25lKFwicmVtb3ZlVGFwRXZlbnQubG90dGVyeS56d3VpXCIsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmNvdW50KCdjYW52YXMtcmVtb3ZlVGFwRXZlbnQnKTtcclxuICAgICAgICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRhcHN0YXJ0SGFuZGxlcik7XHJcbiAgICAgICAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGFwZW5kSGFuZGxlciApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vyKvvv73vv73vv73CvO+/ve+/ve+/ve+/ve+/ve+/vdqx5LavyrHvv73vv73vv73vv73vv73Cs++/vcq877+977+9Y2FudmFzLy9UT0RPOtOm77+9w7zTuO+/vcqx77+977+977+977+977+9xqPvv71yZXNpemXvv73vv73vv73vv73vv73vv71QQ++/vcu077+977+977+977+977+9yrHvv73vv73WtO+/ve+/ve+/ve+/ve+/vci63Lbvv71cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24oZSl7XHJcbiAgICAgICAgbWUgJiYgbWUucmVmcmVzaCgpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5cclxuTG90dGVyeS5wcm90b3R5cGUub24gPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHNsaWNlID0gW10uc2xpY2U7XHJcbiAgICB0aGlzLiRlbC5vbi5hcHBseSh0aGlzLiRlbCwgc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcclxufTtcclxuXHJcbi8v77+977+977+9w73vv73Gt++/ve+/ve+/ve+/vca377+977+977+977+977+977+977+9ybrvv73vv73vv73vv73vv73vv73Tu++/ve+/ve+/ve+/vcK877+9Ly8gdGhhbmtzIDrvv73eve+/vca377+977+977+977+977+977+9xKzvv73vv73vv73Qve+/vca3XHJcbkxvdHRlcnkucHJvdG90eXBlLnNldEF3YXJkID0gZnVuY3Rpb24oYXdhcmQpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAkYXdhcmQgPSBtZS5zdGF0ZU1hcC4kYXdhcmQsXHJcbiAgICAgICAgJGFnYWluID0gbWUuc3RhdGVNYXAuJGFnYWluO1xyXG5cclxuICAgIG1lLnN0YXRlTWFwLmF3YXJkID0gYXdhcmQ7XHJcbiAgICBtZS5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgbWUuc3RhdGVNYXAuY2FuRGVhbCA9IHRydWU7XHJcblxyXG4gICAgaWYoTG90dGVyeS5zdGF0aWNNYXAudGhhbmtzID09PSBhd2FyZCl7XHJcbiAgICAgICAgJGFnYWluLmNzcyh7dmlzaWJpbGl0eTogJ3Zpc2libGUnfSk7XHJcbiAgICAgICAgJGF3YXJkLmNzcyh7dmlzaWJpbGl0eTogJ2hpZGRlbid9KTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgICRhZ2Fpbi5jc3Moe3Zpc2liaWxpdHk6ICdoaWRkZW4nfSk7XHJcbiAgICAgICAgJGF3YXJkLmNzcyh7dmlzaWJpbGl0eTogJ3Zpc2libGUnfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1lLnJlZnJlc2goKTtcclxufTtcclxuXHJcbkxvdHRlcnkucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbihzdGF0dXMpe1xyXG4gICAgdGhpcy5zdGF0ZU1hcC4kY2FudmFzLnRvZ2dsZSghIXN0YXR1cyk7XHJcbn07XHJcblxyXG5Mb3R0ZXJ5LnByb3RvdHlwZS4kID0gZnVuY3Rpb24oZWwpe1xyXG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoZWwpO1xyXG59O1xyXG5cclxuXHJcblxyXG5Mb3R0ZXJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJGVsLm9mZignZ2FtZW91dCcpO1xyXG4gICAgdGhpcy4kZWwub2ZmKCdzdGFydGdhbWUnKVxyXG4gICAgdGhpcy4kZWwudHJpZ2dlcigncmVtb3ZlVGFwRXZlbnQubG90dGVyeS56d3VpJyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJLmxvdHRlcnkgPSBMb3R0ZXJ5OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMS8xMS5cclxuICovXHJcblxyXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XHJcbnZhciBVSSA9IHJlcXVpcmUoJy4vY29yZScpO1xyXG52YXIgc3VwcG9ydFRyYW5zaXRpb24gPSBVSS5zdXBwb3J0LnRyYW5zaXRpb247XHJcblxyXG5mdW5jdGlvbiBSb3RhcnkoZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XHJcbiAgICB0aGlzLmNvbmZpZ01hcCA9ICQuZXh0ZW5kKHt9LCB0aGlzLmNvbmZpZ01hcCwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICB0aGlzLmluaXQoKTtcclxuICAgIHRoaXMuYWRkRXZlbnQoKTtcclxufVxyXG5cclxuUm90YXJ5LnN0YXRpY01hcCA9IHtcclxuICAgIGRpYWw6ICcuenctcm90YXJ5LWRpYWwnLFxyXG4gICAgaW5kaWNhdG9yOiAnLnp3LXJvdGFyeS1pbmRpY2F0b3InLFxyXG4gICAgYnRuOiAnLnp3LXJvdGFyeS1idG4nXHJcbn07XHJcblxyXG4vKlxyXG4gICAgYXdhcmRzOntcclxuICAgICAgICAgMTp7bWF4X2FuZ2xlOjAgLG1pbl9hbmdsZTo2MCAgfSxcclxuICAgICAgICAgMjp7bWF4X2FuZ2xlOjI3MCAsbWluX2FuZ2xlOjIyNSB9LFxyXG4gICAgICAgICAzOnttYXhfYW5nbGU6NDUgLG1pbl9hbmdsZTogMH0sXHJcbiAgICAgICAgIHRoYW5rczp7XHJcbiAgICAgICAgICAgIGFuZ2xlczpbXHJcbiAgICAgICAgICAgICB7bWF4X2FuZ2xlOjkwICxtaW5fYW5nbGU6NDUgfSxcclxuICAgICAgICAgICAgIHttYXhfYW5nbGU6MTM1ICxtaW5fYW5nbGU6OTAgfSxcclxuICAgICAgICAgICAgIHttYXhfYW5nbGU6MjI1ICxtaW5fYW5nbGU6MTgwIH0sXHJcbiAgICAgICAgICAgICB7bWF4X2FuZ2xlOjMxNSAsbWluX2FuZ2xlOjI3MCB9LFxyXG4gICAgICAgICAgICAge21heF9hbmdsZTozNjAgLG1pbl9hbmdsZTozMTUgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgIH1cclxuICAgICB9XHJcblxyXG4gKi9cclxuUm90YXJ5LnByb3RvdHlwZS5jb25maWdNYXAgPSB7XHJcbiAgICBhd2FyZHM6IHt9LCAvL++/ve+/ve+/ve+/ve+/vdCx77+977+977+977+977+9yrzvv73vv73vv73vv73vv73vv73vv73vv73vv73vv71cclxuICAgIGZpeEFuZ2xlOiA1LFxyXG4gICAgZHVyYXRpb246IDJcclxufTtcclxuXHJcblJvdGFyeS5wcm90b3R5cGUuc3RhdGVNYXAgPSB7XHJcbiAgICAvL2F3YXJkOiAnJy8v77+977+977+977+977+977+977+977+9LO+/ve+/vc6q77+91bLFv++/ve+/vdSz6b2xXHJcbn07XHJcblxyXG5Sb3RhcnkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0aWMgPSBSb3Rhcnkuc3RhdGljTWFwO1xyXG5cclxuICAgIG1lLnN0YXRlTWFwID0ge1xyXG4gICAgICAgIGRpYWw6IG1lLiQoc3RhdGljLmRpYWwpLFxyXG4gICAgICAgIGluZGljYXRvcjogbWUuJChzdGF0aWMuaW5kaWNhdG9yKVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qXHJcbiAgICBAcmFuZ2xlIHtudW1iZXJ9INeq77+977+977+977+916rvv73Htu+/vVxyXG4gICAgQGF3YXJkIHtudW1iZXJ9IO+/ve+/ve+/ve+/vVxyXG4gICAg1rTvv73vv73vv73vv73Xqu+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vdW077+977+977+977+90L3vv73vv73vv73vv73vv73vv73CvO+/ve+/ve+/ve+/ve+/ve+/ve+/vWF3YXJkXHJcblxyXG4gKi9cclxuUm90YXJ5LnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbihyYW5nbGUsIGF3YXJkKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgZHVyYXRpb24gPSBtZS5jb25maWdNYXAuZHVyYXRpb247XHJcblxyXG4gICAgbWUuYW5pbWF0ZShyYW5nbGUpO1xyXG4gICAgbWUuJGVsLnRyaWdnZXIoJ2dhbWVvdmVyJywgW2F3YXJkXSk7XHJcbn07XHJcblxyXG5Sb3RhcnkucHJvdG90eXBlLmFuaW1hdGUgPSBmdW5jdGlvbihyYW5nbGUsIGR1cmF0aW9uKXtcclxuICAgIHZhciBkID0gZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IHRoaXMuY29uZmlnTWFwLmR1cmF0aW9uIDogZHVyYXRpb247XHJcbiAgICB0aGlzLnN0YXRlTWFwLmRpYWwuY3NzKHtcclxuICAgICAgICAndHJhbnNmb3JtJyA6ICdyb3RhdGUoJyArIHJhbmdsZSArICdkZWcpJyxcclxuICAgICAgICAndHJhbnNpdGlvbi1kdXJhdGlvbicgOiBkXHJcbiAgICB9KTtcclxufTtcclxuXHJcblxyXG4vKlxyXG4gICAg77+977+9yrzXqu+/ve+/ve+/ve+/vc+377+977+977+977+9yKHvv73vv73vv73DtcS977+977+977+977+977+916rvv73vv73Tpu+/ve+/ve+/ve+/vdeq77+9xL3Htu+/vVxyXG4gKi9cclxuUm90YXJ5LnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbihhd2FyZCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLGFkLFxyXG4gICAgICAgIGF3YXJkcyA9IG1lLmNvbmZpZ01hcC5hd2FyZHM7XHJcblxyXG4gICAgaWYoYXdhcmQgPT0gdW5kZWZpbmVkIHx8ICEoYWQgPSBhd2FyZHNbYXdhcmRdKSl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbWF4QW5nbGUgLG1pbkFuZ2xlO1xyXG4gICAgaWYoYWQuYW5nbGVzKXtcclxuICAgICAgICB2YXIgcm9tID0gbWUucmFuZG9tKDAsIGFkLmFuZ2xlcy5sZW5ndGggLSAxKTtcclxuICAgICAgICBtYXhBbmdsZSA9IGFkLmFuZ2xlc1tyb21dLm1heF9hbmdsZTtcclxuICAgICAgICBtaW5BbmdsZSA9IGFkLmFuZ2xlc1tyb21dLm1pbl9hbmdsZTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIG1heEFuZ2xlID0gYWQubWF4X2FuZ2xlO1xyXG4gICAgICAgIG1pbkFuZ2xlID0gYWQubWluX2FuZ2xlO1xyXG4gICAgfVxyXG5cclxuICAgIC8v77+977+90qrWuO+/ve+/ve+/ve+/ve+/vdCj77+977+977+977+977+977+977+977+977+977+93rjvv71cclxuICAgIHZhciBmaXhNYXggPSBtYXhBbmdsZSAtIG1lLmNvbmZpZ01hcC5maXhBbmdsZTtcclxuICAgIHZhciBmaXhNaW4gPSBtaW5BbmdsZSArIG1lLmNvbmZpZ01hcC5maXhBbmdsZTtcclxuICAgIHZhciBhbmdsZSA9IG1lLnJhbmRvbShmaXhNaW4sIGZpeE1heCk7XHJcblxyXG4gICAgLy/vv73vv73vv73vv71cclxuICAgIG1lLmFuaW1hdGUoMCwwKTtcclxuICAgIC8v16rvv73vv71cclxuICAgIG1lLnJvdGF0ZShhbmdsZSwgYXdhcmQpO1xyXG59O1xyXG5cclxuXHJcblJvdGFyeS5wcm90b3R5cGUucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpe1xyXG4gICAgdmFyIGNob2ljZXMgPSBtYXggLSBtaW4gKzE7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIGNob2ljZXMgKyBtaW4pO1xyXG59LFxyXG5cclxuXHJcblJvdGFyeS5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbigpe1xyXG5cclxufTtcclxuXHJcblxyXG5Sb3RhcnkucHJvdG90eXBlLiQgPSBmdW5jdGlvbihlbCl7XHJcbiAgICByZXR1cm4gdGhpcy4kZWwuZmluZChlbCk7XHJcbn07XHJcblxyXG5cclxuXHJcblJvdGFyeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcblxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUkucm90YXJ5ID0gUm90YXJ5OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMS80LlxyXG4gKi9cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGlueGlhb2ppZSBvbiAyMDE1LzEwLzIxLlxyXG4gKi9cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xyXG52YXIgVUkgPSByZXF1aXJlKCcuL2NvcmUnKTtcclxudmFyIHN1cHBvcnRUcmFuc2l0aW9uID0gVUkuc3VwcG9ydC50cmFuc2l0aW9uO1xyXG5cclxudmFyIFNjcm9sbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKXtcclxuICAgIHRoaXMuJGVsID0gJChlbGVtZW50KTtcclxuXHJcbiAgICB0aGlzLmNvbmZpZ01hcCA9ICQuZXh0ZW5kKHt9LCB0aGlzLmNvbmZpZ01hcCwgb3B0aW9ucyk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn07XHJcblxyXG5TY3JvbGwuc3RhdGljTWFwID0ge1xyXG4gICAgc2Nyb2xsOiAnLnp3LXNjcm9sbCcsXHJcbiAgICBzY3JvbGxzOiAnLnp3LXNjcm9sbHMnLFxyXG4gICAgc2Nyb2xsSXRlbTogJy56dy1zY3JvbGwtaXRlbScsXHJcbiAgICB2aWV3cG9ydDogJy56dy12aWV3cG9ydCdcclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuY29uZmlnTWFwID0ge1xyXG4vKiAgICDvv73vv73vv73vv73vv73vv713aWR0aO+/ve+/vcSs77+977+9yrnvv73vv71pdGVt77+977+977+977+9XHJcbiAgICDvv73Zt9ax77+9IO+/ve+/ve+/ve+/vc6qdmlld3BvcnTvv73EsNm31rHIv++/ve+/ve+/vSovXHJcbiAgICB3aWR0aDogMCxcclxuICAgIC8vw6vvv73vv73vv73vv73Qp++/ve+/ve+/ve+/ve+/ve+/vS8v77+977+9zrtyZW1cclxuICAgIGZpbHRlcldpZHRoOiAwLFxyXG4gICAgcmFkaW86IDAuNSAvL++/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5zdGF0ZU1hcCA9IHtcclxuICAgIGxlbmd0aDogMCxcclxuICAgICRzY3JvbGxzOiBudWxsLFxyXG4gICAgJHNjcm9sbEl0ZW06IG51bGwsXHJcbiAgICBvZmZzZXRYOiAwLFxyXG4gICAgb2Zmc2V0WTogMCxcclxuICAgIGxhc3RUcmFuc2Zvcm06IDAsXHJcbiAgICBtaW5UcmFuc2Zvcm06IDAsXHJcbiAgICBtYXhUcmFuc2Zvcm06IDAsXHJcbiAgICBtb3ZlOiAwLCAvL++/vce377+977+977+977+9xrbvv71cclxuICAgIGNoZWNrOiAwLC8v77+9x7fvv73Qo++/vem0pe+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgZGVsdGE6IHtcclxuICAgICAgICB4OiAwLFxyXG4gICAgICAgIHk6IDBcclxuICAgIH0sXHJcbiAgICBzdGFydDoge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfVxyXG59O1xyXG5cclxuLy9TbGlkZXLvv73vv73KvO+/ve+/ve+/ve+/vVxyXG5TY3JvbGwucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0aWMgPSBTY3JvbGwuc3RhdGljTWFwLFxyXG4gICAgICAgIGNmZyA9IG1lLmNvbmZpZ01hcCxcclxuICAgICAgICBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcbiAgICAgICAgYm9keSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgdmFyIHNjcm9sbExlZnQgPSBkb2MgJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQgfHwgMDtcclxuICAgIHZhciBzY3JvbGxUb3AgPSBkb2MgJiBkb2Muc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wIHx8IDA7XHJcblxyXG4gICAgbWUuc3RhdGVNYXAgPSAkLmV4dGVuZCh7fSwgbWUuc3RhdGVNYXAsIHtcclxuICAgICAgICAkc2Nyb2xsczogbWUuJChzdGF0aWMuc2Nyb2xscyksXHJcbiAgICAgICAgJHNjcm9sbEl0ZW06IG1lLiQoc3RhdGljLnNjcm9sbEl0ZW0pLFxyXG4gICAgICAgICR2aWV3cG9ydDogbWUuJChzdGF0aWMudmlld3BvcnQpLFxyXG4gICAgICAgIG9mZnNldFg6IHNjcm9sbExlZnQsXHJcbiAgICAgICAgb2Zmc2V0WTogc2Nyb2xsVG9wXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgc3QgPSBtZS5zdGF0ZU1hcDtcclxuXHJcbiAgICBzdC5sZW5ndGggPSBzdC4kc2Nyb2xsSXRlbS5sZW5ndGhcclxuXHJcbiAgICBzdC5wZnggPSAoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgdHJhbnNQZnhOYW1lcyA9IHtcclxuICAgICAgICAgICAgV2Via2l0VHJhbnNpdGlvbjogJy13ZWJraXQtJyxcclxuICAgICAgICAgICAgTW96VHJhbnNpdGlvbjogJy1tb3otJyxcclxuICAgICAgICAgICAgT1RyYW5zaXRpb246ICctby0nLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yKHZhciBuYW1lIGluIHRyYW5zUGZ4TmFtZXMpe1xyXG4gICAgICAgICAgICBpZihtZS4kZWxbMF0uc3R5bGVbbmFtZV0gIT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zUGZ4TmFtZXNbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIHN0LnN0eWxlVHJhbnNmb3JtID0gc3QucGZ4ID09PSAnJyA/ICd0cmFuc2Zvcm0nIDogc3QucGZ4LnJlcGxhY2UoLy0vZywnJykgKyAnVHJhbnNmb3JtJztcclxuXHJcbiAgICBmdW5jdGlvbiByZWFkeSgpe1xyXG4gICAgICAgIG1lLmFkZEV2ZW50KCk7XHJcbiAgICAgICAgbWUuc3RhdGVNYXAuJHNjcm9sbHMuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcclxuICAgICAgICBtZS4kZWwudHJpZ2dlcignc2hvdy5TY3JvbGwuend1aScpO1xyXG4gICAgfTtcclxuXHJcbiAgICBtZS4kZWwub24oJ3JlYWR5LlNjcm9sbC56d3VpJywgJC5wcm94eShyZWFkeSwgbWUpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZSgpO1xyXG59O1xyXG5cclxuLy/vv73vv73vv73vv71zbGlkZXLvv73vv73vv73vv73Kve+/ve+/ve+/vcO977+977+977+977+977+977+977+9XHJcblNjcm9sbC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcCxcclxuICAgICAgICBjZmcgPSBtZS5jb25maWdNYXAsXHJcbiAgICAgICAgbGVuID0gc3RhdGVNYXAubGVuZ3RoLFxyXG4gICAgICAgIHdpZHRoID0gbWUuY29uZmlnTWFwLndpZHRoO1xyXG5cclxuICAgIGlmKGxlbiA+IDEpe1xyXG4gICAgICAgIHZhciB2aWV3cG9ydFdpZHRoID0gc3RhdGVNYXAuJHZpZXdwb3J0LndpZHRoKCksXHJcbiAgICAgICAgICAgIGl0ZW1XaWR0aCA9IHN0YXRlTWFwLiRzY3JvbGxJdGVtLmVxKDApLmlubmVyV2lkdGgoKTtcclxuICAgICAgICAvL++/vdm31rHvv70g77+977+977+977+9zqp2aWV3cG9ydO+/vcSw2bfWsci/77+977+977+9XHJcbiAgICAgICAgaWYoLyUvZy50ZXN0KHdpZHRoKSl7XHJcbiAgICAgICAgICAgIHdpZHRoID0gdmlld3BvcnRXaWR0aCAqIHBhcnNlRmxvYXQod2lkdGgpIC8gMTAwO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAvL8O777+977+977+977+977+977+9d2lkdGjvv73vv73Kue+/ve+/vWl0ZW1XaWR0aFxyXG4gICAgICAgICAgICB3aWR0aCA9ICF3aWR0aCA/IGl0ZW1XaWR0aCA6IHdpZHRoICogbWUuZ2V0Um9vdFNpemUoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAgICDvv73vv73vv73vv73vv73vv73vv73zs6S2yLrNv8m777+977+977+977+977+977+977+9XHJcbiAgICAgICAgICAgIMuuxr3vv73vv73vv73vv73vv73vv73vv73vv73vv73zu6y277+977+977+977+977+9zqogLSDLrsa977+977+977+977+9XHJcbiAgICAgICAgICAgIO+/ve+/ve+/vdK777+977+977+977+977+977+977+9zqogMFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHZhciBtYXggPSBsZW4gKiB3aWR0aCArIG1lLmNvbmZpZ01hcC5maWx0ZXJXaWR0aCAqIG1lLmdldFJvb3RTaXplKCk7XHJcbiAgICAgICAgLy/vv73vv73vv73vv73Su++/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vW1pblRyYW5zZm9ybe+/ve+/ve+/ve+/vc6qMFxyXG4gICAgICAgIHN0YXRlTWFwLm1pblRyYW5zZm9ybSA9IC0gKCBtYXggPiB2aWV3cG9ydFdpZHRoID8gbWF4IC0gdmlld3BvcnRXaWR0aCA6IDApO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coc3RhdGVNYXAubWluVHJhbnNmb3JtKVxyXG4gICAgICAgIHN0YXRlTWFwLm1heFRyYW5zZm9ybSA9IDA7XHJcblxyXG4gICAgICAgIHN0YXRlTWFwLiRzY3JvbGxzLndpZHRoKG1heCk7XHJcbiAgICAgICAgc3RhdGVNYXAuJHNjcm9sbEl0ZW0uY3NzKHtcclxuICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcclxuICAgICAgICAgICAgZmxvYXQ6ICdsZWZ0JyxcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtZS4kZWwudHJpZ2dlcigncmVhZHkuU2Nyb2xsLnp3dWknKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5TY3JvbGwucHJvdG90eXBlLmdldFJvb3RTaXplID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBmb250U2l6ZSwgJGR1bW15LCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgaWYoIXJvb3Qpe1xyXG4gICAgICAgICRkdW1teSA9ICQoJzxkaXYgc3R5bGU9XCJmb250LXNpemU6MXJlbVwiLz4nKTtcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCgkZHVtbXkpO1xyXG4gICAgICAgIHJvb3QgPSAkZHVtbXlbMF07XHJcbiAgICB9XHJcbiAgICBmb250U2l6ZSA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHJvb3QpLmZvbnRTaXplKTtcclxuXHJcbiAgICAkZHVtbXkgJiYgKCRkdW1teS5yZW1vdmUoKSk7XHJcbiAgICByZXR1cm4gaXNOYU4oZm9udFNpemUpPyAxMCA6IGZvbnRTaXplO1xyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5hZGRFdmVudCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgLy9tZS5zdGF0ZU1hcC4kdmlld3BvcnQub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgICB0aGlzLnByZSgpO1xyXG4gICAgLy99LmJpbmQodGhpcykpO1xyXG5cclxuICAgIG1lLiRlbC5vbihcInRvdWNoc3RhcnQuU2Nyb2xsLnp3dWlcIiwgJC5wcm94eShtZS5zdGFydE1vdmUsIG1lKSk7XHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaG1vdmUuU2Nyb2xsLnp3dWlcIiwgJC5wcm94eShtZS5kdXJNb3ZlLCBtZSkpO1xyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hlbmQuU2Nyb2xsLnp3dWlcIiwgJC5wcm94eShtZS5lbmRNb3ZlLCBtZSkpO1xyXG5cclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuc3RhcnRNb3ZlID0gZnVuY3Rpb24oZSl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXJ0ID0gbWUuc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcDtcclxuICAgIGlmKGUub3JpZ2luYWxFdmVudCl7XHJcbiAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcclxuICAgIH1cclxuICAgIHZhciB0b3VjaCA9IGUudG91Y2hlc1swXTtcclxuICAgIHN0YXRlTWFwLmxhc3RUcmFuc2Zvcm0gPSBtZS5nZXRUcmFuc2Zvcm0oKTtcclxuICAgIHN0YXJ0LnggPSB0b3VjaC5wYWdlWCB8fCAodG91Y2guY2xpZW50WCArIHN0YXRlTWFwLm9mZnNldFgpO1xyXG4gICAgc3RhcnQueSA9IHRvdWNoLnBhZ2VZIHx8ICh0b3VjaC5jbGllbnRZICsgc3RhdGVNYXAub2Zmc2V0WSk7XHJcblxyXG4gICAgLy9jb25zb2xlLmxvZyhzdGFydC54ICsgJyAnKyBzdGFydC55KVxyXG5cclxuICAgIHN0YXRlTWFwLm1vdmUgPSBzdGF0ZU1hcC5jaGVjayA9ICAxO1xyXG59O1xyXG5cclxuU2Nyb2xsLnByb3RvdHlwZS5kdXJNb3ZlID0gZnVuY3Rpb24oZSl7XHJcblxyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIHN0YXJ0ID0gc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgZGVsdGEgPSBzdGF0ZU1hcC5kZWx0YTtcclxuXHJcbiAgICBpZighc3RhdGVNYXAubW92ZSl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICBpZihlLm9yaWdpbmFsRXZlbnQpe1xyXG4gICAgICAgIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XHJcbiAgICB9XHJcbiAgICB2YXIgdG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzW2UuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIC0gMV07XHJcbiAgICB2YXIgeDIgPSB0b3VjaC5wYWdlWCB8fCAodG91Y2guY2xpZW50WCArIHN0YXRlTWFwLm9mZnNldFgpO1xyXG4gICAgdmFyIHkyID0gdG91Y2gucGFnZVkgfHwgKHRvdWNoLmNsaWVudFkgKyBzdGF0ZU1hcC5vZmZzZXRZKTtcclxuXHJcbiAgICBkZWx0YS54ID0geDIgLSBzdGFydC54O1xyXG4gICAgZGVsdGEueSA9IHkyIC0gc3RhcnQueTtcclxuXHJcbiAgICAvKiAgICDSu++/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vda777+90Lbvv73Su++/vc6j77+977+90Lbvv73vv73vv73vv73EuO+/ve+/ve+/ve+/ve+/ve+/vcS077+977+977+977+977+977+977+977+977+9c2xpZGVy77+977+9y67Gve+/ve+/ve+/ve+/ve+/vcSj77+977+977+977+977+91rl0b3VjaG1vdmXvv73CvO+/vVxyXG4gICAgIO+/ve+/ve+/ve+/ve+/ve+/vdax77+977+977+977+977+977+977+9xrbvv73vv73vv73vv73vv73Wru+/ve+/vci7Ki9cclxuICAgIGlmKHN0YXRlTWFwLmNoZWNrKXtcclxuICAgICAgICBzdGF0ZU1hcC5tb3ZlID0gTWF0aC5hYnMoZGVsdGEueCkgPiBNYXRoLmFicyhkZWx0YS55KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0ZU1hcC5jaGVjayA9ICExO1xyXG5cclxuICAgIGlmKHN0YXRlTWFwLm1vdmUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdmFyIG0gPSBzdGF0ZU1hcC5sYXN0VHJhbnNmb3JtICsgZGVsdGEueCAqIG1lLmNvbmZpZ01hcC5yYWRpbztcclxuXHJcbiAgICAgICAgLy9tID0gbSA+IHN0YXRlTWFwLm1heFRyYW5zZm9ybSA/IHN0YXRlTWFwLm1heFRyYW5zZm9ybVxyXG4gICAgICAgIC8vICAgIDogbSA8IHN0YXRlTWFwLm1pblRyYW5zZm9ybSA/IHN0YXRlTWFwLm1pblRyYW5zZm9ybSA6IG07XHJcbi8qICAgICAgICBjb25zb2xlLmxvZyh7XHJcbiAgICAgICAgICAgIG1heDogc3RhdGVNYXAubWF4VHJhbnNmb3JtLFxyXG4gICAgICAgICAgICBtaW46IHN0YXRlTWFwLm1pblRyYW5zZm9ybSxcclxuICAgICAgICAgICAgbTogc3RhdGVNYXAubGFzdFRyYW5zZm9ybSxcclxuICAgICAgICAgICAgeDogZGVsdGEueCxcclxuICAgICAgICAgICAgdG90YWw6IG1cclxuICAgICAgICB9KTsqL1xyXG5cclxuICAgICAgICBtZS5wb3NpdGlvbihtLCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuZW5kTW92ZSA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIHN0YXJ0ID0gc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgZGVsdGEgPSBzdGF0ZU1hcC5kZWx0YTtcclxuXHJcbiAgICB2YXIgbSA9IHN0YXRlTWFwLmxhc3RUcmFuc2Zvcm0gKyBkZWx0YS54ICogbWUuY29uZmlnTWFwLnJhZGlvO1xyXG5cclxuICAgIG0gPSBtID4gc3RhdGVNYXAubWF4VHJhbnNmb3JtID8gc3RhdGVNYXAubWF4VHJhbnNmb3JtXHJcbiAgICAgICAgOiBtIDwgc3RhdGVNYXAubWluVHJhbnNmb3JtID8gc3RhdGVNYXAubWluVHJhbnNmb3JtIDogbTtcclxuXHJcbiAgICBtZS5wb3NpdGlvbihtLCAwKTtcclxuXHJcbiAgICBzdGF0ZU1hcC5tb3ZlID0gc3RhdGVNYXAuY2hlY2sgPSAhMTtcclxuICAgIHN0YXJ0LnggPSBzdGFydC55ID0gZGVsdGEueCA9IGRlbHRhLnkgPSAwO1xyXG5cclxufTtcclxuXHJcbi8v77+977+977+977+9dHJhbmZvcm1cclxuU2Nyb2xsLnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKG1vdmUsIGR1cmF0aW9uLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgc3RhdGVNYXAgPSB0aGlzLnN0YXRlTWFwLFxyXG4gICAgICAgICRzY3JvbGxzID0gc3RhdGVNYXAuJHNjcm9sbHM7XHJcblxyXG4gICAgbW92ZSA9IGlzTmFOKG1vdmUpID8gIDAgOiBtb3ZlO1xyXG5cclxuICAgIGlmKHN1cHBvcnRUcmFuc2l0aW9uKXtcclxuICAgICAgICAkc2Nyb2xscy5jc3Moc3RhdGVNYXAucGZ4K1widHJhbnNpdGlvbi1kdXJhdGlvblwiLCAoZHVyYXRpb24gLyAxMDAwKSArICdzJyk7XHJcbiAgICAgICAgJHNjcm9sbHMuY3NzKHN0YXRlTWFwLnBmeCtcInRyYW5zZm9ybVwiLFwidHJhbnNsYXRlM2QoXCIrIG1vdmUgKyBcInB4LDAsMClcIik7XHJcbiAgICAgICAgLy9UT0RPIDogYWRkIHZlcnRpYWwgdHJhbnNmb3JtXHJcbiAgICB9XHJcbn07XHJcblxyXG4vL++/ve+/vcih77+977+9x7B0cmFuc2Zvcm3vv73Es9+077+9XHJcblNjcm9sbC5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24oKXtcclxuXHJcbiAvL++/vd6477+977+977+9yKF0cmFuc2Zvcm0g77+977+9aW9z77+977+977+977+977+977+977+977+977+9xKPvv73vv73vv73vv73vv73Wrsew77+977+9c2xpZGVy0LRcclxuIC8vdmFyIHRyYW5zZm9ybVB4ID0gJHNsaWRlcnMuZGF0YShcInRyYW5zZm9ybVwiKSA/ICAwIDogJHNsaWRlcnMuZGF0YShcInRyYW5zZm9ybVwiKTtcclxuIHZhciB0ZW1wID0gdGhpcy5zdGF0ZU1hcC4kc2Nyb2xsc1swXS5zdHlsZVt0aGlzLnN0YXRlTWFwLnN0eWxlVHJhbnNmb3JtXTtcclxuXHJcbiB2YXIgdCA9ICB0ZW1wLmxlbmd0aCA+IDAgPyBwYXJzZUludCh0ZW1wLnNwbGl0KCd0cmFuc2xhdGUzZCgnKVsxXSwxMCkgOiAwO1xyXG5cclxuIHJldHVybiBpc05hTih0KSA/IDAgOiB0O1xyXG4gfTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuJCA9IGZ1bmN0aW9uKGVsKXtcclxuICAgIHJldHVybiB0aGlzLiRlbC5maW5kKGVsKTtcclxufTtcclxuXHJcblNjcm9sbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLiRlbC5vZmYoXCIuU2Nyb2xsLnp3dWlcIik7XHJcbn07XHJcblxyXG52YXIgUGx1Z2luID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICBlbCA9IFNjcm9sbC5zdGF0aWNNYXAuc2Nyb2xsO1xyXG4gICAgICAgIHZhciAkc2Nyb2xsID0gJHRoaXMuaXMoZWwpICYmICR0aGlzIHx8ICR0aGlzLmNsb3Nlc3QoZWwpO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IFVJLnV0aWxzLnBhcnNlT3B0aW9ucygkc2Nyb2xsLmRhdGEoJ3Njcm9sbCcpKTtcclxuXHJcbiAgICAgICAgdmFyIHNsaWRlciA9IG5ldyBTY3JvbGwoJHNjcm9sbFswXSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuJC5mbi5zY3JvbGwgPSBQbHVnaW47XHJcblxyXG5VSS5yZWFkeShmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICQoJ1tkYXRhLXp3LXdpZGdldD1cInNjcm9sbFwiXScsIGNvbnRleHQpLnNjcm9sbCgpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUkuc2Nyb2xsID0gU2Nyb2xsOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMC8yMS5cclxuICovXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcclxudmFyIFVJID0gcmVxdWlyZSgnLi9jb3JlJyk7XHJcbnZhciBzdXBwb3J0VHJhbnNpdGlvbiA9ICBVSS5zdXBwb3J0LnRyYW5zaXRpb247XHJcblxyXG5cclxuXHJcbnZhciBTbGlkZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XHJcblxyXG4gICAgdGhpcy5jb25maWdNYXAgPSAkLmV4dGVuZCh7fSwgdGhpcy5jb25maWdNYXAsIG9wdGlvbnMpO1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG59O1xyXG5cclxuU2xpZGVyLnN0YXRpY01hcCA9IHtcclxuICAgIHNsaWRlcjogJy56dy1zbGlkZXInLFxyXG4gICAgc2xpZGVyczogJy56dy1zbGlkZXJzJyxcclxuICAgIHNsaWRlckl0ZW06ICcuenctc2xpZGVycyA+IGxpJyxcclxuICAgIHZpZXdwb3J0OiAnLnp3LXZpZXdwb3J0JyxcclxuICAgIGFjdGl2ZUNsYXNzOiAnLnp3LXNsaWRlci1hY3RpdmUnLFxyXG4gICAgY2FuU2xpZGVyUHg6IDEyMFxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5jb25maWdNYXAgPSB7XHJcbiAgICBkaXJlY3Rpb246ICdob3Jpem9udGFsJywgLy/mu5HliqjmlrnlkJFcclxuICAgIGFuaW1hdGVUaW1lOiAyMDAsIC8v5Yqo55S75pe26Ze0XHJcbiAgICBhdXRvOiB0cnVlLCAvL+iHquWKqOaSreaUvlxyXG4gICAgYXV0b0R1cmF0aW9uOiAyMDAwLCAvL+iHquWKqOaSreaUvumXtOmalOaXtumXtFxyXG4gICAgZGVmYXVsdEFjdGl2ZUluZGV4OiBudWxsLCAvL+S7jjHlvIDlp4vvvIwgbWF4IDogbGVuZ3RoXHJcbiAgICBuYW1lc3BhY2U6ICd6dycsXHJcbiAgICBoYXNDb250cm9sTmF2OiB0cnVlXHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLnN0YXRlTWFwID0ge1xyXG4gICAgYWN0aXZlSW5kZXg6IG51bGwsXHJcbiAgICBsZW5ndGg6IDAsXHJcbiAgICB0cmFuc2l0aW9uaW5nOiBudWxsLFxyXG4gICAgJHNsaWRlcnM6IG51bGwsXHJcbiAgICAkc2xpZGVyc0l0ZW06IG51bGwsXHJcbiAgICBwZXJNb3ZlOjAsXHJcbiAgICBvZmZzZXRYOiAwLFxyXG4gICAgb2Zmc2V0WTogMCxcclxuICAgIG1vdmU6IDAsIC8v5piv5ZCm5Y+v56e75YqoXHJcbiAgICBjaGVjazogMCwvL+aYr+WQpuagoemqjOinpuaRuOaWueWQkVxyXG4gICAgZGVsdGE6IHtcclxuICAgICAgICB4OiAwLFxyXG4gICAgICAgIHk6IDBcclxuICAgIH0sXHJcbiAgICBzdGFydDoge1xyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgfSxcclxuICAgIHBhdXNlOiB0cnVlLCAvL+aaguWBnOiHquWKqOaSreaUvlxyXG4gICAgcGxheVRpbWVvdXQ6IG51bGxcclxufTtcclxuXHJcbi8vU2xpZGVy5Yid5aeL5YWl5Y+jXHJcblNsaWRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRpYyA9IFNsaWRlci5zdGF0aWNNYXAsXHJcbiAgICAgICAgY2ZnID0gbWUuY29uZmlnTWFwLFxyXG4gICAgICAgIGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuICAgIHZhciBzY3JvbGxMZWZ0ID0gZG9jICYgZG9jLnNjcm9sbExlZnQgfHwgYm9keS5zY3JvbGxMZWZ0IHx8IDA7XHJcbiAgICB2YXIgc2Nyb2xsVG9wID0gZG9jICYgZG9jLnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcCB8fCAwO1xyXG4gICAgbWUuc3RhdGVNYXAgPSAkLmV4dGVuZCh7fSwgbWUuc3RhdGVNYXAsIHtcclxuICAgICAgICAkc2xpZGVyczogbWUuJChzdGF0aWMuc2xpZGVycyksXHJcbiAgICAgICAgJHNsaWRlckl0ZW06IG1lLiQoc3RhdGljLnNsaWRlckl0ZW0pLFxyXG4gICAgICAgICR2aWV3cG9ydDogbWUuJChzdGF0aWMudmlld3BvcnQpLFxyXG4gICAgICAgIG9mZnNldFg6IHNjcm9sbExlZnQsXHJcbiAgICAgICAgb2Zmc2V0WTogc2Nyb2xsVG9wXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgc3QgPSBtZS5zdGF0ZU1hcDtcclxuXHJcbiAgICB2YXIgYWN0aXZlSW5kZXggPSB0eXBlb2YgY2ZnLmRlZmF1bHRBY3RpdmVJbmRleCA9PT0gJ251bWJlcicgPyBjZmcuZGVmYXVsdEFjdGl2ZUluZGV4IDogMTtcclxuICAgIHN0Lmxlbmd0aCA9IHN0LiRzbGlkZXJJdGVtLmxlbmd0aDtcclxuICAgIHN0LmFjdGl2ZUluZGV4ID0gYWN0aXZlSW5kZXggPCAxID8gMSA6IGFjdGl2ZUluZGV4ID4gc3QubGVuZ3RoID8gc3QubGVuZ3RoIDogYWN0aXZlSW5kZXg7XHJcblxyXG4gICAgaWYoc3VwcG9ydFRyYW5zaXRpb24pe1xyXG4gICAgICAgIHN0LnBmeCA9IChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNQZnhOYW1lcyA9IHtcclxuICAgICAgICAgICAgICAgIFdlYmtpdFRyYW5zaXRpb246ICctd2Via2l0LScsXHJcbiAgICAgICAgICAgICAgICBNb3pUcmFuc2l0aW9uOiAnLW1vei0nLFxyXG4gICAgICAgICAgICAgICAgT1RyYW5zaXRpb246ICctby0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yKHZhciBuYW1lIGluIHRyYW5zUGZ4TmFtZXMpe1xyXG4gICAgICAgICAgICAgICAgaWYobWUuJGVsWzBdLnN0eWxlW25hbWVdICE9ICd1bmRlZmluZWQnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNQZnhOYW1lc1tuYW1lXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKCk7XHJcblxyXG4gICAgICAgIHN0LnN0eWxlVHJhbnNmb3JtID0gc3QucGZ4ID09PSAnJyA/ICd0cmFuc2Zvcm0nIDogc3QucGZ4LnJlcGxhY2UoLy0vZywnJykgKyAnVHJhbnNmb3JtJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVhZHkoKXtcclxuICAgICAgICBtZS5wbGF5KCk7XHJcbiAgICAgICAgbWUuYWRkRXZlbnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgbWUuJGVsLm9uKCdyZWFkeS5zbGlkZXIuend1aScsICQucHJveHkocmVhZHksIG1lKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGUoKTtcclxufTtcclxuXHJcbi8v5a6M5oiQc2xpZGVy55qE5qC35byP6K6+572u57uT5p6c5biD5bGAXHJcblNsaWRlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcCxcclxuICAgICAgICBjZmcgPSBtZS5jb25maWdNYXA7XHJcblxyXG4gICAgLy9zdC4kdmlld3BvcnQgPSAkKCc8ZGl2IGNsYXNzPVwiJyArIGNmZy5uYW1lc3BhY2UgKyAnLXZpZXdwb3J0XCIgLz4nKS5hcHBlbmRUbyhtZS4kZWwpLmFwcGVuZChzdC4kc2xpZGVycyk7XHJcblxyXG5cclxuICAgIGlmKHN0YXRlTWFwLmxlbmd0aCA+IDEpe1xyXG5cclxuICAgICAgICB2YXIgYWRkQ291bnQgPSAyO1xyXG5cclxuICAgICAgICAvL+WkjeWItuWJjeWQjuiKgueCuVxyXG4gICAgICAgIHN0YXRlTWFwLiRzbGlkZXJzLmFwcGVuZChtZS51bmlxdWVJZChzdGF0ZU1hcC4kc2xpZGVySXRlbS5maXJzdCgpLmNsb25lKCkuYWRkQ2xhc3MoJ2Nsb25lJykuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpKSlcclxuICAgICAgICAgICAgLnByZXBlbmQobWUudW5pcXVlSWQoc3RhdGVNYXAuJHNsaWRlckl0ZW0ubGFzdCgpLmNsb25lKCkuYWRkQ2xhc3MoJ2Nsb25lJykuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpKSk7XHJcblxyXG4gICAgICAgIHN0YXRlTWFwLiRuZXdTbGlkZXJJdGVtID0gbWUuJChTbGlkZXIuc3RhdGljTWFwLnNsaWRlckl0ZW0pO1xyXG4gICAgICAgIHN0YXRlTWFwLmxlbmd0aCA9ICBzdGF0ZU1hcC4kbmV3U2xpZGVySXRlbS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHZhciB3aWR0aCA9IHR5cGVvZiBzdGF0ZU1hcC4kdmlld3BvcnQgPT0gJ3VuZGVmaW5lZCcgPyBtZS4kZWwud2lkdGgoKSA6IHN0YXRlTWFwLiR2aWV3cG9ydC53aWR0aCgpO1xyXG5cclxuICAgICAgICBpZihjZmcuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpe1xyXG4gICAgICAgICAgICBzdGF0ZU1hcC4kc2xpZGVycy53aWR0aCgoKGFkZENvdW50ICsgc3RhdGVNYXAubGVuZ3RoKSAqIDIwMCkgKyAnJScpO1xyXG4gICAgICAgICAgICBzdGF0ZU1hcC5wZXJNb3ZlID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHN0YXRlTWFwLiRuZXdTbGlkZXJJdGVtLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAvL2Rpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiAndmlzaWJsZScsXHJcbiAgICAgICAgICAgICAgICBmbG9hdDogJ2xlZnQnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9ZWxzZXsvL1RvZG86IHNsaWRlciB2ZXJ0aWNhbFxyXG4gICAgICAgICAgICAvKnN0YXRlTWFwLiRzbGlkZXJzLmhlaWdodCgoKGFkZENvdW50ICsgc3RhdGVNYXAubGVuZ3RoKSAqIDIwMCkgKyAnJScpLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikud2lkdGgoXCIxMDAlXCIpO1xyXG4gICAgICAgICAgICAgc3RhdGVNYXAuJG5ld1NsaWRlckl0ZW0uY3NzKHtcclxuICAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgICAgICAgICAgICB3aWR0aDogJzEwMCUnXHJcbiAgICAgICAgICAgICB9KTsqL1xyXG4gICAgICAgIH1cclxuXHJcbi8qICAgICAgICBpZighc3VwcG9ydFRyYW5zaXRpb24pe1xyXG4gICAgICAgICAgICBzdGF0ZU1hcC4kc2xpZGVycy5jc3Moe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgbWUucG9zaXRpb24oLXdpZHRoICogc3RhdGVNYXAuYWN0aXZlSW5kZXggLCAwKTtcclxuICAgICAgICBtZS5jcmVhdGVDb250cm9sTmF2KCk7XHJcbiAgICAgICAgbWUuc2V0QWN0aXZlKHN0YXRlTWFwLmFjdGl2ZUluZGV4KTtcclxuXHJcbiAgICAgICAgbWUuJGVsLnRyaWdnZXIoJ3JlYWR5LnNsaWRlci56d3VpJyk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5hZGRFdmVudCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgLy9tZS5zdGF0ZU1hcC4kdmlld3BvcnQub24oXCJjbGlja1wiLGZ1bmN0aW9uKCl7XHJcbiAgICAvLyAgICB0aGlzLnByZSgpO1xyXG4gICAgLy99LmJpbmQodGhpcykpO1xyXG5cclxuICAgIG1lLiRlbC5vbihcInRvdWNoc3RhcnQuc2xpZGVyLnp3dWlcIiwgJC5wcm94eShtZS5zdGFydE1vdmUsIG1lKSk7XHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaG1vdmUuc2xpZGVyLnp3dWlcIiwgJC5wcm94eShtZS5kdXJNb3ZlLCBtZSkpO1xyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hlbmQuc2xpZGVyLnp3dWlcIiwgJC5wcm94eShtZS5lbmRNb3ZlLCBtZSkpO1xyXG5cclxuICAgIHZhciBjYWxsYmFjayA9ICQucHJveHkoZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBtZS5zdGF0ZU1hcC5sZW5ndGgsXHJcbiAgICAgICAgICAgIGFjdGl2ZUluZGV4ID0gbWUuc3RhdGVNYXAuYWN0aXZlSW5kZXg7IC8vTWF0aC5hYnMobWUuZ2V0VHJhbnNmb3JtKCkgLyBtZS5zdGF0ZU1hcC5wZXJNb3ZlKSA7XHJcblxyXG4gICAgICAgIG1lLnN0YXRlTWFwLnRyYW5zaXRpb25pbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIG5ld0luZGV4ID0gbWUuZ2V0TmV3QWN0aXZlSW5kZXgoYWN0aXZlSW5kZXgpO1xyXG5cclxuICAgICAgICBpZihhY3RpdmVJbmRleCAhPT0gbmV3SW5kZXggKXtcclxuICAgICAgICAgICAgbWUuc2V0QWN0aXZlKG5ld0luZGV4KTtcclxuICAgICAgICAgICAgbWUucG9zaXRpb24oLW1lLnN0YXRlTWFwLnBlck1vdmUgKiBuZXdJbmRleCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtZS4kZWwudHJpZ2dlcihcInNsaWRlci5lbmRcIiwgbmV3SW5kZXgpO1xyXG5cclxuICAgIH0sdGhpcyk7XHJcblxyXG4gICAgaWYoc3VwcG9ydFRyYW5zaXRpb24pe1xyXG4gICAgICAgIG1lLnN0YXRlTWFwLiRzbGlkZXJzLm9uKHN1cHBvcnRUcmFuc2l0aW9uLmVuZCwgY2FsbGJhY2spO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbi8qIGFjdGl2ZSDkuLrmnIDlkI7kuIDlvKDvvIhjbG9uZSnvvIzph43nva7kuLrnrKzkuIDlvKDnmoTkvY3nva5cclxuIGFjdGl2ZSDkuLrnrKww5bygKGNsb25lKSzph43nva7kuLrlgJLmlbDnrKzkuozlvKAqL1xyXG5TbGlkZXIucHJvdG90eXBlLmdldE5ld0FjdGl2ZUluZGV4ID0gZnVuY3Rpb24oaWR4KXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgbGVuID0gbWUuc3RhdGVNYXAubGVuZ3RoO1xyXG4gICAgaWYoaWR4ID09IGxlbiAtMSApe1xyXG4gICAgICAgIGlkeCA9IDE7XHJcbiAgICB9ZWxzZSBpZihpZHggPT0gMCApe1xyXG4gICAgICAgIGlkeCA9IGxlbiAtIDI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaWR4O1xyXG59O1xyXG5cclxuLypTbGlkZXIucHJvdG90eXBlLmRvTWF0aCA9IGZ1bmN0aW9uKCl7XHJcbiB2YXIgbWUgPSB0aGlzLFxyXG4gY2ZnID0gbWUuY29uZmlnTWFwLFxyXG4gZGlyZWN0aW9uID0gY2ZnLmRpcmVjdGlvbixcclxuIHN0YXRlTWFwID0gbWUuc3RhdGVNYXA7XHJcbiBzdGF0ZU1hcC4kc2xpZGVyc0l0ZW0gPSBtZS4kKFNsaWRlci5zdGF0aWNNYXAuc2xpZGVySXRlbSk7XHJcbiBzdGF0ZU1hcC5sZW5ndGggPSAgc3RhdGVNYXAuJHNsaWRlcnNJdGVtLmxlbmd0aDtcclxuXHJcbiB2YXIgd2lkdGggPSB0eXBlb2Ygc3RhdGVNYXAuJHZpZXdwb3J0ID09ICd1bmRlZmluZWQnID8gbWUuJGVsLndpZHRoKCkgOiBzdGF0ZU1hcC4kdmlld3BvcnQud2lkdGgoKTtcclxuXHJcbiBpZihkaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyl7XHJcbiBzdGF0ZU1hcC5wZXJNb3ZlID0gd2lkdGg7XHJcbiBzdGF0ZU1hcC4kc2xpZGVyc0l0ZW0uY3NzKHtcclxuIGRpc3BsYXk6ICdibG9jaycsXHJcbiBmbG9hdDogJ2xlZnQnLFxyXG4gd2lkdGg6IHdpZHRoICsgJ3B4J1xyXG4gfSk7XHJcbiBtZS5wb3NpdGlvbigtd2lkdGggKiBzdGF0ZU1hcC5hY3RpdmVJbmRleCAsIDApO1xyXG4gbWUuc2V0QWN0aXZlKHN0YXRlTWFwLmFjdGl2ZUluZGV4KTtcclxuIH1cclxuIH07Ki9cclxuXHJcblNsaWRlci5wcm90b3R5cGUuc3RhcnRNb3ZlID0gZnVuY3Rpb24oZSl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXJ0ID0gbWUuc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcDtcclxuXHJcbiAgICAvL+aaguWBnOiHquWKqOaSreaUvlxyXG4gICAgbWUucGF1c2VQbGF5KCk7XHJcblxyXG4gICAgaWYoc3RhdGVNYXAudHJhbnNpdGlvbmluZyl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgaWYoZS5vcmlnaW5hbEV2ZW50KXtcclxuICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgfVxyXG4gICAgdmFyIHRvdWNoID0gZS50b3VjaGVzWzBdO1xyXG4gICAgc3RhcnQueCA9IHRvdWNoLnBhZ2VYIHx8ICh0b3VjaC5jbGllbnRYICsgc3RhdGVNYXAub2Zmc2V0WCk7XHJcbiAgICBzdGFydC55ID0gdG91Y2gucGFnZVkgfHwgKHRvdWNoLmNsaWVudFkgKyBzdGF0ZU1hcC5vZmZzZXRZKTtcclxuXHJcbiAgICBzdGF0ZU1hcC5tb3ZlID0gc3RhdGVNYXAuY2hlY2sgPSAgMTtcclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUuZHVyTW92ZSA9IGZ1bmN0aW9uKGUpe1xyXG5cclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSBtZS5zdGF0ZU1hcCxcclxuICAgICAgICBzdGFydCA9IHN0YXRlTWFwLnN0YXJ0LFxyXG4gICAgICAgIGRlbHRhID0gc3RhdGVNYXAuZGVsdGEsXHJcbiAgICAgICAgZGlyID0gbWUuY29uZmlnTWFwLmRpcmVjdGlvbjtcclxuXHJcbiAgICBpZihzdGF0ZU1hcC50cmFuc2l0aW9uaW5nIHx8ICFzdGF0ZU1hcC5tb3ZlKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG4gICAgaWYoZS5vcmlnaW5hbEV2ZW50KXtcclxuICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgfVxyXG4gICAgdmFyIHRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlc1tlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgdmFyIHgyID0gdG91Y2gucGFnZVggfHwgKHRvdWNoLmNsaWVudFggKyBzdGF0ZU1hcC5vZmZzZXRYKTtcclxuICAgIHZhciB5MiA9IHRvdWNoLnBhZ2VZIHx8ICh0b3VjaC5jbGllbnRZICsgc3RhdGVNYXAub2Zmc2V0WSk7XHJcblxyXG4gICAgZGVsdGEueCA9IHgyIC0gc3RhcnQueDtcclxuICAgIGRlbHRhLnkgPSB5MiAtIHN0YXJ0Lnk7XHJcblxyXG4gICAgLyogICAg5LiA5Liq6Kem5pG46L+H56iL5Y+q5Yik5pat5LiA5qyh77yM5Yik5pat5piv5ZOq5Liq5pa55ZCR55qE6Kem5pG477yM5aaC5p6cc2xpZGVy5piv5rC05bmz5pa55ZCR55qE77yM5YiZ56aB5q2idG91Y2htb3Zl5LqL5Lu2XHJcbiAgICAg5aSE55CG5Z6C55u05pa55ZCR55qE56e75Yqo77yM5Y+N5LmL5Lqm54S2Ki9cclxuICAgIGlmKHN0YXRlTWFwLmNoZWNrKXtcclxuICAgICAgICB2YXIgdCA9IE1hdGguYWJzKGRlbHRhLngpID4gTWF0aC5hYnMoZGVsdGEueSk7XHJcbiAgICAgICAgc3RhdGVNYXAubW92ZSA9IGRpciA9PT0gJ2hvcml6b250YWwnID8gdFxyXG4gICAgICAgICAgICA6ICF0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRlTWFwLmNoZWNrID0gITE7XHJcblxyXG4gICAgaWYoc3RhdGVNYXAubW92ZSl7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB2YXIgbSA9IC0gc3RhdGVNYXAuYWN0aXZlSW5kZXggKiBzdGF0ZU1hcC5wZXJNb3ZlICtcclxuICAgICAgICAgICAgKGRpciA9PT0gJ2hvcml6b250YWwnID8gZGVsdGEueCA6IGRlbHRhLnkpO1xyXG5cclxuICAgICAgICBtZS5wb3NpdGlvbihtLCAwKTtcclxuICAgIH1cclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUuZW5kTW92ZSA9IGZ1bmN0aW9uKGUpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwLFxyXG4gICAgICAgIHN0YXJ0ID0gc3RhdGVNYXAuc3RhcnQsXHJcbiAgICAgICAgZGVsdGEgPSBzdGF0ZU1hcC5kZWx0YTtcclxuXHJcbiAgICAvL+W8gOWni+iHquWKqOaSreaUvlxyXG4gICAgbWUucGxheSgpO1xyXG5cclxuICAgIHZhciBkaXN0YW5jZSA9IG1lLmNvbmZpZ01hcC5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyA/IE1hdGguYWJzKGRlbHRhLngpIDogTWF0aC5hYnMoZGVsdGEueSk7XHJcbiAgICB2YXIgdmFsID0gbWUuY29uZmlnTWFwLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gZGVsdGEueCA6IGRlbHRhLnk7XHJcblxyXG4gICAgaWYoc3RhdGVNYXAubW92ZSAmJiBkaXN0YW5jZSA+IFNsaWRlci5zdGF0aWNNYXAuY2FuU2xpZGVyUHgpe1xyXG4gICAgICAgIGlmKHZhbCA+IDAgKXtcclxuICAgICAgICAgICAgbWUucHJlKCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIG1lLm5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgICB2YXIgbSA9IC0gc3RhdGVNYXAuYWN0aXZlSW5kZXggKiBzdGF0ZU1hcC5wZXJNb3ZlO1xyXG4gICAgICAgIG1lLnBvc2l0aW9uKG0sIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRlTWFwLm1vdmUgPSBzdGF0ZU1hcC5jaGVjayA9ICExO1xyXG4gICAgc3RhcnQueCA9IHN0YXJ0LnkgPSBkZWx0YS54ID0gZGVsdGEueSA9IDA7XHJcblxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5hdXRvUGxheSAgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBjZmcgPSBtZS5jb25maWdNYXA7XHJcblxyXG4gICAgaWYoIW1lLnN0YXRlTWFwLnBhdXNlKXtcclxuICAgICAgICBjbGVhclRpbWVvdXQobWUuc3RhdGVNYXAucGxheVRpbWVvdXQpO1xyXG4gICAgICAgIHZhciBjYiA9ICQucHJveHkoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmNvdW50KCd0aW1lb3V0cGxheScpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlTWFwLnBsYXlUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgaWYoIXRoaXMuc3RhdGVNYXAucGF1c2Upe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9QbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LG1lKTtcclxuICAgICAgICB2YXIgZHVyYXRpb24gPSBjZmcuYW5pbWF0ZVRpbWUgKyBjZmcuYXV0b0R1cmF0aW9uIDtcclxuICAgICAgICBtZS5zdGF0ZU1hcC5wbGF5VGltZW91dCA9IHNldFRpbWVvdXQoY2IsIGR1cmF0aW9uKTtcclxuICAgIH1cclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzO1xyXG5cclxuICAgIGlmKG1lLmNvbmZpZ01hcC5hdXRvICYmIG1lLnN0YXRlTWFwLnBhdXNlKXtcclxuICAgICAgICBtZS5zdGF0ZU1hcC5wYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgIG1lLmF1dG9QbGF5KCk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5wYXVzZVBsYXkgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcztcclxuXHJcbiAgICBjbGVhclRpbWVvdXQobWUuc3RhdGVNYXAucGxheVRpbWVvdXQpO1xyXG5cclxuICAgIG1lLnN0YXRlTWFwLnBhdXNlID0gdHJ1ZTtcclxufTtcclxuXHJcblNsaWRlci5wcm90b3R5cGUucHJlID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgc3RhdGVNYXAgPSB0aGlzLnN0YXRlTWFwLFxyXG4gICAgICAgIGFjdGl2ZUluZGV4ID0gc3RhdGVNYXAuYWN0aXZlSW5kZXg7XHJcblxyXG4gICAgLy/kuI3nlKjliKTmlq3mmK/lkKbotoXlh7psZW5ndGjmnInmlYjlgLzvvIzliqjnlLvnu5PmnZ/kuYvlkI7kvJrliKTmlq3lpoLmnpzkuLrmnIDlkI7kuIDlvKDmiJbnrKzkuIDlvKDvvIzph43nva7kvY3nva5cclxuICAgIGFjdGl2ZUluZGV4IC0tIDtcclxuXHJcblxyXG4gICAgaWYoISFzdGF0ZU1hcC50cmFuc2l0aW9uaW5nKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtb3ZlID0gLSBzdGF0ZU1hcC5wZXJNb3ZlICogYWN0aXZlSW5kZXg7XHJcblxyXG4gICAgbWUuc2V0QWN0aXZlKGFjdGl2ZUluZGV4KTtcclxuICAgIG1lLnBvc2l0aW9uKG1vdmUsIG1lLmNvbmZpZ01hcC5hbmltYXRlVGltZSk7XHJcbn07XHJcblxyXG5TbGlkZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IHRoaXMuc3RhdGVNYXAsXHJcbiAgICAgICAgYWN0aXZlSW5kZXggPSBzdGF0ZU1hcC5hY3RpdmVJbmRleDtcclxuXHJcbiAgICAvL+S4jeeUqOWIpOaWreaYr+WQpui2heWHumxlbmd0aOacieaViOWAvO+8jOWKqOeUu+e7k+adn+S5i+WQjuS8muWIpOaWreWmguaenOS4uuacgOWQjuS4gOW8oOaIluesrOS4gOW8oO+8jOmHjee9ruS9jee9rlxyXG4gICAgYWN0aXZlSW5kZXggKysgO1xyXG5cclxuXHJcbiAgICBpZighIXN0YXRlTWFwLnRyYW5zaXRpb25pbmcpe1xyXG4gICAgICAgIHJldHVybiA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1vdmUgPSAtIHN0YXRlTWFwLnBlck1vdmUgKiBhY3RpdmVJbmRleDtcclxuXHJcbiAgICBtZS5zZXRBY3RpdmUoYWN0aXZlSW5kZXgpO1xyXG4gICAgbWUucG9zaXRpb24obW92ZSwgbWUuY29uZmlnTWFwLmFuaW1hdGVUaW1lKTtcclxufTtcclxuXHJcblxyXG4vL+iuvue9rmFjdGl2ZUluZGV4IOWSjCBhY3RpdmVDbGFzc1xyXG5TbGlkZXIucHJvdG90eXBlLnNldEFjdGl2ZSA9IGZ1bmN0aW9uIChpbmRleCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gbWUuc3RhdGVNYXAsXHJcbiAgICAgICAgYWN0aXZlQ2xhc3MgPSBTbGlkZXIuc3RhdGljTWFwLmFjdGl2ZUNsYXNzO1xyXG5cclxuICAgIHN0YXRlTWFwLmFjdGl2ZUluZGV4ID0gaW5kZXg7XHJcbiAgICBzdGF0ZU1hcC4kbmV3U2xpZGVySXRlbS5yZW1vdmVDbGFzcyhhY3RpdmVDbGFzcyk7XHJcbiAgICBzdGF0ZU1hcC4kbmV3U2xpZGVySXRlbS5lcShpbmRleCkuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgIGlmKG1lLmNvbmZpZ01hcC5oYXNDb250cm9sTmF2KXtcclxuICAgICAgICBtZS4kZWwudHJpZ2dlcihcInN3aXRjaENvbnRyb2xOYXYuc2xpZGVyLnp3dWlcIiwgaW5kZXgpO1xyXG4gICAgfVxyXG5cclxufTtcclxuXHJcbi8v6K6+572udHJhbmZvcm1cclxuU2xpZGVyLnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKG1vdmUsIGR1cmF0aW9uLCBjYWxsYmFjayl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIHN0YXRlTWFwID0gdGhpcy5zdGF0ZU1hcCxcclxuICAgICAgICAkc2xpZGVycyA9IHN0YXRlTWFwLiRzbGlkZXJzO1xyXG5cclxuICAgIGlmKCEhbWUuc3RhdGVNYXAudHJhbnNpdGlvbmluZyl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICBtZS5zdGF0ZU1hcC50cmFuc2l0aW9uaW5nID0gIGR1cmF0aW9uID09PSAwID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgIG1vdmUgPSBpc05hTihtb3ZlKSA/ICAwIDogbW92ZTtcclxuXHJcbiAgICBpZihzdXBwb3J0VHJhbnNpdGlvbil7XHJcbiAgICAgICAgJHNsaWRlcnMuY3NzKHN0YXRlTWFwLnBmeCtcInRyYW5zaXRpb24tZHVyYXRpb25cIiwgKGR1cmF0aW9uIC8gMTAwMCkgKyAncycpO1xyXG4gICAgICAgICRzbGlkZXJzLmNzcyhzdGF0ZU1hcC5wZngrXCJ0cmFuc2Zvcm1cIixcInRyYW5zbGF0ZTNkKFwiKyBtb3ZlICsgXCJweCwwLDApXCIpO1xyXG4gICAgICAgIC8vVE9ETyA6IGFkZCB2ZXJ0aWFsIHRyYW5zZm9ybVxyXG4gICAgfWVsc2V7Ly9UT0RPIDogYWRkIHVuc3VwcG9ydFRyYW5zaXRpb24gZGVhbCA6IHN1cHBvcnQgdG8gaWU4ICtcclxuLyogICAgICAgICRzbGlkZXJzLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBsZWZ0OiBtb3ZlICsgJ3B4J1xyXG4gICAgICAgIH0sZHVyYXRpb24sZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgbWUuc3RhdGVNYXAudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pKi9cclxuICAgIH1cclxufTtcclxuXHJcblxyXG4vL+W6lemDqOWvvOiIqlxyXG5TbGlkZXIucHJvdG90eXBlLmNyZWF0ZUNvbnRyb2xOYXYgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICBzdGF0ZU1hcCA9IG1lLnN0YXRlTWFwO1xyXG5cclxuICAgIGlmKCFtZS5jb25maWdNYXAuaGFzQ29udHJvbE5hdil7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuICAgIHZhciAkY29udHJvbE5hdiA9ICQoJzxvbCBjbGFzcz1cIicgKyBtZS5jb25maWdNYXAubmFtZXNwYWNlICsgJy1jb250cm9sLW5hdiAnICArICdcIj48L29sPicpO1xyXG5cclxuICAgIHZhciBsID0gc3RhdGVNYXAuJHNsaWRlckl0ZW0ubGVuZ3RoLFxyXG4gICAgICAgIGkgPSAwO1xyXG4gICAgZm9yKDtpPGw7aSsrKXtcclxuICAgICAgICAkY29udHJvbE5hdi5hcHBlbmQoJzxsaT48YSBkYXRhLWluZGV4ID0gJyArIChpICsgMSkgKyAnPicgKyAoaSArIDEpICsgJzwvYT48L2xpPicpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRlTWFwLiR2aWV3cG9ydC5hcHBlbmQoJGNvbnRyb2xOYXYpO1xyXG4gICAgc3RhdGVNYXAuJGNvbnRyb2xOYXZJdGVtID0gJGNvbnRyb2xOYXYuZmluZCgnbGkgYScpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHN3aXRjaENvbnRyb2xOYXZNYW5hbChlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaWYoZS5vcmlnaW5hbEV2ZW50KXtcclxuICAgICAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1lID0gdGhpcyxcclxuICAgICAgICAgICAgXyR0aGlzID0gJChlLnRhcmdldCk7XHJcblxyXG4gICAgICAgIHZhciBpbmRleCA9IF8kdGhpcy5kYXRhKCdpbmRleCcpO1xyXG5cclxuICAgICAgICBpZighaXNOYU4oaW5kZXgpICYmICF0aGlzLnN0YXRlTWFwLnRyYW5zaXRpb25pbmcpe1xyXG4gICAgICAgICAgICB2YXIgY3VyID0gbWUuc3RhdGVNYXAuYWN0aXZlSW5kZXg7XHJcbiAgICAgICAgICAgIGlmKGN1ciA9PT0gaW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL+aaguWBnOiHquWKqOaSreaUvlxyXG4gICAgICAgICAgICBtZS5wYXVzZVBsYXkoKTtcclxuXHJcbiAgICAgICAgICAgIG1lLnN0YXRlTWFwLiRjb250cm9sTmF2SXRlbS5yZW1vdmVDbGFzcygnenctYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIF8kdGhpcy5hZGRDbGFzcygnenctYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIG1lLnNldEFjdGl2ZShpbmRleCk7XHJcbiAgICAgICAgICAgIG1lLnBvc2l0aW9uKC1tZS5zdGF0ZU1hcC5wZXJNb3ZlICogaW5kZXggLCBtZS5jb25maWdNYXAuYW5pbWF0ZVRpbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBzd2l0Y2hDb250cm9sTmF2QXV0byhlLCBpbmRleCl7XHJcblxyXG4gICAgICAgIHZhciBsZW4gPSB0aGlzLnN0YXRlTWFwLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaW5kZXggPSB0aGlzLmdldE5ld0FjdGl2ZUluZGV4KGluZGV4KSAtIDE7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGVNYXAuJGNvbnRyb2xOYXZJdGVtLnJlbW92ZUNsYXNzKCd6dy1hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLnN0YXRlTWFwLiRjb250cm9sTmF2SXRlbS5lcShpbmRleCkuYWRkQ2xhc3MoJ3p3LWFjdGl2ZScpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgbWUuJGVsLm9uKFwidG91Y2hzdGFydC5zbGlkZXIuend1aVwiLCAnLnp3LWNvbnRyb2wtbmF2IGEnICwgJC5wcm94eShzd2l0Y2hDb250cm9sTmF2TWFuYWwsIG1lKSk7XHJcbiAgICBtZS4kZWwub24oXCJzd2l0Y2hDb250cm9sTmF2LnNsaWRlci56d3VpXCIsICQucHJveHkoc3dpdGNoQ29udHJvbE5hdkF1dG8sIG1lKSk7XHJcbn07XHJcblxyXG4vL+iOt+WPluW9k+WJjXRyYW5zZm9ybeeahOWwuuWvuFxyXG4vKlNsaWRlci5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtID0gZnVuY3Rpb24oKXtcclxuXHJcbiAvL+S/ruaUueS4i+WPlnRyYW5zZm9ybSDvvIxpb3PkvJrmnInpl67popjnmoTvvIzmjInnhafkuYvliY3nmoRzbGlkZXLlhplcclxuIC8vdmFyIHRyYW5zZm9ybVB4ID0gJHNsaWRlcnMuZGF0YShcInRyYW5zZm9ybVwiKSA/ICAwIDogJHNsaWRlcnMuZGF0YShcInRyYW5zZm9ybVwiKTtcclxuIHZhciB0ZW1wID0gdGhpcy5zdGF0ZU1hcC4kc2xpZGVyc1swXS5zdHlsZVt0aGlzLnN0YXRlTWFwLnN0eWxlVHJhbnNmb3JtXTtcclxuXHJcbiB2YXIgdCA9ICB0ZW1wLmxlbmd0aCA+IDAgPyBwYXJzZUludCh0ZW1wLnNwbGl0KCd0cmFuc2xhdGUzZCgnKVsxXSwxMCkgOiAwO1xyXG5cclxuIHJldHVybiBpc05hTih0KSA/IDAgOiB0O1xyXG4gfTsqL1xyXG5cclxuLy/lpI3liLbnmoToioLngrnliqDllK/kuIBpZFxyXG5TbGlkZXIucHJvdG90eXBlLnVuaXF1ZUlkID0gZnVuY3Rpb24oJGNsb25lKSB7XHJcbiAgICAvLyBBcHBlbmQgX2Nsb25lIHRvIGN1cnJlbnQgbGV2ZWwgYW5kIGNoaWxkcmVuIGVsZW1lbnRzIHdpdGggaWQgYXR0cmlidXRlc1xyXG4gICAgJGNsb25lLmZpbHRlcignW2lkXScpLmFkZCgkY2xvbmUuZmluZCgnW2lkXScpKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgJHRoaXMuYXR0cignaWQnLCAkdGhpcy5hdHRyKCdpZCcpICsgJ19jbG9uZScpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gJGNsb25lO1xyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS4kID0gZnVuY3Rpb24oZWwpe1xyXG4gICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoZWwpO1xyXG59O1xyXG5cclxuU2xpZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuJGVsLm9mZihcIi5zbGlkZXIuend1aVwiKTtcclxuICAgIHRoaXMuc3RhdGVNYXAuJHNsaWRlcnMub2ZmKHN1cHBvcnRUcmFuc2l0aW9uLmVuZCk7XHJcbiAgICBpZih0aGlzLnN0YXRpY01hcC5wbGF5VGltZW91dCl7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3RhdGljTWFwLnBsYXlUaW1lb3V0KTtcclxuICAgIH1cclxufTtcclxuXHJcbnZhciBQbHVnaW4gPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGVsID0gU2xpZGVyLnN0YXRpY01hcC5zbGlkZXI7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkdGhpcy5pcyhlbCkgJiYgJHRoaXMgfHwgJHRoaXMuY2xvc2VzdChlbCk7XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0gVUkudXRpbHMucGFyc2VPcHRpb25zKCRzbGlkZXIuZGF0YSgnc2xpZGVyJykpO1xyXG5cclxuICAgICAgICB2YXIgc2xpZGVyID0gbmV3IFNsaWRlcigkc2xpZGVyWzBdLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9KTtcclxuXHJcbn07XHJcblxyXG4kLmZuLnNsaWRlciA9IFBsdWdpbjtcclxuXHJcblVJLnJlYWR5KGZ1bmN0aW9uKGNvbnRleHQpe1xyXG4gICAgJCgnW2RhdGEtenctd2lkZ2V0PVwic2xpZGVyXCJdJywgY29udGV4dCkuc2xpZGVyKCk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSS5zbGlkZXIgPSBTbGlkZXI7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgbGlueGlhb2ppZSBvbiAyMDE1LzExLzExLlxyXG4gKi9cclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcclxudmFyIFVJID0gcmVxdWlyZSgnLi9jb3JlJyk7XHJcbnZhciBzdXBwb3J0VHJhbnNpdGlvbiA9IFVJLnN1cHBvcnQudHJhbnNpdGlvbjtcclxuXHJcbmZ1bmN0aW9uIERlbW8oZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XHJcblxyXG4gICAgdGhpcy5jb25maWdNYXAgPSAkLmV4dGVuZCh7fSwgdGhpcy5jb25maWdNYXAsIG9wdGlvbnMgfHwge30pO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgICB0aGlzLmFkZEV2ZW50KCk7XHJcbn1cclxuXHJcbkRlbW8uc3RhdGljTWFwID0ge1xyXG5cclxufTtcclxuXHJcbkRlbW8ucHJvdG90eXBlLmNvbmZpZ01hcCA9IHtcclxuXHJcbn07XHJcblxyXG5EZW1vLnByb3RvdHlwZS5zdGF0ZU1hcCA9IHtcclxuXHJcbn07XHJcblxyXG5EZW1vLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcclxuXHJcbn07XHJcblxyXG5EZW1vLnByb3RvdHlwZS5hZGRFdmVudCA9IGZ1bmN0aW9uKCl7XHJcblxyXG59O1xyXG5cclxuXHJcbkRlbW8ucHJvdG90eXBlLiQgPSBmdW5jdGlvbihlbCl7XHJcbiAgICByZXR1cm4gdGhpcy4kZWwuZmluZChlbCk7XHJcbn07XHJcblxyXG5cclxuXHJcbkRlbW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG5cclxufTtcclxuXHJcblxyXG52YXIgUGx1Z2luID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGVsID0gRGVtby5zdGF0aWNNYXAudGFicyxcclxuICAgICAgICAgICAgb3B0aW9ucztcclxuICAgICAgICB2YXIgJGRlbW8gPSAkdGhpcy5pcyhlbCkgJiYgJHRoaXMgfHwgJHRoaXMuY2xvc2VzdChlbCk7XHJcblxyXG4gICAgICAgIG9wdGlvbnMgPSBVSS51dGlscy5wYXJzZU9wdGlvbnMoJGRlbW8uZGF0YSgnZGVtbycpKTtcclxuXHJcbiAgICAgICAgdmFyIHRhYnMgPSBuZXcgRGVtbygkZGVtb1swXSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0pO1xyXG59O1xyXG5cclxuJC5mbi5kZW1vID0gUGx1Z2luO1xyXG5cclxuVUkucmVhZHkoZnVuY3Rpb24oY29udGV4dCl7XHJcbiAgICAkKCdbZGF0YS16dy13aWRnZXQ9XCJ0YWJzXCJdJywgY29udGV4dCkuZGVtbygpO1xyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJLmRlbW8gPSBEZW1vOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGxpbnhpYW9qaWUgb24gMjAxNS8xMC8xOS5cclxuICovXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcclxudmFyIFVJID0gcmVxdWlyZSgnLi9jb3JlJyk7XHJcbnZhciBzdXBwb3J0VHJhbnNpdGlvbiA9IFVJLnN1cHBvcnQudHJhbnNpdGlvbjtcclxuXHJcbnZhciBUYWJzID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucyl7XHJcbiAgICB0aGlzLiRlbCA9ICQoZWxlbWVudCk7XHJcblxyXG4gICAgdGhpcy5jb25maWdNYXAgPSAkLmV4dGVuZCh7fSwgdGhpcy5jb25maWdNYXAsIG9wdGlvbnMgfHwge30pO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgICB0aGlzLmFkZEV2ZW50KCk7XHJcbn07XHJcblxyXG5UYWJzLnN0YXRpY01hcCA9IHtcclxuICAgIHRhYnM6ICcuenctdGFicycsXHJcbiAgICBhY3RpdmVDbGFzczogJ3p3LWFjdGl2ZScsXHJcbiAgICB0YWJOYXY6ICcuenctdGFicy1uYXYnLFxyXG4gICAgdGFiTmF2SXRlbTogJy56dy10YWJzLW5hdiA+IGxpJyxcclxuICAgIG5hdjogJy56dy10YWJzLW5hdiBhJyxcclxuICAgIHRhYlBhbmVsOiAnLnp3LXRhYi1wYW5lbCdcclxufTtcclxuXHJcblRhYnMucHJvdG90eXBlLmNvbmZpZ01hcCA9IHtcclxuICAgIGRlZmF1bHRBY3RpdmVJbmRleDogbnVsbFxyXG59O1xyXG5cclxuVGFicy5wcm90b3R5cGUuc3RhdGVNYXAgPSB7XHJcbiAgICBhY3RpdmVJbmRleDogbnVsbCxcclxuICAgIHRyYW5zaXRpb25pbmc6IG51bGxcclxufTtcclxuXHJcblRhYnMucHJvdG90eXBlLiQgPSBmdW5jdGlvbihlbCl7XHJcbiAgICByZXR1cm4gdGhpcy4kZWwuZmluZChlbCk7XHJcbn1cclxuVGFicy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIGNmZyA9IFRhYnMuc3RhdGljTWFwLFxyXG4gICAgICAgIGlkeCA9IG1lLmNvbmZpZ01hcC5kZWZhdWx0QWN0aXZlSW5kZXgsXHJcbiAgICAgICAgYWN0aXZlSW5kZXggPSBpZHggPyBpZHggOiAwO1xyXG5cclxuICAgIG1lLnN0YXRlTWFwID0ge1xyXG4gICAgICAgICR0YWJOYXY6IG1lLiQoY2ZnLnRhYk5hdiksXHJcbiAgICAgICAgJHRhYk5hdkl0ZW06IG1lLiQoY2ZnLnRhYk5hdkl0ZW0pLFxyXG4gICAgICAgICRuYXY6IG1lLiQoY2ZnLm5hdiksXHJcbiAgICAgICAgJHRhYlBhbmVsOiBtZS4kKGNmZy50YWJQYW5lbClcclxuICAgIH07XHJcblxyXG4vKiAgICB2YXIgY3VyTmF2ID0gbWUuc3RhdGVNYXAuJHRhYk5hdi5maW5kKFwiLlwiICsgY2ZnLmFjdGl2ZUNsYXNzKTsqL1xyXG5cclxuICAgIC8v5qC35byP5piv5ZCm5oyH5a6a5LqGYWN0aXZlIENsYXNzIDovL+m7mOiupOS9v+eUqOmFjee9ru+8jOaXoOmFjee9ruaYvuekuuesrOS4gOS4qlxyXG4vKiAgICBpZihjdXJOYXYubGVuZ3RoID4gMCApe1xyXG4gICAgICAgIGluZGV4ID0gbWUuc3RhdGVNYXAuJHRhYk5hdkl0ZW0uaW5kZXgoY3VyTmF2LmZpcnN0KCkpO1xyXG4gICAgfSovXHJcbiAgICB2YXIgbGVuID0gbWUuc3RhdGVNYXAuJHRhYk5hdkl0ZW0ubGVuZ3RoO1xyXG4gICAgYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleCA+IGxlbiAtIDEgPyBsZW4gLSAxIDogYWN0aXZlSW5kZXg7XHJcblxyXG4gICAgbWUuZ290byhhY3RpdmVJbmRleCk7XHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS5hZGRFdmVudCA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWUgPSB0aGlzLFxyXG4gICAgICAgIGNmZyA9IFRhYnMuc3RhdGljTWFwO1xyXG4gICAgdmFyIHN0YXRlTWFwID0gdGhpcy5zdGF0ZU1hcDtcclxuXHJcbiAgICBtZS4kZWwub24oXCJ0b3VjaHN0YXJ0LnRhYnMuend1aVwiLCBjZmcubmF2LCBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgbWUuZ290bygkKHRoaXMpKVxyXG4gICAgfSk7XHJcblxyXG59O1xyXG5cclxuLypUYWJzLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oJG5hdil7XHJcbiAgICB2YXIgbWUgPSB0aGlzO1xyXG4gICAgaWYoISRuYXZcclxuICAgICAgICB8fCAhJG5hdi5sZW5ndGhcclxuICAgICAgICB8fCBtZS50cmFuc2l0aW9uaW5nXHJcbiAgICAgICAgfHwgJG5hdi5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoVGFicy5zdGF0aWNNYXAuYWN0aXZlQ2xhc3MpKXtcclxuICAgICAgICByZXR1cm4gO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbmRleCA9IG1lLnN0YXRlTWFwLm5hdi5pbmRleCgkbmF2KTtcclxuXHJcbiAgICBpZih+aW5kZXgpe1xyXG4gICAgICAgIG1lLmdvdG8oaW5kZXgpO1xyXG4gICAgfVxyXG59OyovXHJcblxyXG5UYWJzLnByb3RvdHlwZS5nb3RvID0gZnVuY3Rpb24gKCRuYXYpe1xyXG5cclxuICAgIHZhciBtZSA9IHRoaXMsXHJcbiAgICAgICAgaW5kZXggPSB0eXBlb2YgJG5hdiA9PT0gJ251bWJlcicgPyAkbmF2IDogbWUuc3RhdGVNYXAuJG5hdi5pbmRleCgkbmF2KTtcclxuXHJcbiAgICAkbmF2ID0gdHlwZW9mICRuYXYgPT09ICdudW1iZXInID8gbWUuc3RhdGVNYXAuJG5hdi5lcShpbmRleCkgOiAkKCRuYXYpO1xyXG5cclxuICAgIGlmKCEkbmF2XHJcbiAgICAgICAgfHwgISRuYXYubGVuZ3RoXHJcbiAgICAgICAgfHwgbWUudHJhbnNpdGlvbmluZ1xyXG4gICAgICAgIHx8ICRuYXYucGFyZW50KCdsaScpLmhhc0NsYXNzKFRhYnMuc3RhdGljTWFwLmFjdGl2ZUNsYXNzKSl7XHJcbiAgICAgICAgcmV0dXJuIDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5zd2l0Y2hOYXYoaW5kZXgpO1xyXG4gICAgdGhpcy5zd2l0Y2hQYW5lbChpbmRleCk7XHJcbn07XHJcblxyXG5UYWJzLnByb3RvdHlwZS5zd2l0Y2hOYXYgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICB2YXIgc3RNYXAgPSB0aGlzLnN0YXRlTWFwLFxyXG4gICAgICAgIGNmZyA9IFRhYnMuc3RhdGljTWFwO1xyXG4gICAgc3RNYXAuJHRhYk5hdkl0ZW0ucmVtb3ZlQ2xhc3MoY2ZnLmFjdGl2ZUNsYXNzKTtcclxuICAgIHN0TWFwLiR0YWJOYXZJdGVtLmVxKGluZGV4KS5hZGRDbGFzcyhjZmcuYWN0aXZlQ2xhc3MpO1xyXG4gICAgc3RNYXAuYWN0aXZlSW5kZXggPSBpbmRleDtcclxufTtcclxuXHJcblRhYnMucHJvdG90eXBlLnN3aXRjaFBhbmVsID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgdmFyIHN0TWFwID0gdGhpcy5zdGF0ZU1hcCxcclxuICAgICAgICBjZmcgPSBUYWJzLnN0YXRpY01hcDtcclxuICAgIHZhciAkYWN0aXZlTmF2ID0gc3RNYXAuJHRhYlBhbmVsLmVxKGluZGV4KTtcclxuICAgIHN0TWFwLiR0YWJQYW5lbC5yZW1vdmVDbGFzcyhjZmcuYWN0aXZlQ2xhc3MpO1xyXG4gICAgc3RNYXAuJHRhYlBhbmVsLmVxKGluZGV4KS5hZGRDbGFzcyhjZmcuYWN0aXZlQ2xhc3MpO1xyXG4gICAgc3RNYXAuYWN0aXZlSW5kZXggPSBpbmRleDtcclxuXHJcbiAgICB2YXIgY2FsbGJhY2sgPSAkLnByb3h5KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gZmFsc2U7XHJcbiAgICB9LHRoaXMpO1xyXG5cclxuICAgIHN1cHBvcnRUcmFuc2l0aW9uID8gJGFjdGl2ZU5hdi5vbmUoc3VwcG9ydFRyYW5zaXRpb24uZW5kLCBjYWxsYmFjaykgOiBjYWxsYmFjaztcclxufTtcclxuXHJcblRhYnMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xyXG4gIHRoaXMuJGVsLm9mZihcIi50YWJzLnp3dWlcIik7XHJcbn07XHJcblxyXG52YXIgUGx1Z2luID0gZnVuY3Rpb24oKXtcclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgIGVsID0gVGFicy5zdGF0aWNNYXAudGFicyxcclxuICAgICAgICAgICAgb3B0aW9ucztcclxuICAgICAgICB2YXIgJHRhYnMgPSAkdGhpcy5pcyhlbCkgJiYgJHRoaXMgfHwgJHRoaXMuY2xvc2VzdChlbCk7XHJcblxyXG4gICAgICAgIG9wdGlvbnMgPSBVSS51dGlscy5wYXJzZU9wdGlvbnMoJHRhYnMuZGF0YSgndGFicycpKTtcclxuXHJcbiAgICAgICAgdmFyIHRhYnMgPSBuZXcgVGFicygkdGFic1swXSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0pO1xyXG59XHJcblxyXG4kLmZuLnRhYnMgPSBQbHVnaW47XHJcblxyXG5VSS5yZWFkeShmdW5jdGlvbihjb250ZXh0KXtcclxuICAgICQoJ1tkYXRhLXp3LXdpZGdldD1cInRhYnNcIl0nLCBjb250ZXh0KS50YWJzKCk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSS50YWJzID0gVGFiczsiLCJ2YXIgVUkgPSByZXF1aXJlKFwiLi9jb3JlXCIpXG5yZXF1aXJlKFwiLi91aS5pbWFnZXNjYWxlXCIpXG5yZXF1aXJlKFwiLi91aS5sb3R0ZXJ5XCIpXG5yZXF1aXJlKFwiLi91aS5yb3RhcnlcIilcbnJlcXVpcmUoXCIuL3VpLnNjcm9sbFwiKVxucmVxdWlyZShcIi4vdWkuc2xpZGVyXCIpXG5yZXF1aXJlKFwiLi91aS5zbG90XCIpXG5yZXF1aXJlKFwiLi91aS50YWJzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gJC5aV1VJID0gVUk7XG4iXX0=
