/**
 * Created by linxiaojie on 2015/10/19.
 */
var $ = require('jquery');
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