# dumuqiao 高考网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为浙江高考家长打造的工具型信息网站，核心功能为三位一体计算器和分数定位器，配概念百科和志愿流程时间轴

**Architecture:** 纯静态 HTML + CSS + Vanilla JS，无框架依赖，每个 HTML 内嵌 `<script type="application/json" id="page-data">` 存储页面数据，零额外请求

**Tech Stack:** HTML5 + CSS3 + Vanilla JavaScript，无框架依赖，Google Fonts (Noto Sans SC)

---

## 文件结构

```
dumuqiao/
├── index.html              — 首页（导航 + 工具入口）
├── encyclopedia.html       — 概念百科
├── calculator.html         — 三位一体计算器
├── score-locator.html      — 分数定位器
├── timeline.html          — 志愿填报时间轴
├── strategy.html           — 首考策略
├── css/
│   └── style.css           — 全局样式
└── js/
    └── main.js             — 通用逻辑（搜索、导航等）
```

---

## 数据文件（源数据备份，供嵌入参考）

```
data/
├── terms.json      — 百科词条（17条）
├── schools.json    — 院校层次及分数段
├── formulas.json   — 各校三位一体综合分公式
├── timeline.json   — 志愿填报时间轴
└── strategy.json  — 首考策略建议
```

---

## Task 1: 创建 CSS 框架 + 全局样式

**Files:**
- Create: `dumuqiao/css/style.css`

- [ ] **Step 1: 创建 CSS 文件，写入全局样式**

```css
/* dumuqiao/css/style.css */
:root {
  --primary: #1E6AB1;       /* 浙江蓝 */
  --accent: #F5A623;        /* 暖橙点缀 */
  --bg: #FFFFFF;
  --text: #333333;
  --text-light: #666666;
  --border: #E5E5E5;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
  --radius: 8px;
  --max-width: 960px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }

/* 通用容器 */
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 20px; }

/* 通用卡片 */
.card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
  margin-bottom: 20px;
}

/* 导航栏 */
.nav-header {
  background: var(--primary);
  color: #fff;
  padding: 16px 0;
}
.nav-header .container { display: flex; align-items: center; justify-content: space-between; }
.nav-header h1 { font-size: 20px; font-weight: 600; }
.nav-header nav a { color: #fff; opacity: 0.85; margin-left: 24px; font-size: 15px; }
.nav-header nav a:hover { opacity: 1; text-decoration: none; }

/* 页面标题 */
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin: 32px 0 24px;
}

/* 搜索框 */
.search-box {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 16px;
  margin-bottom: 24px;
}
.search-box:focus { outline: none; border-color: var(--primary); }

/* 词条卡片 */
.term-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.term-card:hover { box-shadow: var(--shadow); }
.term-card h3 { font-size: 17px; color: var(--primary); margin-bottom: 6px; }
.term-card .term-desc { color: var(--text-light); font-size: 14px; }
.term-card .term-detail { display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 15px; line-height: 1.7; }
.term-card.open .term-detail { display: block; }
.term-card .expand-hint { color: var(--accent); font-size: 13px; margin-top: 6px; }

/* 工具表单 */
.tool-section { background: #f8f9fa; border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
.tool-section h3 { font-size: 18px; margin-bottom: 16px; color: var(--text); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; color: var(--text-light); margin-bottom: 6px; }
.form-group input, .form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 15px;
}
.btn {
  display: inline-block;
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 12px;
}
.btn:hover { opacity: 0.9; }
.result-box {
  background: #e8f4fd;
  border: 1px solid #b8daef;
  border-radius: var(--radius);
  padding: 20px;
  margin-top: 20px;
  display: none;
}
.result-box.show { display: block; }
.result-box h4 { color: var(--primary); margin-bottom: 12px; font-size: 17px; }

/* 时间轴 */
.timeline { position: relative; padding-left: 32px; }
.timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: var(--border); }
.timeline-item { position: relative; margin-bottom: 32px; }
.timeline-item::before { content: ''; position: absolute; left: -28px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); }
.timeline-date { font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 4px; }
.timeline-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.timeline-desc { font-size: 14px; color: var(--text-light); }

/* Footer */
footer { background: #f5f5f5; text-align: center; padding: 24px 0; margin-top: 48px; font-size: 14px; color: var(--text-light); }
footer a { color: var(--primary); }
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/css/style.css
git commit -m "feat: add global CSS framework with dumuqiao design tokens"
```

