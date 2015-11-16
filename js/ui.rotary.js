/**
 * Created by linxiaojie on 2015/11/11.
 */

var $ = require('jquery');
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
    btn: '.zw-rotary-btn',
    disable: 'disable'
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
    awards: {}, //�����б���ʼ����������
    fixAngle: 5,
    duration: 2,
    minRotate: 2
};

Rotary.prototype.stateMap = {
    award: '',//��������,��Ϊ�ղſ��Գ齱
    disable: false
};

Rotary.prototype.init = function(){
    var me = this,
        static = Rotary.staticMap;

    me.stateMap =$.extend({}, me.stateMap, {
        $btn: me.$(static.btn),
        $dial: me.$(static.dial)
    });
};


Rotary.prototype.on = function(){
    this.$el.on.apply(this.$el, [].slice.call(arguments));
    return this;
};
/*
    @rangle {number} ת����ת�Ƕ�
    @award {number} ����
    ִ����ת�������������մ����н������¼�������award

 */
Rotary.prototype.rotate = function(rangle, award){
    var me = this,
        duration = me.configMap.duration;
    rangle += me.configMap.minRotate * 360;
    me.animate(rangle, duration);

    var cb = $.proxy(function(){
        this.gameover();
    }, me);

    //if(!supportTransition){ //TODO:��ʱʹ�ûص�,��500ms��ʱ
        duration = duration * 1000 + 500;
        setTimeout(cb, duration );
    //}
};

Rotary.prototype.animate = function(rangle, duration){
    var d = duration === undefined ? this.configMap.duration : duration;
    this.stateMap.$dial.css({
        'transform' : 'rotate(' + rangle + 'deg)',
        '-webkit-transform' : 'rotate(' + rangle + 'deg)',
        '-moz-transform' : 'rotate(' + rangle + 'deg)',
        '-o-transform' : 'rotate(' + rangle + 'deg)',
        'transition-duration' : d + 's',
        '-webkit-transition-duration' : d + 's',
        '-moz-transition-duration' : d + 's',
        '-o-transition-duration' : d + 's'
    });
};
/*
 У����Ϸ�Ƿ�������������������¼�

 */
Rotary.prototype.gameover  = function(){
    var me = this,
        award = me.stateMap.award;
    me.stateMap.award = '';
    me.disable(false);
    me.$el.trigger('gameover', [award]);

};

Rotary.prototype.gamestart = function(award){
    var me = this,
        $btn =me.stateMap.$btn,
        disable = me.stateMap.disable;
    if(disable){
        return ;
    }

    //����
    me.animate(0,0);

    me.disable(true);

    me.$el.trigger('gamestart');
};

Rotary.prototype.disable = function(disable){
    var me = this,
        disableClass = Rotary.staticMap.disable;
    me.stateMap.disable = !!disable;

    !!disable ? me.stateMap.$btn.addClass(disableClass) : me.stateMap.$btn.removeClass(disableClass);
};

/*
    ��ʼת����Ϸ����ȡ���õĽ����ת��Ӧ����ת�ĽǶ�
 */
Rotary.prototype.setAward = function(award){
    var me = this,ad,
        awards = me.configMap.awards;

    if(award == undefined || !(ad = awards[award])){
        return ;
    }
    me.stateMap.award = award;

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
    var fixMax = parseInt(maxAngle) - parseInt(me.configMap.fixAngle);
    var fixMin = parseInt(minAngle) + parseInt(me.configMap.fixAngle);
    var angle = me.random(fixMin, fixMax);


    //ת��
    setTimeout(function(){
        me.rotate(angle, award);
    },500);
};


Rotary.prototype.random = function(min, max){
    var choices = max - min +1;
    return Math.floor( Math.random() * choices + min);
},


Rotary.prototype.addEvent = function(){
    var me = this,
        stateMap = me.stateMap;

    me.$el.on("click.rotary.zwui", Rotary.staticMap.btn, $.proxy(me.gamestart, me));

/*    if(supportTransition){ //TODO: չʾ���ö����¼��ص������õ�ʱ��Ҳ�ᴥ������Ҫ�ӱ�ʾ����
        stateMap.$dial.on(supportTransition.end, $.proxy(me.gameover, me));
    }*/
};


Rotary.prototype.$ = function(el){
    return this.$el.find(el);
};



Rotary.prototype.destroy = function(){
    this.stateMap.$dial.off(supportTransition.end);
    this.$el.off('rotary.zwui');
};


module.exports = UI.rotary = Rotary;