/**
 * Created by linxiaojie on 2015/11/11.
 */

var $ = require('jquery');
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