# Button
---

## 基本使用

### 默认样式

在要应用按钮样式的元素上添加 `.zw-btn`，再设置相应的颜色。

- `.zw-btn-default` - 默认，灰色按钮
- `.zw-btn-primary` - 蓝色按钮
- `.zw-btn-secondary` - 浅蓝色按钮
- `.zw-btn-success` - 绿色按钮
- `.zw-btn-warning` - 橙色按钮
- `.zw-btn-danger` - 红色按钮

`````html
<button type="button" class="zw-btn zw-btn-default">默认样式</button>
<button type="button" class="zw-btn zw-btn-primary">主色按钮</button>
<button type="button" class="zw-btn zw-btn-secondary">次色按钮</button>
<button type="button" class="zw-btn zw-btn-success">绿色按钮</button>
<button type="button" class="zw-btn zw-btn-warning">橙色按钮</button>
<button type="button" class="zw-btn zw-btn-danger">红色按钮</button>
<a class="zw-btn zw-btn-danger" href="http://www.bing.com" target="_blank">应用按钮样式的链接</a>
`````

```html
<button type="button" class="zw-btn zw-btn-default">默认样式</button>
<button type="button" class="zw-btn zw-btn-primary">主色按钮</button>
<button type="button" class="zw-btn zw-btn-secondary">次色按钮</button>
<button type="button" class="zw-btn zw-btn-success">绿色按钮</button>
<button type="button" class="zw-btn zw-btn-warning">橙色按钮</button>
<button type="button" class="zw-btn zw-btn-danger">红色按钮</button>
<a class="zw-btn zw-btn-danger" href="http://www.bing.com" target="_blank">应用按钮样式的链接</a>
```

### 圆角按钮

在默认样式的基础上添加 `.zw-radius` class.

`````html
<button type="button" class="zw-btn zw-btn-default zw-radius">默认样式</button>
<button type="button" class="zw-btn zw-btn-primary zw-radius">主色按钮</button>
<button type="button" class="zw-btn zw-btn-secondary zw-radius">次色按钮</button>
<button type="button" class="zw-btn zw-btn-success zw-radius">绿色按钮</button>
<button type="button" class="zw-btn zw-btn-warning zw-radius">橙色按钮</button>
<button type="button" class="zw-btn zw-btn-danger zw-radius">红色按钮</button>
`````
```html
<button type="button" class="zw-btn zw-btn-default zw-radius">默认样式</button>
```

### 椭圆形按钮

在默认样式的基础上添加 `.zw-round` class.

`````html
<button type="button" class="zw-btn zw-btn-default zw-round">默认样式</button>
<button type="button" class="zw-btn zw-btn-primary zw-round">主色按钮</button>
<button type="button" class="zw-btn zw-btn-secondary zw-round">次色按钮</button>
<button type="button" class="zw-btn zw-btn-success zw-round">绿色按钮</button>
<button type="button" class="zw-btn zw-btn-warning zw-round">橙色按钮</button>
<button type="button" class="zw-btn zw-btn-danger zw-round">红色按钮</button>
`````
```html
<button type="button" class="zw-btn zw-btn-default zw-round">默认样式</button>
```

## 按钮状态

### 激活状态

在按钮上添加 `.zw-active` class。

`````html
<button type="button" class="zw-btn zw-btn-primary zw-active">激活状态</button>
<button type="button" class="zw-btn zw-btn-default zw-active">激活状态</button>
<br >
<br >
<a href="#" class="zw-btn zw-btn-primary zw-active" role="button">链接按钮激活状态</a>
<a href="#" class="zw-btn zw-btn-default zw-active" role="button">链接按钮激活状态</a>
`````
```html
<button type="button" class="zw-btn zw-btn-primary zw-active">激活状态</button>
<button type="button" class="zw-btn zw-btn-default zw-active">激活状态</button>
<br >
<br >
<a href="#" class="zw-btn zw-btn-primary zw-active" role="button">链接按钮激活状态</a>
<a href="#" class="zw-btn zw-btn-default zw-active" role="button">链接按钮激活状态</a>
```

