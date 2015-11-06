/**
 * Created by linxiaojie on 2015/10/28.
 */
var $ = require('jquery'),
    UI = require('./core'),
    BtnMgr = require('./download/btnMgr'),
    AndroidWebkit = require('./download/cmd'),
    static = require('./download/static');

var win = window;


$.each({
    //此函数getAppStatus .. 会做回调，当应用未下载时不会回调此函数
    appStatusCallBack: function(name, result) {
        /*alert(result);
        var status = static.label(result);
        BtnMgr[status](name, result);*/
        $(document).trigger('appStatusCallBack.dl.zwui',[name, result]);
    },
    getProgressCallBack: function(name, progress, status){
        $(document).trigger('updateProgress.dl.zwui',[name, progress, status]);
    }

},function(k, fn){
    win[k] = fn;
});


var Download = function (element, options){
    this.$el = $(element);

    this.configMap = $.extend({}, this.configMap, options);

    this.allPackage = {};
    this.downloadPackage = {};
    this.progressTimeout = null;
    this.init();
};


Download.prototype.configMap = {
    interval: 1000,
    show: true //是否显示进度条
};

Download.prototype.stateMap = {
    pause: true
};

Download.prototype.init = function(){
    //var url = 'http://221.179.8.170:8080/t.do?requestid=app_order&payMode=1&goodsid=0000x3902741386760000081892760000081892&MD5=null';
    //var btn = $('.js-btn-dl')[0];
    //AndroidWebkit.appStatusOnClick(btn, 'http://221.179.8.170:8080/t.do?requestid=app_order&payMode=1&goodsid=0000x3902710233760000000204760000000204&MD5=null', '760000000204', '免费',0,true)

    //把事件都绑定到全局document上
    //$(document).on('ready.dl.zwui', $.proxy(this.ready, this));
    $(document).on('click.dl.zwui', $.proxy(this.btnClickHandle, this));
    $(document).on('appStatusCallBack.dl.zwui', $.proxy(this.ready, this));
    $(document).on('updateProgress.dl.zwui', $.proxy(this.updateProgress, this));


    var me = this,
        $items = this.$el.find('.' + static.item);//Todo: 查询所有不限制容器

    me.$items || (me.$items = {});

    var i = 0,
        l = $items.length,
        $item ;
    for(; i < l; i++){
        $item = $items.eq(i);
        var id = $item.id || $item.data("pkgname");
        if(!id){
            continue;
        }
        me.$items[me.getCid(id)] = $item;
    }

    var item, items = Object.keys(me.$items);
    while((item = items.pop()) != null){
        var $el = me.$items[item];
        var model = me.createAppModel($el);
        if(!!model){
            //初始化所有app信息存放到downloadpackage
            me.allPackage[model.cid] = model;
            var ver = model.ver,
                pkgname = model.pkgname;
            if(ver && pkgname){
                AndroidWebkit.getAppStatus(pkgname, ver);
            }
        }
    }

    //me.playUpdate();

};


/*
    更新应用状态（getAppStatus）回调触发的事件方法
    1. 把正在下载的应用信息添加到 downloadPackage
    2. 把已完成下载的应用信息添加到 installPackage
    3. 更新显示界面的应用状态
 */
Download.prototype.appStatusCallBack = function(e, name, result){
    var me = this,
        model, status, cid, $el;

    if(!name){
        return false;
    }
    cid = me.getCid(name);
    $el = me.findByPkgName(name);
    model = $.extend({},me.allPackage[cid]) || me.createAppModel($el);

    if(model === null){
        console.log('method btnclickHandle warn : argument model is null');
        return ;
    }

    //通过状态映射，返回当前应用状态
    var status = static.label(result);


    //Todo：目前没有状态区分下载，暂停，继续，api更新之后把正在下载（暂停 or 继续）放入downloadPackage
    //状态为下载，暂停，继续 需要更新进度条状态,保存到downloadPackage


    BtnMgr[status](name, result);

};


/*
 下载按钮点击事件

 */
Download.prototype.btnClickHandle = function(e){
    if(e.originalEvent){
        e = e.originalEvent;
    }
    var me = this,
        $_this = $(e.target),
        model, status, id;

    model = me.createAppModel($_this);
    status = BtnMgr.getStatus($_this);

    if(model === null){
        console.log('method btnclickHandle warn : argument model is null');
        return ;
    }

    id = model.id;

    if(status === 'install'){
        AndroidWebkit.installAPK(id);
    }else if(status === 'open' ){
        AndroidWebkit.openApp(id);
    }
/*    else if(status === 'update'){
        AndroidWebkit.updateInstall(id, model.url, id, model.contentId, model.price, model.size, model.canOrder);
    }*/
    else{
        AndroidWebkit.updateInstall(id, model.url, id, model.contentId, model.price, model.size, model.canOrder);
    }

/*    if (val == '安装')
    {
        AndroidWebkit.installAPK(id);
    } else if(val == '已安装') {
        return;
    } else if(val == '打开') {
        AndroidWebkit.openApp(id);
    } else {
        AndroidWebkit.updateInstall(id, url, id, contentid, price, size, canOrder);
    }*/
};

