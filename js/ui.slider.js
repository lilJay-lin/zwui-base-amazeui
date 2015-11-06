/**
 * Created by linxiaojie on 2015/10/21.
 */
var $ = require('jquery');
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