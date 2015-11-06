/**
 * Created by linxiaojie on 2015/10/29.
 */

//提供按钮标签更新和进度条更新



var BtnMrg = {
    //按钮标签
    label : {
        download: '\u4e0b\u8f7d\u000d\u000a',//'下载',
        pause: '\u6682\u505c',//'暂停',
        resume: '\u7ee7\u7eed',//'继续',
        retry: '\u91cd\u8bd5',//'重试',
        install: '\u5b89\u88c5',//'安装',
        open: '\u6253\u5f00',//'打开',
        update: '\u66f4\u65b0'//'更新'
    },
    //存储按钮节点
    cache : {},

    staticMap : {
        btn: 'js-btn-dl', //按钮节点
        prefix: 'zw-btn-', //状态前缀
        statusRegexp: /\s?zw-btn-(\w+)/
    },

    //更新按钮，提供packname查找按钮节点，根据按钮状态更新label

    //根据按钮id，查找节点
    find : function(id){

        if(id === undefined){
            return null;
        }
        //转换下
        var cid = id.replace(/\./g, '-');

        var $el = this.cache[cid];

        if(!$el){
            $el = $('[data-id="' + id + '"]').find("." + this.staticMap.btn);
            this.cache[cid] = $el;
        }

        if(!$el){
            throw  new Error('找不到节点 id = ' + id);
        }
        return $el;
    },

    /*
     添加按钮状态标记
     @status {string} 应用状态
     @return {string} 状态对应的class
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
     *  更新按钮标签和class
     * @status {string} 按钮需要更新的状态
     * @id {string} 包名
     * @txt {string} 需要显示的标签信息，为空时使用默认label信息
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
     @id {string} :包名
     @return {string}： 状态
     根据节点的class判断当前应用的状态
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

