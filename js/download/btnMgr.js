/**
 * Created by linxiaojie on 2015/10/29.
 */

//�ṩ��ť��ǩ���ºͽ���������



var BtnMrg = {
    //��ť��ǩ
    label : {
        download: '\u4e0b\u8f7d\u000d\u000a',//'����',
        pause: '\u6682\u505c',//'��ͣ',
        resume: '\u7ee7\u7eed',//'����',
        retry: '\u91cd\u8bd5',//'����',
        install: '\u5b89\u88c5',//'��װ',
        open: '\u6253\u5f00',//'��',
        update: '\u66f4\u65b0'//'����'
    },
    //�洢��ť�ڵ�
    cache : {},

    staticMap : {
        btn: 'js-btn-dl', //��ť�ڵ�
        prefix: 'zw-btn-', //״̬ǰ׺
        statusRegexp: /\s?zw-btn-(\w+)/
    },

    //���°�ť���ṩpackname���Ұ�ť�ڵ㣬���ݰ�ť״̬����label

    //���ݰ�ťid�����ҽڵ�
    find : function(id){

        if(id === undefined){
            return null;
        }
        //ת����
        var cid = id.replace(/\./g, '-');

        var $el = this.cache[cid];

        if(!$el){
            $el = $('[data-id="' + id + '"]').find("." + this.staticMap.btn);
            this.cache[cid] = $el;
        }

        if(!$el){
            throw  new Error('�Ҳ����ڵ� id = ' + id);
        }
        return $el;
    },

    /*
     ��Ӱ�ť״̬���
     @status {string} Ӧ��״̬
     @return {string} ״̬��Ӧ��class
     */
    getClass : function(status){
        return this.staticMap.prefix + status;
    },

    removeClass: function(){

        if(!!this.rmClass){
            return this.rmClass ;
        }

        var me = this,
            rmClass = '',
            status,keys = Object.keys(me.label);


        while((status = keys.pop()) != null){
            rmClass += me.staticMap.prefix + status + ' ';
        }
        this.rmClass = rmClass ;

        return rmClass;
    },

    /*
     *  ���°�ť��ǩ��class
     * @status {string} ��ť��Ҫ���µ�״̬
     * @id {string} ����
     * @txt {string} ��Ҫ��ʾ�ı�ǩ��Ϣ��Ϊ��ʱʹ��Ĭ��label��Ϣ
     */
    updateBtn : function(status, id, txt){
        var me = this;

        var $btn = me.find(id);

        if($btn === null){
            return false;
        }

        var label = txt || me.label[status];
        $btn.removeClass(me.removeClass())
            //.addClass(me.staticMap.btn)
            .addClass(me.getClass(status)).html(label);

        return true;
    },
    /*
     @id {string} :����
     @return {string}�� ״̬
     ���ݽڵ��class�жϵ�ǰӦ�õ�״̬
     */
    getStatus: function(id){
        var me = this, def = 'donwload', $el;

        $el = me.find(id);

        if($el.length === 0){
            return def;
        }

        var match,classNames = $el[0].className;

        match = classNames.match(classNames);

        return match ? match[1] : def;
    },
    init : function(){

        var me = this,status,
            keys = Object.keys(me.label);

        while((status = keys.pop()) != null){
            BtnMrg[status] = (function(st){
                return function(){
                    var arg = [].slice.call(arguments);
                    arg.unshift(st);
                    this.updateBtn.apply(this,arg);
                };
            })(status);
        };
    }

};

BtnMrg.init();

module.exports = BtnMrg;