---

## Task 2: 创建通用 JS 逻辑

**Files:**
- Create: `dumuqiao/js/main.js`

- [ ] **Step 1: 编写 main.js**

```javascript
// dumuqiao/js/main.js

// 渲染导航栏 header HTML
function renderHeader() {
  return `
  <header class="nav-header">
    <div class="container">
      <h1>🌲 独木桥 · 浙江高考</h1>
      <nav>
        <a href="index.html">首页</a>
        <a href="encyclopedia.html">概念百科</a>
        <a href="calculator.html">三一计算器</a>
        <a href="score-locator.html">分数定位</a>
        <a href="timeline.html">志愿时间轴</a>
        <a href="strategy.html">首考策略</a>
      </nav>
    </div>
  </header>
  `;
}

// 渲染 Footer
function renderFooter() {
  return `
  <footer>
    <div class="container">
      <p>独木桥 · 浙江高考选科选校通 &nbsp;|&nbsp; 数据来源于《省属家长》PDF</p>
    </div>
  </footer>
  `;
}

// 注入 header + footer 到 body
function bootstrap() {
  document.body.insertAdjacentHTML('afterbegin', renderHeader());
  document.body.insertAdjacentHTML('beforeend', renderFooter());
}

// 读取当前页面内嵌的 page-data
function getPageData() {
  const el = document.getElementById('page-data');
  if (!el) return null;
  return JSON.parse(el.textContent);
}

// 搜索过滤（通用）
function filterItems(items, query, label = 'name') {
  if (!query) return items;
  query = query.toLowerCase();
  return items.filter(item => item[label].toLowerCase().includes(query));
}

// 工具函数：渲染错误/提示
function showTip(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/js/main.js
git commit -m "feat: add main.js with shared utilities"
```

---

## Task 3: 实现 index.html 首页

**Files:**
- Create: `dumuqiao/index.html`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>独木桥 · 浙江高考选科选校通</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- 注入 header -->
  <script src="js/main.js"></script>
  <script>bootstrap();</script>

  <main class="container" style="margin-top:40px;">
    <h2 class="page-title">浙江高考选科选校通</h2>
    <p style="font-size:17px;color:#666;margin-bottom:32px;">面向浙江考生家长的高考信息工具站，帮你搞清楚三位一体是什么、分数能报什么学校、高考流程怎么走。</p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-bottom:40px;">
      <a href="calculator.html" class="card" style="display:block;text-decoration:none;cursor:pointer;">
        <h3 style="color:var(--primary);margin-bottom:8px;font-size:19px;">🎯 三位一体计算器</h3>
        <p style="color:var(--text-light);font-size:14px;">输入学考成绩、校测成绩、高考分数，计算综合分和降分幅度</p>
      </a>
      <a href="score-locator.html" class="card" style="display:block;text-decoration:none;cursor:pointer;">
        <h3 style="color:var(--primary);margin-bottom:8px;font-size:19px;">📊 分数定位器</h3>
        <p style="color:var(--text-light);font-size:14px;">输入高考分数，查询对应层次的推荐院校</p>
      </a>
      <a href="encyclopedia.html" class="card" style="display:block;text-decoration:none;cursor:pointer;">
        <h3 style="color:var(--primary);margin-bottom:8px;font-size:19px;">📖 概念百科</h3>
        <p style="color:var(--text-light);font-size:14px;">三位一体、强基计划、985/211…升学名词一网打尽</p>
      </a>
      <a href="timeline.html" class="card" style="display:block;text-decoration:none;cursor:pointer;">
        <h3 style="color:var(--primary);margin-bottom:8px;font-size:19px;">📅 志愿填报时间轴</h3>
        <p style="color:var(--text-light);font-size:14px;">6月到8月浙江高考志愿关键节点一览</p>
      </a>
      <a href="strategy.html" class="card" style="display:block;text-decoration:none;cursor:pointer;">
        <h3 style="color:var(--primary);margin-bottom:8px;font-size:19px;">🧠 首考策略</h3>
        <p style="color:var(--text-light);font-size:14px;">首考哪些科目建议放掉？怎么判断？进来看看</p>
      </a>
    </div>

    <div class="card">
      <h3 style="color:var(--primary);margin-bottom:12px;">📌 数据说明</h3>
      <p style="font-size:14px;color:var(--text-light);line-height:1.8;">
        本站点内容来源于《省属家长》高考升学专题讲座PDF（顺佳&amp;嵊州三加三高考升学规划讲座），信息仅供参考，请以浙江省教育考试院官方发布为准。
      </p>
    </div>
  </main>

  <script>bootstrap();</script>
