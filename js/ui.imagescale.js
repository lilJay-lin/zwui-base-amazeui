/**
 * Created by linxiaojie on 2015/11/3.
 * ��������ͼƬ����߱�����
 *
 * ҳ�����֮��ִ�У�ִֻ��һ�Σ�
 * ����֮���޸ĸ�������ͼƬ��radio������Ч���ֶ�����
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