# Image
---

定义图片样式。

## 基础样式

基础样式定义在 `base` 中。

```css
img {
  box-sizing: border-box;
  width:100%;
  vertical-align: middle;
  border: 0;
}
```

## 增强样式

### 圆角样式

为`<img>`元素设置不同的 class，增强其样式。

- `.zw-radius`     圆角
- `.zw-round`      椭圆
- `.zw-circle`     圆形，一般用于正方形的图片(你要觉得椭圆好看，用在长方形上也可以)

`````html
<p><img class="zw-radius" alt="140*140" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/1000/q/80" width="140" height="140" />
<img class="zw-round" alt="140*140" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/600/q/80" width="200" height="120"/>
<img class="zw-circle" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/1000/q/80" width="140" height="140"/></p>
`````
```html
<p>
  <img class="zw-radius" alt="140*140" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/1000/q/80" width="140" height="140" />

  <img class="zw-round" alt="140*140" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/600/q/80" width="200" height="120"/>

  <img class="zw-circle" src="http://s.amazeui.org/media/i/demos/bw-2014-06-19.jpg?imageView/1/w/1000/h/1000/q/80" width="140" height="140"/>
</p>
```