//创建app 模型的方法
Download.prototype.createAppModel = function($el){

    if(!$el || $el.length === 0){
        return null;
    }

    var id, cid, url, contentId, price, size, canOrder, ver, pkgname;

    id = pkgname = $el.data("pkgname") || null;
    if(!id){
        return null;
    }

    cid = this.getCid(id);
    url = $el.data("url") ||'';
    contentId = $el.data("contentId") || 0;
    price = $el.data("price") || 0;
    size = $el.data("size") || 0;
    canOrder = $el.data("canOrder") || true;
    ver = $el.data("ver") || true;

    return {
        id: id,
        cid:cid,
        url: url,
        contentId: contentId,
        price: price,
        size: size,
        canOrder: canOrder,
        progress: 0,
        status: 0
    };
};

/*
* 初始化方法
* 1. 查找所有应用节点，保存应用信息到allPackage
* 2. 更新应用状态： getAppStatus
*/
Download.prototype.ready = function(){
    var me = this,
        $items = this.$el.find('.' + static.item);//Todo: 查询所有不限制容器

    me.$items || (me.$items = {});

    var i = 0,
        l = $items.length,
        $item ;
    for(; i < l; i++){
        $item = $items.eq(i);
        var id = $item.id || $item.data("pkgname");
        if(!id){
            continue;
        }
        me.$items[me.getCid(id)] = $item;
    }

    var item, items = Object.keys(me.$items);
    while((item = items.pop()) != null){
        var $el = me.$items[item];
        var model = me.createAppModel($el);
        if(!!model){
            //初始化所有app信息存放到downloadpackage
            me.allPackage[model.cid] = model;
            var ver = model.ver,
                pkgname = model.pkgname;
            if(ver && pkgname){
                AndroidWebkit.getAppStatus(pkgname, ver);
            }
        }
    }
};

/*
   包名转换格式存储
 */
Download.prototype.getCid = function(id){
    if(!id){
        throw new Error('getCid error : argument id could not be null or undefiend');
    }

    return id.replace(/\./g, '_');
};

/*
    通过包名查找应用节点
 */
Download.prototype.findByPkgName = function(pk){
    var $el ;

    if(pk){
        $el = this.$items[this.getCid(pk)];
    }

    if($el && $el.length == 0){
        $el = $('[data-id=" + pk + "]');
    }

    return  $el.length > 0 ? $el.eq(0) : null ;
};

//更新应用进度
Download.prototype.updateProgress = function(e, name, progress, status){

    //TODO: 更新 downloadPackage，如果完成则移出downloadPackage
    console.log(e +' ' + name +' ' + progress +' ' + status)
    var cid = this.getCid(name);
    var model = $.extend({}, this.allPackage[cid]);
    model.progress = progress;
    model.status = status;
    this.allPackage[cid] = model;
    $('#msg').html(progress + ' ' + status + '  ' + Date.now());
};


/*
    查询应用状态
    1. me.configMap.show = true 查询应用进度--》更新进度显示
    2. 非下载状态应用，更新应用状态
 */
Download.prototype.queryAppStatus = function(){
    var me = this,
        model, pkg, pkgs = Object.keys(me.allPackage);

    while((pkg = pkgs.pop()) != null) {
        model = me.allPackage[pkg];

        //只有状态为暂停（下载中）的需要更新查询更新进度
        if (me.configMap.show) {
            //TODO: 查询应用下载进度，删除此处模拟代码;真实环境只需调js接口，在回调处理接口
            var progress = model.progress + 10;
            var status = model.status;
            if (progress == 100) {
                status = true;
                console.log(222)
            }
            $(document).trigger('updateProgress.dl.zwui', [model.id, progress, status]);
        }
        //TODO： 其他情况 更新状态
        else {
            var ver = model.ver,
                pkgname = model.pkgname;
            if (ver && pkgname) {
                AndroidWebkit.getAppStatus(pkgname, ver);
            }
        }
    }
};

//暂停timeout轮训查询应用状态
Download.prototype.pauseUpdate = function(){
    var me = this;
    if(me.progressTimeout){
        clearTimeout(me.progressTimeout);
    }
    me.progressTimeout = null;
    me.stateMap.pause = true;
};

//启动timeout轮训查询应用状态，每次调用相当于重置
Download.prototype.playUpdate = function(){
    var me = this;
    if(me.progressTimeout){
        clearTimeout(me.progressTimeout);
    }
    me.progressTimeout = setTimeout($.proxy(function(){
        me.queryAppStatus();
        me.progressTimeout = null;
        me.playUpdate();
    }, me), me.configMap.interval);
    me.stateMap.pause = false;
};


var Plugin = function(){

    this.each(function(){
        var $this = $(this),
            el = static.container;
        var $download = $this.is(el) && $this || $this.closest(el);

        var options = UI.utils.parseOptions($download.data('download'));

        var download = new Download($download[0], options);

        return this;
    });

};

$.fn.download = Plugin;

UI.ready(function(context){
    $('[data-zw-widget="download"]', context).download();
});

module.exports = UI.download = Download;