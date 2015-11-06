/**
 * Created by linxiaojie on 2015/11/3.
 * 处理所有图片按宽高比缩放
 *
 * 页面加载之后执行，只执行一次，
 * 加载之后修改父容器或图片，radio缩放无效需手动调用
 *
 */
var $ = require('jquery');
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