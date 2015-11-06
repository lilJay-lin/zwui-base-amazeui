/**
 * Created by linxiaojie on 2015/10/29.
 */

var static = require('./static');
var win = window,
    AndroidWebkit = {
        url : 'http://127.0.0.1:9817/action=querydownprogress&contentid=',
        queryDownProgress: function(id){
            var url = this.url + id;
        }
    };

var method = ['downloadResource','getAppStatus',
        'updateInstall','installAPK','openApp'],
    i = 0,
    slice = [].slice,
    l = method.length;

for(;i<l;i++){
    AndroidWebkit[method[i]] = (function(name){
        return function(){
            var args = slice.call(arguments);
            args.unshift(name);
            cmd.apply(this,args);
        }
    })(method[i]);
}
function cmd(name){
    var args = [].slice.call(arguments,1);
    try{
        return win.androidmm[name].apply(win.androidmm,args);
    }catch(e){
        console.log("androidmm."+name+" is not found");
    }
};

/*
 * openApp(String packageName)
 * installAPK(String id)
 * updateInstall(String id, String url, String packageName, String contentId, String price)
 * getAppStatus(String id, String ver)
 */
/*
AndroidWebkit.appStatusOnClick = function(model){

    if(!model){
        console.log('appstatusOnClick arguments could not be null or undefined');
    }

    var id = model.id || '',
        url = model.url || '',
        contentId = model.contentId || '',
        price = model.price || 0,
        size = model.size || 0,
        canOrder = model.canOrder || true;

    if (val == '安装')
    {
        AndroidWebkit.installAPK(id);
    } else if(val == '已安装') {
        return;
    } else if(val == '打开') {
        AndroidWebkit.openApp(id);
    } else {
        AndroidWebkit.updateInstall(id, url, id, contentid, price, size, canOrder);
    }
}
*/

//此函数getAppStatus .. 会做回调，当应用未下载时不会回调此函数
/*
win.appStatusCallBack = function(name, result)
{
    var status = static.label(result);

    updateAppStatus(name,result);
}

function updateAppStatus(btnId,newstatus){
    var btn= document.getElementById(btnId);
    var objs ;
    if(!btn) {
        objs = document.getElementsByName(btnId);
        if(!objs) return;
    }


    var updateStatus = function(btn) {
        btn.value = newstatus;
        var cbDisabled = false;

        if (newstatus == '更新') {
            btn.className = 'listbtn-4';
        } else if (newstatus == '打开') {
            btn.className = 'listbtn-2';
        } else if (newstatus == '安装') {
            btn.className = 'listbtn-4';
            cbDisabled = true;
        } else if (newstatus == '已安装') {
            btn.className = 'listbtn-3';
            btn.disabled = true;
            cbDisabled = true;
        } else if (newstatus == '免费' || newstatus == '下载') {
            btn.className = 'listbtn-1';
        } else {
            btn.className = 'listbtn-1';
        }
    };
    if (btn) {
        updateStatus(btn);
    } else {
        for (i = 0; i < objs.length; i++) {
            updateStatus(objs[i]);
        }
    }
}
function log(msg){
    console.log&&console.log(msg);
}
function getValue(btn,name){
    var val = null;
    if(typeof btn !='undefined' && typeof name != 'undefined'){
        val = btn.getAttribute(name);
    }
    return val;
}
function setValue(btn,name,val){
    if(typeof btn !='undefined' && typeof name != 'undefined'){
        btn.setAttribute(name,val);
    }
}
*/


module.exports = AndroidWebkit;