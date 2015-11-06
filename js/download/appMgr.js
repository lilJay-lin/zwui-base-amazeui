/**
 * Created by linxiaojie on 2015/10/29.
 */

var static = require('./static');

//把事件绑定在组件顶层节点上，顶层节点的事件行为作为容器各部分的通信渠道
var AppMgr = {
    installPackage: [], //已下载完毕应用
    downloadPackage: [],//正在下载的应用
    allPackage: [],//所有应用

};

module.exports = AppMgr;