</body>
</html>
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/index.html
git commit -m "feat: create index.html homepage with tool navigation cards"
```

---

## Task 4: 整理 data/formulas.json 院校三位一体公式数据

**Files:**
- Create: `dumuqiao/data/formulas.json`

- [ ] **Step 1: 从 PDF 提取公式数据写入 JSON**

```json
[
  {
    "name": "浙江工业大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": "学考等第折算：A=15分、B=10分、C=5分、D=2分"
  },
  {
    "name": "浙江财经大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "温州医科大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "浙江工商大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "浙江理工大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "浙江科技学院",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "浙大城市学院",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "绍兴文理学院",
    "weights": { "gaokao": 0.6, "xuekao": 0.2, "xiaoce": 0.2 },
    "note": ""
  },
  {
    "name": "杭州师范大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.15, "xiaoce": 0.25 },
    "note": "校测权重较高"
  },
  {
    "name": "宁波诺丁汉大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.15, "xiaoce": 0.25 },
    "note": ""
  },
  {
    "name": "温州肯恩大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.15, "xiaoce": 0.25 },
    "note": ""
  },
  {
    "name": "宁波大学",
    "weights": { "gaokao": 0.6, "xuekao": 0.1, "xiaoce": 0.3 },
    "note": ""
  },
  {
    "name": "浙江师范大学（复硕）",
    "weights": { "gaokao": 0.6, "xuekao": 0.1, "xiaoce": 0.3 },
    "note": ""
  },
  {
    "name": "杭州师范大学（复硕）",
    "weights": { "gaokao": 0.6, "xuekao": 0.1, "xiaoce": 0.3 },
    "note": ""
  },
  {
    "name": "浙江警察学院",
    "weights": { "gaokao": 0.75, "xuekao": 0.1, "xiaoce": 0.15 },
    "note": "高考权重最高"
  }
]
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/data/formulas.json
git commit -m "feat: add formulas.json - 三位一体各校权重公式数据"
```

---

## Task 5: 整理 data/schools.json 院校层次分数数据

**Files:**
- Create: `dumuqiao/data/schools.json`

- [ ] **Step 1: 写入 JSON**

```json
{
  "tiers": [
    {
      "name": "第一梯队（省重点/一本）",
      "scoreRange": [580, 700],
      "schools": [
        "浙江工业大学", "杭州师范大学", "浙江师范大学", "宁波大学", "宁波诺丁汉大学",
        "杭州电子科技大学", "浙江工商大学", "浙江理工大学", "温州大学", "浙江财经大学",
        "温州医科大学", "中国计量大学", "浙江中医药大学", "浙江农林大学", "浙江海洋大学",
        "浙江科技大学", "嘉兴大学", "温州肯恩大学"
      ]
    },
    {
      "name": "第二梯队（二本）",
      "scoreRange": [520, 579],
      "schools": [
        "浙江警察学院", "丽水学院", "湖州师范学院", "台州学院", "绍兴文理学院",
        "浙江外国语学院", "宁波工程学院", "衢州学院", "浙大城市学院", "浙江万里学院",
        "湖州学院", "嘉兴南湖学院", "温州理工学院", "浙大宁波理工学院", "杭州医学院",
        "浙江水利水电学院"
      ]
    },
    {
      "name": "第三梯队（三本）",
      "scoreRange": [470, 519],
      "schools": [
        "宁波大学科学技术学院", "温州商学院", "宁波财经学院", "浙江越秀外国语学院"
      ]
    },
    {
      "name": "第四梯队（大专/高职）",
      "scoreRange": [260, 469],
      "schools": [
        "金华职业技术大学", "宁波幼儿师范高等专科学校", "杭州职业技术大学",
        "浙江机电职业技术大学", "浙江交通职业技术学院"
      ]
    }
  ],
  "scoreReference": {
    "985": 635,
    "省重点好专业": 635,
    "省重点差专业": 610,
    "二本好专业": 610,
    "二本差专业": 560,
    "三本好专业": 550,
    "三本差专业": 520,
    "重点大专好专业": 515,
    "重点大专差专业": 470,
    "公办大专好专业": 470
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/data/schools.json
git commit -m "feat: add schools.json - 院校层次及分数段数据"
```

---

## Task 6: 整理 data/terms.json 百科词条

**Files:**
- Create: `dumuqiao/data/terms.json`

- [ ] **Step 1: 写入 17 条词条 JSON**

```json
[
  {
    "id": "985",
    "name": "985高校",
    "desc": "全国39所国家重点建设的高水平大学，含北京大学、清华大学、复旦大学、浙江大学等。",
    "detail": "985高校是国家在1998年启动的重点建设工程，全国共39所。浙江有浙江大学。985高校在提前批、普通批均有招生，分数要求较高。"
  },
  {
    "id": "211",
    "name": "211高校",
    "desc": "面向21世纪重点建设的100所左右高等学校，数量多于985。",
    "detail": "211工程是国家重点建设项目，全国约116所。包含所有985高校。浙江有浙江大学。211学校就业和升学均有优势。"
  },
  {
    "id": "qiangji",
    "name": "强基计划",
    "desc": "教育部基础学科拔尖人才培养计划，重点招收数学、物理、化学、生物、历史、哲学等基础学科。",
    "detail": "强基计划是2020年开始的招生改革措施，在普通批之前单独录取。适合基础学科特长的学生，但入学后不能转专业。"
  },
  {
    "id": "sanweiyiti",
    "name": "三位一体",
    "desc": "学考成绩 + 校测成绩 + 高考成绩，三项综合择优录取。浙江特有招生模式。",
    "detail": "三位一体是浙江省特有的综合评价招生模式。综合分 = 高考成绩×权重 + 学考成绩×权重 + 校测成绩×权重。各校权重不同，最高可降分68分。报名时间通常在3-4月，校测在4月，高考后填志愿。"
  },
  {
    "id": "gaozhi",
    "name": "高职提前招",
    "desc": "大专院校在高考前提前招生，通过即可免高考入学。",
    "detail": "高职提前招适合成绩一般的学生，通过招生院校的综合测试后可直接录取。浙江省有47所高职院校参与。"
  },
  {
    "id": "tiqianpi",
    "name": "提前批",
    "desc": "在普通批之前录取的批次，包括军校、警校、师范、公费师范生、航海、港澳院校等。",
    "detail": "提前批填报时间在6月29-30日（浙江）。提前批不不影响普通批录取，适合有明确意向的学生。但注意：提前批一旦录取，普通批不再投档。"
  },
  {
    "id": "pingxing",
    "name": "普通平行志愿",
    "desc": "分数优先、遵循志愿、一轮投档，是浙江普通批的主要投档方式。",
    "detail": "平行志愿下，先按分数排位，再按志愿顺序投档。每位考生只有一次投档机会。填志愿时要有梯度：冲、稳、保。"
  },
  {
    "id": "yiduanxian",
    "name": "一段线/二段线",
    "desc": "浙江高考分段录取控制线，一段线约相当于传统一本线。",
    "detail": "一段线按实考人数的前60%划定，二段线按前90%划定。一段线考生可以报一本和二本院校；二段线考生主要报二本、三本和大专。"
  },
  {
    "id": "gaoxiao",
    "name": "高校专项",
    "desc": "农村和贫困地区学生的定向招生，名额分配到县，符合条件考生可报考。",
    "detail": "高校专项计划招生院校为部属高校和浙江大学等。考生需符合浙江省实施区域条件，在单独批次填报志愿，每生可填报一所院校。"
  },
  {
    "id": "difang",
    "name": "地方专项",
    "desc": "浙江省属高校面向农村学生的专项招生计划，只招浙江农村户口考生。",
    "detail": "地方专项计划志愿单独设置批次，实行专业平行志愿投档。考生可填报不超过30个志愿，每所高校的1个专业作为1个志愿单位。"
  },
  {
    "id": "gongfei",
    "name": "公费师范生",
    "desc": "教育部直属6所师范院校的定向培养计划，免学费、住宿费，有编有岗。",
    "detail": "招生院校：北京师范大学、华东师范大学、东北师范大学、华中师范大学、陕西师范大学、西南大学。毕业后面向生源地就业，有服务期。"
  },
  {
    "id": "wuguanxiao",
    "name": "五大官校",
    "desc": "国际关系学院、外交学院、北京电子科技学院、中国消防救援学院、上海海关学院。",
    "detail": "这五所院校均为提前批招生，就业方向明确（外交、消防、海关、信息安全等）。北京电子科技学院的密码科学与技术是王牌专业。"
  },
  {
    "id": "gongan",
    "name": "公安联考",
    "desc": "警校毕业生通过公安联考入警的通道，只有公安类专业毕业生才能参加。",
    "detail": "浙江警官职业学院毕业生不能参加公安联考（可以参加司法联考，必须是提前批专业）。公安专业只在提前批招生，需参加面试、体测、政审。"
  },
  {
    "id": "zhengji",
    "name": "征求志愿",
    "desc": "各批次录取结束后，未完成招生计划的院校进行征集填报。",
    "detail": "征求志愿填报时间通常在7月下旬至8月初。一段征求在7月26-27日，二段征求在8月5日。征求志愿是上车的最后机会。"
  },
  {
    "id": "shoukao",
    "name": "首考/赋分",
    "desc": "浙江首考（1月）成绩参加等级赋分，赋分后计入高考。",
    "detail": "首考科目（外语+选考科目）以等级赋分计入高考。赋分区间1-100分，最低21分。首考成绩不理想的科目可以在6月再次报考，取最高分。"
  },
  {
    "id": "xuekao",
    "name": "学考",
    "desc": "学业水平考试，等第（A/B/C/D）影响三位一体综合素质评价分。",
    "detail": "学考成绩以等第呈现：A等折算分最高，D等最低。各校三位一体中学考权重10%-20%不等。学考等第也可以反映学生的学习基础。"
  },
  {
    "id": "xiaoce",
    "name": "校测",
    "desc": "高校综合素质测试，通常含面试、笔试、体测等，在三位一体中占重要权重。",
    "detail": "校测通常在4月底进行，各校形式不同（面试为主）。面试成绩1分之差可能带来高考成绩几十分的优惠。校测权重通常10%-30%。"
  }
]
```

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/data/terms.json
git commit -m "feat: add terms.json - 17条百科词条数据"
```

---

## Task 7: 整理 data/timeline.json 和 data/strategy.json

**Files:**
- Create: `dumuqiao/data/timeline.json`
- Create: `dumuqiao/data/strategy.json`

- [ ] **Step 1: 写入 timeline.json**

```json
[
  { "date": "6月25日", "event": "高考成绩查询", "desc": "浙江省教育考试院公布高考成绩，可查询分数和位次" },
  { "date": "6月29-30日 8:30-17:30", "event": "提前批志愿填报", "desc": "普通类提前批、艺体类等志愿填报截止时间，逾期不补填" },
  { "date": "7月5日前", "event": "强基计划、西湖大学录取", "desc": "强基计划和西湖大学完成录取" },
  { "date": "7月7日前", "event": "香港单招高校录取", "desc": "香港单招院校（香港大学等）完成录取" },
  { "date": "7月8日", "event": "高水平大学三位一体投档", "desc": "高水平三一（复旦、交大、浙大等）投档录取" },
  { "date": "7月9日", "event": "浙江警察学院投档录取", "desc": "浙警提前批投档录取" },
  { "date": "7月12日", "event": "提前批投档录取", "desc": "普通类提前批各院校投档录取" },
  { "date": "7月15日", "event": "高校专项、地方专项投档", "desc": "高校专项和地方专项计划投档录取" },
  { "date": "7月21日", "event": "一段平行投档录取", "desc": "普通类一段平行志愿投档录取" },
  { "date": "7月24日", "event": "公布剩余计划", "desc": "一段录取后未完成招生计划的院校公布剩余计划" },
  { "date": "7月26-27日 8:30-17:30", "event": "二段平行志愿填报", "desc": "二段线上考生填报平行志愿" },
  { "date": "7月30日", "event": "二段平行投档录取", "desc": "普通类二段平行志愿投档录取" },
  { "date": "8月2日上午", "event": "公布征求计划", "desc": "二段录取后征求志愿院校公布计划" },
  { "date": "8月5日 8:30-17:30", "event": "征求志愿填报", "desc": "征求志愿填报，最后上岸机会" },
  { "date": "8月3-5日", "event": "征求志愿投档", "desc": "征求志愿投档录取" }
]
```

- [ ] **Step 2: 写入 strategy.json**

```json
[
  {
    "condition": "省内重点高校（杭电、浙工大等）单科赋分88以上",
    "advice": "建议放掉该科目，将精力集中在其他科目",
    "suitable": "目标是省属重点高校的学生"
  },
  {
    "condition": "根据平时学校考试或各大联盟考试，超常发挥的学科",
    "advice": "该学科已经超出正常水平，首考放掉可以保住超常发挥的分数",
    "suitable": "某科目明显超出平时水平"
  },
  {
    "condition": "非常不擅长，很难提升，但考得还行，且其他优势学科有更高提分空间",
    "advice": "放掉瘸腿科目，专攻优势科目，总体收益更高",
    "suitable": "存在明显弱科且提分困难"
  },
  {
    "condition": "成绩不稳定但题目难度大的时候名次反而好的学生",
    "advice": "这类学生首考难度大时有优势，但正式高考竞争更激烈，建议谨慎放科目",
    "suitable": "成绩波动大、越难越好的学生"
  }
]
```

- [ ] **Step 3: 提交**

```bash
git add dumuqiao/data/timeline.json dumuqiao/data/strategy.json
git commit -m "feat: add timeline.json and strategy.json"
```

---

## Task 8: 实现 encyclopedia.html 概念百科

**Files:**
- Create: `dumuqiao/encyclopedia.html`

- [ ] **Step 1: 创建 encyclopedia.html，内嵌 terms.json 数据**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>概念百科 · 独木桥</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <script src="js/main.js"></script>
  <script>bootstrap();</script>

  <main class="container">
    <h2 class="page-title">概念百科</h2>
    <p style="color:var(--text-light);margin-bottom:20px;">点击词条查看详细解释，支持搜索过滤</p>
    <input type="text" class="search-box" id="searchInput" placeholder="🔍 搜索词条...">

    <div id="termsList"></div>
  </main>

  <script type="application/json" id="page-data">
$JSON_CONTENT_PLACEHOLDER$
  </script>

  <script>
    const terms = getPageData();

    function renderTerms(items) {
      const list = document.getElementById('termsList');
      if (!items.length) {
        list.innerHTML = '<p style="color:var(--text-light);padding:20px 0;">没有找到匹配的词条</p>';
        return;
      }
      list.innerHTML = items.map(term => `
        <div class="term-card" onclick="this.classList.toggle('open')">
          <h3>${term.name}</h3>
          <p class="term-desc">${term.desc}</p>
          <p class="expand-hint">点击展开 ↓</p>
          <div class="term-detail">${term.detail}</div>
        </div>
      `).join('');
    }

    renderTerms(terms);

    document.getElementById('searchInput').addEventListener('input', e => {
      const q = e.target.value;
      const filtered = filterItems(terms, q, 'name');
      renderTerms(filtered);
    });
  </script>

  <script>document.body.insertAdjacentHTML('beforeend', renderFooter());</script>
</body>
</html>
```

（实际嵌入时将 `$JSON_CONTENT_PLACEHOLDER$` 替换为 terms.json 内容）

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/encyclopedia.html
git commit -m "feat: create encyclopedia.html with embedded terms data"
```

---

## Task 9: 实现 calculator.html 三位一体计算器

**Files:**
- Create: `dumuqiao/calculator.html`

- [ ] **Step 1: 创建 calculator.html，内嵌 formulas.json 数据**

页面包含：
- 学校选择下拉框（加载 formulas 数据）
- 输入框：高考分数（750满分）、学考等第折算总分、校测成绩
- 计算按钮
- 结果展示区：综合分 + 降分幅度估算

计算公式：`综合分 = (高考分/750*100)*gaokao权重 + 学考折算分*gaokao权重 + 校测分*xiaoce权重`

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/calculator.html
git commit -m "feat: create calculator.html - 三位一体综合分计算器"
```

---

## Task 10: 实现 score-locator.html 分数定位器

**Files:**
- Create: `dumuqiao/score-locator.html`

- [ ] **Step 1: 创建 score-locator.html，内嵌 schools.json 数据**

页面包含：
- 输入框：高考分数
- 计算按钮
- 结果展示：匹配到哪个层次 + 该层次院校列表 + 分数参考

逻辑：遍历 tiers，按 scoreRange 匹配，返回对应层及院校列表。

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/score-locator.html
git commit -m "feat: create score-locator.html - 分数定位器"
```

---

## Task 11: 实现 timeline.html 志愿时间轴

**Files:**
- Create: `dumuqiao/timeline.html`

- [ ] **Step 1: 创建 timeline.html，内嵌 timeline.json 数据**

页面包含：
- 时间轴渲染，JSON 遍历
- 日期 + 事件名 + 描述

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/timeline.html
git commit -m "feat: create timeline.html - 志愿填报时间轴"
```

---

## Task 12: 实现 strategy.html 首考策略

**Files:**
- Create: `dumuqiao/strategy.html`

- [ ] **Step 1: 创建 strategy.html，内嵌 strategy.json 数据**

页面包含：
- 条件 + 建议 + 适用场景，列表渲染

- [ ] **Step 2: 提交**

```bash
git add dumuqiao/strategy.html
git commit -m "feat: create strategy.html - 首考策略"
```

---

## Task 13: 整体验证 + 提交最终 commit

- [ ] **Step 1: 浏览器打开所有 HTML 文件验证无错误**
- [ ] **Step 2: 检查 response layout on mobile (320px width)**
- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: complete dumuqiao website - all 5 pages + CSS + JS"
```

---

## 自查清单（执行后确认）

1. 每个 HTML 页面都能独立打开，无 JS 报错
2. 百科搜索能过滤词条，点击词条能展开详情
3. 计算器输入分数能出结果
4. 分数定位器输入分数能返回对应院校层次
5. 时间轴和首考策略内容完整渲染
6. 手机端布局正常，不溢出
