# Panel
---

面板组件带有轮廓、常用来放置带标题和文字的内容块。


## 基本样式

默认的 `.zw-panel` 提供基本的阴影和边距，默认边框添加 `.zw-panel-default`，内容放在 `.zw-panel-bd` 里面。

`````html
<div class="zw-panel zw-panel-default">
    <div class="zw-panel-bd">这是一个基本的面板组件。</div>
</div>
`````

```html
<div class="zw-panel zw-panel-default">
    <div class="zw-panel-bd">这是一个基本的面板组件。</div>
</div>
```
## 带标题的面板

`.zw-panel-hd` 用来放置标题，建议使用 `h1` - `h6` 并添加 `.zw-panel-title` class，更加语义化。

`````html
<div class="zw-panel zw-panel-default">
  <div class="zw-panel-hd">面板标题</div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<section class="zw-panel zw-panel-default">
  <header class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </header>
  <div class="zw-panel-bd">
    面板内容
  </div>
</section>
`````

```html
<div class="zw-panel zw-panel-default">
  <div class="zw-panel-hd">面板标题</div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<section class="zw-panel zw-panel-default">
  <header class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </header>
  <div class="zw-panel-bd">
    面板内容
  </div>
</section>
```

## 面板颜色

添加不同的一下类可以设置不同的颜色。

- `.zw-panel-primary`
- `.zw-panel-secondary`
- `.zw-panel-success`
- `.zw-panel-warning`
- `.zw-panel-danger`

`````html
<div class="zw-panel zw-panel-primary">
  <div class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<div class="zw-panel zw-panel-secondary">
  <div class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<div class="zw-panel zw-panel-success">
  <div class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<div class="zw-panel zw-panel-warning">
  <div class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>

<div class="zw-panel zw-panel-danger">
  <div class="zw-panel-hd">
    <h3 class="zw-panel-title">面板标题</h3>
  </div>
  <div class="zw-panel-bd">
    面板内容
  </div>
</div>
`````

```html
<div class="zw-panel zw-panel-primary">...</div>
<div class="zw-panel zw-panel-secondary">...</div>
<div class="zw-panel zw-panel-success">...</div>
<div class="zw-panel zw-panel-warning">...</div>
<div class="zw-panel zw-panel-danger">...</div>
```

## 面板页脚

面板页脚 `.zw-panel-footer`，用于放置次要信息。页脚不会继承 `.zw-panel-primary` - `.zw-panel-danger` 等颜色样式。

`````html
<section class="zw-panel zw-panel-default">
  <main class="zw-panel-bd">
    面板内容
  </main>
  <footer class="zw-panel-footer">面板页脚</footer>
</section>
`````

```html
<section class="zw-panel zw-panel-default">
  <main class="zw-panel-bd">
    面板内容
  </main>
  <footer class="zw-panel-footer">面板页脚</footer>
</section>
```