### 禁用状态

在按钮上设置 `disabled` 属性或者添加 `.zw-disabled` class。

`````html
<button type="button" class="zw-btn zw-btn-primary" disabled="disabled">禁用状态</button>
<button type="button" class="zw-btn zw-btn-default" disabled="disabled">禁用状态</button>
<br><br>
<a href="#" class="zw-btn zw-btn-primary zw-disabled">链接按钮禁用状态</a>
<a href="#" class="zw-btn zw-btn-default zw-disabled">链接按钮禁用状态</a>
`````
```html
<button type="button" class="zw-btn zw-btn-primary" disabled="disabled">禁用状态</button>
<button type="button" class="zw-btn zw-btn-default" disabled="disabled">禁用状态</button>

<a href="#" class="zw-btn zw-btn-primary zw-disabled">链接按钮禁用状态</a>
<a href="#" class="zw-btn zw-btn-default zw-disabled">链接按钮禁用状态</a>
```

<div class="zw-alert zw-alert-warning">
  IE9 会把设置了 <code>disabled</code> 属性的 <code>button</code> 元素文字渲染成灰色并加上白色阴影，CSS 无法控制这个默认样式。
</div>


## 按钮尺寸

- `.zw-btn-xl`
- `.zw-btn-lg`
- `.zw-btn-default`
- `.zw-btn-sm`
- `.zw-btn-xs`

`````html
<button class="zw-btn zw-btn-default zw-btn-xl">按钮 - xl</button>
<button class="zw-btn zw-btn-default zw-btn-lg">按钮 - lg</button>
<button class="zw-btn zw-btn-default">按钮默认大小</button>
<button class="zw-btn zw-btn-default zw-btn-sm">按钮 - sm</button>
<button class="zw-btn zw-btn-default zw-btn-xs">按钮 - xs</button>
<br />
<br />
<button class="zw-btn zw-btn-primary zw-btn-xl">按钮 - xl</button>
<button class="zw-btn zw-btn-primary zw-btn-lg">按钮 - lg</button>
<button class="zw-btn zw-btn-primary">按钮默认大小</button>
<button class="zw-btn zw-btn-primary zw-btn-sm">按钮 - sm</button>
<button class="zw-btn zw-btn-primary zw-btn-xs">按钮 - xs</button>
`````
```html
<button class="zw-btn zw-btn-default zw-btn-xl">按钮 - xl</button>
<button class="zw-btn zw-btn-default zw-btn-lg">按钮 - lg</button>
<button class="zw-btn zw-btn-default">按钮默认大小</button>
<button class="zw-btn zw-btn-default zw-btn-sm">按钮 - sm</button>
<button class="zw-btn zw-btn-default zw-btn-xs">按钮 - xs</button>

<button class="zw-btn zw-btn-primary zw-btn-xl">按钮 - xl</button>
<button class="zw-btn zw-btn-primary zw-btn-lg">按钮 - lg</button>
<button class="zw-btn zw-btn-primary">按钮默认大小</button>
<button class="zw-btn zw-btn-primary zw-btn-sm">按钮 - sm</button>
<button class="zw-btn zw-btn-primary zw-btn-xs">按钮 - xs</button>
```

## 块级显示

添加 `.zw-btn-block` class。

`````html
<button type="button" class="zw-btn zw-btn-primary zw-btn-block">块级显示的按钮</button>
<button type="button" class="zw-btn zw-btn-default zw-btn-block">块级显示的按钮</button>
`````
```html
<button type="button" class="zw-btn zw-btn-primary zw-btn-block">块级显示的按钮</button>
<button type="button" class="zw-btn zw-btn-default zw-btn-block">块级显示的按钮</button>
```