/**
 * Created by Administrator on 2015-11-14.
 */

/**
 * Created by linxiaojie on 2015/10/19.
 */
var $ = require('jquery');
var UI = require('./core');
var supportTransition = UI.support.transition;
var supportAnimation = UI.support.animation;

var Slot = function(element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options || {});
    this.init();
    //this.addEvent();
};

Slot.staticMap = {
    animate: 'animate',
    cards: '.zw-slot-cards',
    card: 'li',
    btn: '.zw-slot-btn',
    disable: 'disable',
    split: '/',
    duration: 4000,//动画时长,css中设置，更改需要同步修改css
    delay: 200 //动画延迟执行时间
};

/*
    awards: {
        1: '7/7/7',
        2: '3/3/3',
        3: '4/2/8
    }

 */
Slot.prototype.configMap = {
    //awards: {}
};

Slot.prototype.stateMap = {
    award: '', //结果
    $cards: null,
    $btn: null,
    length: 0,
    cardHeight: 0,
    overCount: 0 //没出一个结果+1，当length==overCount表示结果已经出来
};

Slot.prototype.$ = function(el){
    return this.$el.find(el);
};

Slot.prototype.init = function(){
    var me = this,
        static = Slot.staticMap,
        pfx = '',
        $cards = me.$(static.cards);

    me.stateMap = $.extend({}, me.stateMap, {
        $cards: $cards,
        $btn: me.$(static.btn)
    });

    me.stateMap.length = $cards.length;

    if(!me.stateMap.length){
        return ;
    }


    me.stateMap.cardHeight = $cards.children(Slot.staticMap.card).first().height();

    if(supportTransition){
        pfx = (function(){
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

        me.stateMap.transform = pfx === '' ? 'transform' : pfx.replace(/-/g,'') + 'Transform';

    }

    me.addEvent();

};

Slot.prototype.addEvent = function(){
    var me = this,
        stateMap = me.stateMap;

    me.$el.on("click.slot.zwui", Slot.staticMap.btn, $.proxy(me.gamestart, me));

    var cb = $.proxy(function(e){
        if(e.originalEvent){
            e = e.originalEvent;
        }
        var $cards =$(e.target),
            me = this,
            state = me.stateMap;
        var transform = state.transform,
            cardHeight = state.cardHeight,
            slot = $cards.data('slot');

        $cards.css(transform,"translate3d(0, -"+ ( cardHeight * slot) + "px, 0)");

        me.gameover();

    },me);

    if(supportAnimation){
        stateMap.$cards.on(supportAnimation.end, cb);
    }
};

/*
    校验游戏是否结束，结束触发结束事件

 */
Slot.prototype.gameover  = function(){
    var me = this,
        state = me.stateMap,
        overCount = state.overCount,
        len = state.length;

    state.overCount = ++overCount;

    //console.log(state.overCount);

    if(overCount === len){
        state.overCount = 0;
        state.$btn.removeClass(Slot.staticMap.disable);
        me.$el.trigger('gameover', [state.award]);
    }

};

Slot.prototype.gamestart = function(award){
    var $btn =this.stateMap.$btn,
        disable = Slot.staticMap.disable;
    if($btn.hasClass(disable)){
        return ;
    }

    $btn.addClass(disable);

    this.$el.trigger('gamestart');
};

Slot.prototype.on = function(){
    this.$el.on.apply(this.$el, [].slice.call(arguments));
    return this;
};


/*
    开始抽奖
    @slots {string} 结果字符串 '7/7/7'

 */
Slot.prototype.slot = function(award){
    var me = this,
        state = me.stateMap,
        static = Slot.staticMap,
        slots ;

    if(!(/^[\d\/]*$/.test(award)) || (slots = award.split("/")).length !== state.length){
        console.error('slot 参数值格式不正确 ');
        return ;
    }

    me.beforeSlot();

    state.award = award;

    setTimeout(function(){
        $.each(state.$cards, function(idx){

            var slot = "slot" + slots[idx],
                m = slots[idx] - 1,
                $cards = $(this),
                delay = me.delayTime(idx) / 1000 + 's';
            $cards.data('slot', m ).css(
                {
                    "animation-name": slot,
                    "-webkit-animation-name": slot,
                    "-o-animation-name": slot,
                    "-moz-animation-name": slot,
                    "animation-delay": delay,
                    "-webkit-animation-delay": delay,
                    "-o-animation-delay": delay,
                    "-moz-animation-delay": delay,
                }
            ).addClass(Slot.staticMap.animate);

            if(!supportAnimation){
                var d = static.duration + me.delayTime(idx);//static.duration + (idx + 1) * static.delay;
                var cb = function(){
                    var slot = $cards.data('slot');

                    $cards.css(this.stateMap.transform,"translate3d(0, -"+ ( this.stateMap.cardHeight * slot) + "px, 0)");
                    me.gameover();
                };
                setTimeout($.proxy(cb, me),d)
            }
        });
    },100)

    return this;

    //setTimeout($.proxy(me.setPosition, me), Slot.staticMap.duration )

};

//计算动画开始的延迟时间，和css设置的delay相关，偷懒+懒得做样式兼容把delay在样式里写死了
//TODO: 可配置delay
Slot.prototype.delayTime = function(idex){
    return Slot.staticMap.delay + idex * 1000;
};

Slot.prototype.beforeSlot = function(){
    var me = this,
        state = me.stateMap;
    state.award = '';
    state.overCount = 0;
    state.$cards.each(function(){
        $(this).removeClass(Slot.staticMap.animate)
            .css(state.transform,"translate3d(0, 0, 0)")
            .css(
                {
                    "animation-name": '',
                    "-webkit-animation-name": '',
                    "-o-animation-name": '',
                    "-moz-animation-name": ''
                }
            );
    });
}


Slot.prototype.destroy = function(){
    var me = this;
    me.$el.off('slot.zwui');
    me.stateMap.$cards.off(supportAnimation.end);

    return null;
};


module.exports = UI.slot = Slot;