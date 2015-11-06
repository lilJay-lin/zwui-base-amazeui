/**
 * Created by linxiaojie on 2015/10/19.
 */

'use strict';

/* jshint -W040 */

var $ = require('jquery');

if (typeof $ === 'undefined') {
    throw new Error('Zw UI 1.x requires jQuery ');
}

var UI = $.ZWUI || {};
var $win = $(window);
var doc = window.document;
var $html = $('html');

UI.VERSION = '{{VERSION}}';

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