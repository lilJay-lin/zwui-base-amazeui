/**
 * Created by linxiaojie on 2015/10/29.
 */

var static = require('./static');

//���¼������������ڵ��ϣ�����ڵ���¼���Ϊ��Ϊ���������ֵ�ͨ������
var AppMgr = {
    installPackage: [], //���������Ӧ��
    downloadPackage: [],//�������ص�Ӧ��
    allPackage: [],//����Ӧ��

};

module.exports = AppMgr;