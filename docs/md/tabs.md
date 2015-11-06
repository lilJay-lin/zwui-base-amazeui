# Tabs
---

选型卡，默认选型卡切换有动画，可通过样式去除动画效果（.zw-tabs-noanimate)


## 基本样式

`data-zw-widget="tabs"` 页面自动实例化tabs,手动实例化不需要加该数据定义，手动加载执行代码：

```
new $.ZWUI.tabs(el, options);
```

`````html
    <div data-zw-widget="tabs"
         class="zw-tabs">
        <ul class="zw-tabs-nav ">
            <li  ><a href="javascript:;">青春</a></li>
            <li ><a href="javascript:;">彩虹</a></li>
            <li class=""><a href="javascript:;">歌唱</a></li>
        </ul>
        <div class="zw-tabs-bd">
            <div class="zw-tab-panel">
                【青春】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
            <div class="zw-tab-panel ">
                【彩虹】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
            <div class="zw-tab-panel ">
                【歌唱】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
        </div>
    </div>
`````

```html
    <div data-zw-widget="tabs"
         class="zw-tabs">
        <ul class="zw-tabs-nav ">
            <li  ><a href="javascript:;">青春</a></li>
            <li ><a href="javascript:;">彩虹</a></li>
            <li class=""><a href="javascript:;">歌唱</a></li>
        </ul>
        <div class="zw-tabs-bd">
            <div class="zw-tab-panel">
                【青春】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
            <div class="zw-tab-panel ">
                【彩虹】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
            <div class="zw-tab-panel ">
                【歌唱】那时候有多好，任雨打湿裙角。忍不住哼起，心爱的旋律。绿油油的树叶，自由地在说笑。燕子忙归巢，风铃在舞蹈。经过青春的草地，彩虹忽然升起。即使视线渐渐模糊，它也在我心里。就像爱过的旋律，没人能抹去。因为生命存在失望，歌唱，所以才要歌唱。
            </div>
        </div>
    </div>
```