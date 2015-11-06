/**
 * Created by linxiaojie on 2015/10/29.
 */


module.exports = {
    btn: 'js-btn-dl',
    item: 'zw-dl-item',
    container: '[data-zw-widget="download"]',
    //状态映射:
    // 如状态update 后台传回的文本状态可能是'免流量更新', '免流量下载', '更新', '省流量更新'
    label: function(status){
        var statusMap = {
                update: ['\u514d\u6d41\u91cf\u66f4\u65b0','\u514d\u6d41\u91cf\u4e0b\u8f7d', '\u66f4\u65b0', '\u7701\u6d41\u91cf\u66f4\u65b0' ],//['免流量更新', '免流量下载', '更新', '省流量更新'],
                open: ['\u6253\u5f00', '\u5df2\u5b89\u88c5'],//['打开', '已安装'],
                install: ['\u5b89\u88c5'],//['安装'],
                download: ['\u514d\u8d39', '\u4e0b\u8f7d'],//[ '免费', '下载']
            },
            res = 'download';

        status || (status = '下载');

        var key, keys = Object.keys(statusMap);

        while((key = keys.pop()) != null){
            var arrs = statusMap[key];
            if($.inArray(status, arrs) > -1){
                res = key;
            }
        }

        return res;
    }
};