/**
 * Created by linxiaojie on 2015/10/29.
 */


module.exports = {
    btn: 'js-btn-dl',
    item: 'zw-dl-item',
    container: '[data-zw-widget="download"]',
    //״̬ӳ��:
    // ��״̬update ��̨���ص��ı�״̬������'����������', '����������', '����', 'ʡ��������'
    label: function(status){
        var statusMap = {
                update: ['\u514d\u6d41\u91cf\u66f4\u65b0','\u514d\u6d41\u91cf\u4e0b\u8f7d', '\u66f4\u65b0', '\u7701\u6d41\u91cf\u66f4\u65b0' ],//['����������', '����������', '����', 'ʡ��������'],
                open: ['\u6253\u5f00', '\u5df2\u5b89\u88c5'],//['��', '�Ѱ�װ'],
                install: ['\u5b89\u88c5'],//['��װ'],
                download: ['\u514d\u8d39', '\u4e0b\u8f7d'],//[ '���', '����']
            },
            res = 'download';

        status || (status = '����');

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