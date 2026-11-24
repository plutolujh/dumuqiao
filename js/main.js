// dumuqiao/js/main.js

// 主题配色映射
const THEMES = {
  default: '浙江蓝',
  ink: '墨绿',
  warm: '暖橙',
  night: '夜色'
};

// 当前主题
let currentTheme = localStorage.getItem('dumuqiao-theme') || 'default';

// 渲染导航栏 header HTML
function renderHeader() {
  const themeButtons = Object.keys(THEMES).map(key => `
    <button class="theme-btn ${key === currentTheme ? 'active' : ''}"
            data-theme="${key}"
            title="${THEMES[key]}"
            onclick="setTheme('${key}')">
      ${key === 'night' ? '🌙' : key === 'warm' ? '🍊' : key === 'ink' ? '🌲' : '🔵'}
    </button>
  `).join('');

  return `
  <header class="nav-header">
    <div class="container">
      <h1>🎓 独木桥 · 浙江高考</h1>
      <nav>
        <a href="index.html">首页</a>
        <a href="encyclopedia.html">概念百科</a>
        <a href="universities.html">大学库</a>
        <a href="calculator.html">三一计算器</a>
        <a href="score-locator.html">分数定位</a>
        <a href="timeline.html">志愿时间轴</a>
        <a href="strategy.html">首考策略</a>
        <a href="study-materials.html">学习资料</a>
        <a href="changelog.html">更新日志</a>
      </nav>
      <div class="theme-toggle">
        ${themeButtons}
      </div>
    </div>
  </header>
  `;
}

// 版本信息
const VERSION = 'v1.0.3';

// 渲染 Footer
function renderFooter() {
  return `
  <footer>
    <div class="container">
      <p>🎓 独木桥 · 浙江高考选科选校通 &nbsp;|&nbsp; 数据来源于官方网站，请以官方发布为准</p>
    </div>
    <div class="container version-line">
      <p><a href="changelog.html">${VERSION}</a> &nbsp;|&nbsp; <a href="https://github.com/plutolujh/dumuqiao" target="_blank" rel="noopener noreferrer">🐙 GitHub</a></p>
    </div>
  </footer>
  `;
}

// 注入 header 到 body
function bootstrap() {
  document.body.insertAdjacentHTML('afterbegin', renderHeader());
  applyTheme(currentTheme);
  highlightActiveNav();
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

// 主题切换
function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('dumuqiao-theme', theme);
  applyTheme(theme);
  // 更新按钮状态
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// 高亮当前页面导航
function highlightActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-header nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ---------------- 轻量级自埋点（用于流量面板） ----------------
const STORAGE_KEY = 'dumuqiao_analytics';
function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) { return {}; }
}
function setAnalytics(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}
function recordEvent(type, label) {
  const data = getAnalytics();
  const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!data[type]) data[type] = {};
  if (!data[type][label]) data[type][label] = {};
  if (!data[type][label][now]) data[type][label][now] = 0;
  data[type][label][now]++;
  data[type][label].__total = (data[type][label].__total || 0) + 1;
  setAnalytics(data);
}

// 页面浏览（PV）
const pagePath = location.pathname.split('/').pop() || 'index.html';
recordEvent('pageview', pagePath);

// 工具卡片点击（在主页面上统计）
document.addEventListener('click', e => {
  const card = e.target.closest('.tool-card');
  if (card) {
    const title = card.querySelector('h3');
    if (title) recordEvent('tool_click', title.textContent.trim());
  }
});
