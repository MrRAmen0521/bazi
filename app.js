/**
 * 命理轩 · 主应用逻辑
 * 交互、UI渲染、Canvas可视化、状态管理
 */

// =============================================
// 应用状态
// =============================================
const AppState = {
  currentPage: 'home',
  theme: localStorage.getItem('theme') || 'light',
  baziGender: 'male',
  baziCalendar: 'solar',
  baziHour: null,
  selectedEvent: '婚嫁',
  namingGender: 'male',
  history: JSON.parse(localStorage.getItem('baziHistory') || '[]'),
  currentResult: null,
};

// =============================================
// 初始化
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initPage();
  renderHistory();
  initHeroCanvas();
  initKnowledge();
  
  // 设置默认日期
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  
  ['baziSolarDate','qDate','mDate','fDate','namingDate','ausDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === 'baziSolarDate') {
        el.value = '1990-01-15';
      } else if (id === 'ausDate') {
        el.value = '1990-01-15';
      } else {
        el.value = dateStr;
      }
    }
  });
  
  // 月份选择器
  const ausMonth = document.getElementById('ausMonth');
  if (ausMonth) {
    ausMonth.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
  }
  
  // 填充农历年份
  const lunarYear = document.getElementById('baziLunarYear');
  if (lunarYear) {
    for (let y = 2024; y >= 1930; y--) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y + '年';
      lunarYear.appendChild(opt);
    }
  }
  
  // 填充农历日期
  const lunarDay = document.getElementById('baziLunarDay');
  if (lunarDay) {
    const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
      '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
      '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
    dayNames.forEach((n,i) => {
      const opt = document.createElement('option');
      opt.value = i+1; opt.textContent = n;
      lunarDay.appendChild(opt);
    });
  }
});

// =============================================
// 主题系统
// =============================================
function initTheme() {
  applyTheme(AppState.theme);
  
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
      applyTheme(AppState.theme);
      localStorage.setItem('theme', AppState.theme);
    });
  }
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.body.className = `theme-${theme}`;
}

// =============================================
// Header
// =============================================
function initHeader() {
  // 滚动效果
  window.addEventListener('scroll', () => {
    const header = document.getElementById('siteHeader');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
  }, { passive: true });
  
  // 移动端菜单
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.getElementById('mobileNav').classList.toggle('open');
    });
  }
  
  // 更新导航激活状态
  updateNavActive();
}

function updateNavActive() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
}

function closeMobileNav() {
  document.getElementById('mobileNav')?.classList.remove('open');
}

// =============================================
// 页面路由
// =============================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add('active');
    AppState.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNavActive();
    
    // 触发页面特定初始化
    if (pageId === 'knowledge') initKnowledge();
  }
}

function initPage() {
  showPage('home');
}

// =============================================
// Hero Canvas 粒子效果
// =============================================
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  resize();
  window.addEventListener('resize', resize, { passive: true });
  
  // 粒子系统
  const particles = [];
  const PARTICLE_COUNT = 60;
  
  // 八卦符号候选
  const symbols = ['☯','✦','◈','⊕','⊗','◎','⊙','✧'];
  const chars = ['木','火','土','金','水','甲','乙','丙','丁','戊','己','庚','辛','壬','癸',
                 '子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.25 + 0.05,
      size: Math.random() * 12 + 8,
      char: Math.random() > 0.7 ? symbols[Math.floor(Math.random() * symbols.length)] : chars[Math.floor(Math.random() * chars.length)],
      isChar: Math.random() > 0.3,
      color: Math.random() > 0.8 ? '#d4a843' : Math.random() > 0.6 ? '#c8432a' : 'rgba(255,255,255,0.8)',
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      
      if (p.isChar) {
        ctx.font = `${p.size}px 'Noto Serif SC', serif`;
        ctx.fillText(p.char, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// =============================================
// 表单交互
// =============================================
function scrollToFeatures() {
  document.getElementById('featuresSection')?.scrollIntoView({ behavior: 'smooth' });
}

function selectGender(btn, gender) {
  document.querySelectorAll('.gender-select .gender-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectBaziGender(gender) {
  AppState.baziGender = gender;
  document.getElementById('baziMaleBtn').classList.toggle('active', gender === 'male');
  document.getElementById('baziFemaleBtn').classList.toggle('active', gender === 'female');
}

function selectNamingGender(gender) {
  AppState.namingGender = gender;
  document.getElementById('namingMaleBtn').classList.toggle('active', gender === 'male');
  document.getElementById('namingFemaleBtn').classList.toggle('active', gender === 'female');
}

function switchCalendar(type) {
  AppState.baziCalendar = type;
  document.getElementById('solarTab').classList.toggle('active', type === 'solar');
  document.getElementById('lunarTab').classList.toggle('active', type === 'lunar');
  document.getElementById('solarDateGroup').classList.toggle('hidden', type === 'lunar');
  document.getElementById('lunarDateGroup').classList.toggle('hidden', type === 'solar');
}

function selectCalendar(btn, type) {
  document.querySelectorAll('.calendar-select .calendar-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectShichen(btn) {
  document.querySelectorAll('.shichen-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AppState.baziHour = parseInt(btn.dataset.hour);
}

function togglePref(btn) {
  btn.classList.toggle('active');
}

function selectEvent(btn) {
  document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AppState.selectedEvent = btn.textContent.trim();
}

// =============================================
// 快速分析（首页）
// =============================================
function quickAnalyze() {
  const date = document.getElementById('qDate')?.value;
  if (!date) {
    showToast('请选择出生日期', 'error');
    return;
  }
  
  // 跳转到排盘页并预填数据
  showPage('bazi');
  
  setTimeout(() => {
    const solarDate = document.getElementById('baziSolarDate');
    if (solarDate) solarDate.value = date;
    
    const hour = document.getElementById('qHour')?.value;
    if (hour) {
      const btn = document.querySelector(`[data-hour="${hour}"]`);
      if (btn) selectShichen(btn);
    }
    
    analyzeBazi();
  }, 300);
}

// =============================================
// 八字排盘主函数
// =============================================
function analyzeBazi() {
  // 获取输入
  let year, month, day, hour;
  
  if (AppState.baziCalendar === 'solar') {
    const dateVal = document.getElementById('baziSolarDate')?.value;
    if (!dateVal) { showToast('请选择出生日期', 'error'); return; }
    [year, month, day] = dateVal.split('-').map(Number);
  } else {
    year  = parseInt(document.getElementById('baziLunarYear')?.value);
    month = parseInt(document.getElementById('baziLunarMonth')?.value);
    day   = parseInt(document.getElementById('baziLunarDay')?.value);
    if (!year || !month || !day) { showToast('请填写完整农历日期', 'error'); return; }
    // 简化：农历直接当公历处理（实际应转换）
  }
  
  hour = AppState.baziHour;
  if (hour === null || hour === undefined) {
    hour = 11; // 默认午时
    showToast('未选择时辰，默认午时排盘', 'info');
  }
  
  const name = document.getElementById('baziName')?.value || '命主';
  
  // 显示加载
  document.getElementById('analyzeText').classList.add('hidden');
  document.getElementById('analyzeLoading').classList.remove('hidden');
  
  // 模拟计算延迟
  setTimeout(() => {
    try {
      const result = calculateBazi({
        year, month, day, hour,
        gender: AppState.baziGender
      });
      
      AppState.currentResult = { ...result, name, year, month, day, hour };
      
      renderBaziResult(result, name, year, month, day);
      saveToHistory({ name, year, month, day, hour, gender: AppState.baziGender, result });
      
    } catch (e) {
      console.error(e);
      showToast('排盘出错，请检查日期', 'error');
    }
    
    document.getElementById('analyzeText').classList.remove('hidden');
    document.getElementById('analyzeLoading').classList.add('hidden');
    
  }, 1200);
}

// =============================================
// 渲染八字结果
// =============================================
function renderBaziResult(result, name, year, month, day) {
  const { pillars, dayMaster, dayMasterWx, wuxingCount, strengthScore,
          shishenResult, xiyong, dayun, nayin } = result;
  
  // 显示结果区域
  document.getElementById('resultPlaceholder').classList.add('hidden');
  const content = document.getElementById('resultContent');
  content.classList.remove('hidden');
  
  // ---- 命主信息 ----
  document.getElementById('resAvatar').textContent = name.charAt(0);
  document.getElementById('resName').textContent = name;
  
  const lunar = solarToLunar(year, month, day);
  document.getElementById('resMeta').textContent = `${year}年 农历${lunar.month}${lunar.day} · ${getShichenName(AppState.baziHour || 11)}`;
  
  const tags = document.getElementById('resTags');
  tags.innerHTML = `
    <span class="tag">${AppState.baziCalendar === 'solar' ? '阳历' : '阴历'}</span>
    <span class="tag">${AppState.baziGender === 'male' ? '男命' : '女命'}</span>
    <span class="tag">${dayMaster}日主</span>
  `;
  
  // ---- 四柱八字 ----
  const colNames = ['年柱','月柱','日柱','时柱'];
  pillars.forEach((p, i) => {
    const tgEl = document.getElementById(`tg${i}`);
    const dzEl = document.getElementById(`dz${i}`);
    const wxEl = document.getElementById(`wx${i}`);
    
    if (tgEl) {
      tgEl.textContent = p.gan;
      tgEl.className = `tg-cell ${i === 2 ? 'day-master' : ''}`;
      // 五行颜色
      const wx = WUXING[p.ganIdx];
      tgEl.style.color = i === 2 ? '' : WUXING_COLORS[wx];
    }
    if (dzEl) {
      dzEl.textContent = p.zhi;
      dzEl.style.color = WUXING_COLORS[DIZHI_WUXING[p.zhi]];
    }
    if (wxEl) {
      const wx = WUXING[p.ganIdx];
      wxEl.textContent = wx;
      wxEl.style.color = WUXING_COLORS[wx];
      wxEl.style.background = WUXING_LIGHT_COLORS[wx];
    }
  });
  
  // 十神行
  shishenResult.forEach((s, i) => {
    const el = document.getElementById(`ss${i}`);
    if (el) {
      el.textContent = i === 2 ? '日主' : s.shishenGan;
      el.style.color = i === 2 ? 'var(--vermilion-500)' : 'var(--text-tertiary)';
    }
  });
  
  // 纳音
  document.getElementById('nayinText').textContent = nayin.join(' · ');
  
  // ---- 五行分析 ----
  renderWuxingChart(wuxingCount);
  
  // ---- 日主强弱 ----
  renderRizhu(dayMaster, dayMasterWx, strengthScore);
  
  // ---- 十神分析 ----
  renderShishen(shishenResult, dayMaster);
  
  // ---- 喜用神 ----
  renderXiyong(xiyong);
  
  // ---- 大运流年 ----
  renderDayun(dayun, year);
  
  // ---- 综合运势 ----
  renderFortune(dayMasterWx, strengthScore, wuxingCount);
  
  // 平滑滚动到结果
  setTimeout(() => {
    document.getElementById('baziResultPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ---- 五行雷达图 ----
function renderWuxingChart(wuxingCount) {
  const canvas = document.getElementById('wuxingCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const cx = 110, cy = 110, r = 90;
  const wuxingOrder = ['木','火','土','金','水'];
  const colors = wuxingOrder.map(w => WUXING_COLORS[w]);
  
  // 获取各五行数值（归一化）
  const raw = wuxingOrder.map(w => wuxingCount[w] || 0);
  const maxVal = Math.max(...raw, 3);
  const vals = raw.map(v => v / maxVal);
  
  ctx.clearRect(0, 0, 220, 220);
  
  // 绘制背景网格（五边形）
  for (let level = 1; level <= 5; level++) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * Math.PI / 180;
      const pr = r * level / 5;
      const x = cx + pr * Math.cos(angle);
      const y = cy + pr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = document.body.getAttribute('data-theme') === 'dark'
      ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // 绘制轴线
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.strokeStyle = document.body.getAttribute('data-theme') === 'dark'
      ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // 绘制五行区域
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const pr = r * Math.max(vals[i], 0.08);
    const x = cx + pr * Math.cos(angle);
    const y = cy + pr * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,67,42,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,67,42,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 绘制五行标签
  ctx.font = "bold 13px 'Noto Serif SC', serif";
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const labelR = r + 18;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    
    ctx.fillStyle = colors[i];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wuxingOrder[i], x, y);
  }
  
  // 中心点
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(200,67,42,0.6)';
  ctx.fill();
  
  // 五行统计条
  const statsEl = document.getElementById('wuxingStats');
  if (statsEl) {
    statsEl.innerHTML = wuxingOrder.map(w => {
      const count = wuxingCount[w] || 0;
      const pct = Math.round(count / maxVal * 100);
      return `
        <div class="wx-stat">
          <span class="wx-name" style="color:${WUXING_COLORS[w]}">${w}</span>
          <div class="wx-bar-bg">
            <div class="wx-bar-fill" style="width:${pct}%;background:${WUXING_COLORS[w]}"></div>
          </div>
          <span class="wx-count">${count.toFixed(1)}</span>
        </div>
      `;
    }).join('');
  }
  
  // 五行分析文字
  const dominant = wuxingOrder.reduce((a,b) => (wuxingCount[a]||0) > (wuxingCount[b]||0) ? a : b);
  const lacking = wuxingOrder.reduce((a,b) => (wuxingCount[a]||0) < (wuxingCount[b]||0) ? a : b);
  
  document.getElementById('wuxingAnalysis').innerHTML = 
    `命盘五行中，<strong style="color:${WUXING_COLORS[dominant]}">${dominant}</strong>气最旺（${(wuxingCount[dominant]||0).toFixed(1)}分），
    <strong style="color:${WUXING_COLORS[lacking]}">${lacking}</strong>气最弱（${(wuxingCount[lacking]||0).toFixed(1)}分）。
    五行${Object.values(wuxingCount).some(v => v < 0.5) ? '有明显缺失，需要通过饮食、颜色、方位等方式进行补充调和' : '较为平衡，命局相对稳健'}。`;
}

// ---- 日主强弱 ----
function renderRizhu(dayMaster, dayMasterWx, strengthScore) {
  const desc = TIANGAN_DESC[dayMaster];
  
  document.getElementById('rizhuChar').textContent = dayMaster;
  document.getElementById('rizhuChar').style.background = `linear-gradient(135deg, ${WUXING_COLORS[dayMasterWx]}, ${WUXING_COLORS[dayMasterWx]}cc)`;
  document.getElementById('rizhuName').textContent = desc?.title || dayMaster;
  
  let strengthLabel;
  if (strengthScore >= 80) strengthLabel = '极强（从强格局）';
  else if (strengthScore >= 65) strengthLabel = '偏强';
  else if (strengthScore >= 50) strengthLabel = '中强';
  else if (strengthScore >= 38) strengthLabel = '中弱';
  else if (strengthScore >= 22) strengthLabel = '偏弱';
  else strengthLabel = '极弱（从弱格局）';
  
  document.getElementById('rizhuStrength').textContent = `强度：${strengthScore}分 · ${strengthLabel}`;
  
  // 进度条
  const fillEl = document.getElementById('strengthFill');
  if (fillEl) {
    fillEl.style.width = '0%';
    // 添加进度条容器
    fillEl.parentElement.style.cssText = `
      height: 10px;
      background: var(--bg-subtle);
      border-radius: 5px;
      margin-bottom: 6px;
      overflow: hidden;
    `;
    setTimeout(() => { fillEl.style.width = strengthScore + '%'; }, 100);
  }
  
  document.getElementById('rizhuDesc').textContent = 
    (desc?.character || '') + `。${strengthScore >= 50 ? '日主偏强，宜官杀食伤克泄，' : '日主偏弱，宜印星比劫帮扶，'}` +
    `注重发挥${dayMasterWx}的特质，避免${strengthScore >= 50 ? '过于自我主观' : '过度谦让退缩'}。`;
}

// ---- 十神分析 ----
function renderShishen(shishenResult, dayMaster) {
  const grid = document.getElementById('shishenGrid');
  if (!grid) return;
  
  // 收集所有天干的十神
  const allShishen = {};
  shishenResult.forEach((s, i) => {
    if (i !== 2) {
      const ss = s.shishenGan;
      if (!allShishen[ss]) allShishen[ss] = { gan: s.gan, count: 0 };
      allShishen[ss].count++;
    }
  });
  
  // 补充常见十神
  const commonShishen = ['食神','伤官','偏财','正财','七杀','正官','偏印','正印','比肩','劫财'];
  const displayed = new Set(Object.keys(allShishen));
  
  // 从shishenResult提取更多
  shishenResult.forEach(s => {
    if (s.shishenZhi && s.shishenZhi !== '-' && s.shishenZhi !== '日主') {
      if (!allShishen[s.shishenZhi]) {
        allShishen[s.shishenZhi] = { gan: s.zhi, count: 0.5 };
      }
    }
  });
  
  grid.innerHTML = Object.entries(allShishen).map(([ss, info]) => `
    <div class="shishen-item">
      <span class="ss-char" style="color:var(--vermilion-500)">${info.gan}</span>
      <span class="ss-name">${ss}</span>
      <span class="ss-meaning">${SHISHEN_MEANING[ss] || ''}</span>
    </div>
  `).join('') || '<p style="color:var(--text-tertiary);font-size:13px;">命盘纯粹，十神较少</p>';
}

// ---- 喜用神 ----
function renderXiyong(xiyong) {
  const panel = document.getElementById('xiyongPanel');
  if (!panel) return;
  
  panel.innerHTML = xiyong.map(item => `
    <div class="xiyong-item">
      <div class="xiyong-badge" style="background:${WUXING_COLORS[item.wuxing]}">
        ${item.wuxing}
      </div>
      <div class="xiyong-info">
        <h4>
          <span style="color:${item.level === '用神' ? 'var(--vermilion-500)' : item.level === '喜神' ? 'var(--success)' : 'var(--text-tertiary)'}">[${item.level}]</span>
          ${item.wuxing} — ${item.role}
        </h4>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');
}

// ---- 大运流年 ----
function renderDayun(dayun, birthYear) {
  document.getElementById('dayunStart').innerHTML = 
    `<strong>起运岁数：${dayun.startAge}岁（${birthYear + dayun.startAge}年）起运</strong>，
    方向：${dayun.forward ? '顺行大运' : '逆行大运'}`;
  
  const tableEl = document.getElementById('dayunTable');
  if (!tableEl) return;
  
  tableEl.innerHTML = `
    <div class="dayun-inner">
      ${dayun.items.map(item => `
        <div class="dayun-item ${item.isCurrent ? 'current' : ''}">
          <span class="dayun-gan" style="color:${WUXING_COLORS[WUXING[TIANGAN.indexOf(item.gan)]]}">${item.gan}</span>
          <span class="dayun-zhi" style="color:${WUXING_COLORS[DIZHI_WUXING[item.zhi]]}">${item.zhi}</span>
          <span class="dayun-years">${item.startAge}-${item.endAge}岁</span>
          <span class="dayun-years">${item.startYear}年</span>
          ${item.isCurrent ? '<span class="dayun-label">当前大运</span>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// ---- 综合运势 ----
function renderFortune(dayMasterWx, strengthScore, wuxingCount) {
  const scores = getFortuneScore(dayMasterWx, strengthScore, wuxingCount);
  const grid = document.getElementById('fortuneGrid');
  if (!grid) return;
  
  const scoreColors = (s) => s >= 80 ? 'var(--success)' : s >= 65 ? 'var(--vermilion-500)' : s >= 50 ? 'var(--warning)' : 'var(--error)';
  const scoreStars = (s) => {
    const full = Math.floor(s / 20);
    const half = (s % 20) >= 10 ? 1 : 0;
    return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(5 - full - half);
  };
  
  const items = [['事业',scores['事业']],['财运',scores['财运']],['感情',scores['感情']],['健康',scores['健康']],['学业',scores['学业']]];
  
  grid.innerHTML = items.map(([name, score]) => `
    <div class="fortune-item">
      <div class="fortune-score" style="color:${scoreColors(score)}">${score}</div>
      <div class="fortune-name">${name}运势</div>
      <div class="fortune-stars" style="color:${scoreColors(score)}">${scoreStars(score)}</div>
    </div>
  `).join('');
}

// =============================================
// 历史记录
// =============================================
function saveToHistory(entry) {
  AppState.history.unshift({
    id: Date.now(),
    name: entry.name,
    date: `${entry.year}-${entry.month}-${entry.day}`,
    dayMaster: entry.result.dayMaster,
    pillars: entry.result.pillars,
    timestamp: new Date().toLocaleString('zh-CN')
  });
  
  if (AppState.history.length > 10) AppState.history.pop();
  localStorage.setItem('baziHistory', JSON.stringify(AppState.history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  
  if (AppState.history.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="17" stroke="currentColor" stroke-width="1.5" opacity=".3"/><path d="M20 12v10l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>暂无历史记录</span>
      </div>`;
    return;
  }
  
  list.innerHTML = AppState.history.map(item => `
    <div class="history-item" onclick="loadHistory(${item.id})">
      <div class="author-avatar" style="width:32px;height:32px;font-size:13px;background:var(--vermilion-500)">
        ${(item.name || '命').charAt(0)}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${item.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${item.date} · ${item.dayMaster}日主</div>
      </div>
      <span style="font-size:18px;color:${WUXING_COLORS[WUXING[TIANGAN.indexOf(item.dayMaster)]||'木']};font-family:'Noto Serif SC',serif">${item.dayMaster}</span>
    </div>
  `).join('');
}

function loadHistory(id) {
  showToast('加载历史记录功能需登录账号', 'info');
}

// =============================================
// 合婚分析 增强版
// =============================================
function runMarriageAnalysis() {
  const mDateVal = document.getElementById('mDate')?.value;
  const fDateVal = document.getElementById('fDate')?.value;

  if (!mDateVal || !fDateVal) {
    showToast('请填写双方出生日期', 'error');
    return;
  }

  const [my, mm, md] = mDateVal.split('-').map(Number);
  const [fy, fm, fd] = fDateVal.split('-').map(Number);
  const mHour = parseInt(document.getElementById('mHour')?.value) || 11;
  const fHour = parseInt(document.getElementById('fHour')?.value) || 11;

  const bazi1 = calculateBazi({ year: my, month: mm, day: md, hour: mHour, gender: 'male' });
  const bazi2 = calculateBazi({ year: fy, month: fm, day: fd, hour: fHour, gender: 'female' });

  const result = analyzeMarriage(bazi1, bazi2);

  // 保存当前分析数据
  AppState.currentMarriage = { bazi1, bazi2, result };

  // 显示结果
  document.getElementById('marriageResult').classList.remove('hidden');

  // 1. 绘制分数圆环
  drawScoreCircle('scoreCanvas', result.score);
  document.getElementById('marriageScore').textContent = result.score;

  // 评分等级
  const levelBadge = document.getElementById('scoreLevelBadge');
  let levelClass, levelText;
  if (result.score >= 85) { levelClass = 'excellent'; levelText = '天作之合'; }
  else if (result.score >= 70) { levelClass = 'good'; levelText = '良缘佳配'; }
  else if (result.score >= 55) { levelClass = 'average'; levelText = '中等匹配'; }
  else { levelClass = 'caution'; levelText = '需多磨合'; }
  levelBadge.className = 'score-level-badge ' + levelClass;
  levelBadge.textContent = levelText;

  // 综合评语
  const summaryEl = document.getElementById('scoreSummary');
  summaryEl.textContent = result.summary || generateMarriageSummary(result.score, result.dimensions);

  // 维度分数
  const dims = document.getElementById('scoreDimensions');
  dims.innerHTML = Object.entries(result.dimensions).map(([name, score]) => `
    <div class="dim-item">
      <span class="dim-name">${name}</span>
      <div class="dim-bar">
        <div class="dim-fill" style="width:${score}%"></div>
      </div>
      <span class="dim-score">${score}</span>
    </div>
  `).join('');

  // 2. 双方八字对比
  document.getElementById('marriageBaziCompare').innerHTML = `
    <div class="mbazi-person">
      <div class="mbazi-person-header male">
        <span>♂</span> ${document.getElementById('mName')?.value || '男方'}
      </div>
      <div class="mbazi-pillars">
        ${bazi1.pillars.map((p, i) => `
          <div class="mbazi-pillar">
            <div class="mbazi-pillar-label">${['年柱','月柱','日柱','时柱'][i]}</div>
            <div class="mbazi-pillar-gan" style="color:${WUXING_COLORS[WUXING[p.ganIdx]]}">${p.gan}</div>
            <div class="mbazi-pillar-zhi" style="color:${WUXING_COLORS[DIZHI_WUXING[p.zhi]]}">${p.zhi}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="mbazi-vs">合</div>
    <div class="mbazi-person">
      <div class="mbazi-person-header female">
        <span>♀</span> ${document.getElementById('fName')?.value || '女方'}
      </div>
      <div class="mbazi-pillars">
        ${bazi2.pillars.map((p, i) => `
          <div class="mbazi-pillar">
            <div class="mbazi-pillar-label">${['年柱','月柱','日柱','时柱'][i]}</div>
            <div class="mbazi-pillar-gan" style="color:${WUXING_COLORS[WUXING[p.ganIdx]]}">${p.gan}</div>
            <div class="mbazi-pillar-zhi" style="color:${WUXING_COLORS[DIZHI_WUXING[p.zhi]]}">${p.zhi}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // 3. 生肖合婚
  const sx1 = getShengxiao(my);
  const sx2 = getShengxiao(fy);
  const sxResult = analyzeShengxiao(sx1.zhi, sx2.zhi);
  document.getElementById('shengxiaoPanel').innerHTML = `
    <div class="shengxiao-animals">
      <div class="shengxiao-animal">
        <div class="shengxiao-emoji">${sx1.emoji}</div>
        <div class="shengxiao-name">${sx1.name}</div>
        <div class="shengxiao-person">男方</div>
      </div>
      <div class="shengxiao-connector">${sxResult.connector}</div>
      <div class="shengxiao-animal">
        <div class="shengxiao-emoji">${sx2.emoji}</div>
        <div class="shengxiao-name">${sx2.name}</div>
        <div class="shengxiao-person">女方</div>
      </div>
    </div>
    <div class="shengxiao-result">
      <div class="shengxiao-rating">
        <span class="shengxiao-stars">${'★'.repeat(sxResult.stars)}${'☆'.repeat(5-sxResult.stars)}</span>
        <span class="shengxiao-level">${sxResult.level}</span>
      </div>
      <div class="shengxiao-desc">${sxResult.desc}</div>
    </div>
  `;

  // 4. 五行互补
  document.getElementById('marriageWuxing').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">男方五行分布</div>
        ${renderWuxingMini(bazi1.wuxingCount)}
      </div>
      <div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">女方五行分布</div>
        ${renderWuxingMini(bazi2.wuxingCount)}
      </div>
    </div>
    <div class="knowledge-highlight">
      ${generateWuxingComplementText(bazi1.wuxingCount, bazi2.wuxingCount)}
    </div>
  `;

  // 5. 干支合冲分析
  const ganzhiItems = analyzeGanzhiRelations(bazi1, bazi2);
  document.getElementById('ganzhiAnalysis').innerHTML = `
    <div class="ganzhi-analysis-grid">
      ${ganzhiItems.map(item => `
        <div class="ganzhi-item ${item.type}">
          <div class="ganzhi-item-icon">${item.icon}</div>
          <div>
            <div class="ganzhi-item-type" style="color:${item.color}">${item.title}</div>
            <div class="ganzhi-item-desc">${item.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // 6. 婚姻建议
  document.getElementById('marriageAdvice').innerHTML = `
    <div class="advice-grid">
      <div class="advice-item">
        <div class="advice-item-title">💕 感情相处</div>
        <div class="advice-item-content">${result.advice.love}</div>
      </div>
      <div class="advice-item">
        <div class="advice-item-title">💼 事业互助</div>
        <div class="advice-item-content">${result.advice.career}</div>
      </div>
      <div class="advice-item">
        <div class="advice-item-title">👨‍👩‍👧 家庭建设</div>
        <div class="advice-item-content">${result.advice.family}</div>
      </div>
      <div class="advice-item">
        <div class="advice-item-title">💰 财运规划</div>
        <div class="advice-item-content">${result.advice.wealth}</div>
      </div>
    </div>
    <div class="advice-overall">
      <div class="advice-overall-title">📜 综合建议</div>
      <div class="advice-overall-text">${result.advice.overall}</div>
    </div>
  `;

  document.getElementById('marriageResult')?.scrollIntoView({ behavior: 'smooth' });
}

function renderWuxingMini(wuxingCount) {
  return ['木','火','土','金','水'].map(w => {
    const v = wuxingCount[w] || 0;
    const pct = Math.min(100, v * 20);
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="color:${WUXING_COLORS[w]};width:20px;text-align:center;font-family:'Noto Serif SC',serif;font-weight:700">${w}</span>
        <div style="flex:1;height:6px;background:var(--bg-subtle);border-radius:3px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${WUXING_COLORS[w]};border-radius:3px"></div>
        </div>
        <span style="font-size:11px;color:var(--text-tertiary);width:20px">${v.toFixed(1)}</span>
      </div>`;
  }).join('');
}

function drawScoreCircle(canvasId, score) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 90, cy = 90, r = 70;

  ctx.clearRect(0, 0, 180, 180);

  // 背景圆
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = document.body.getAttribute('data-theme') === 'dark'
    ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
  ctx.lineWidth = 12;
  ctx.stroke();

  // 分数弧
  const angle = (score / 100) * Math.PI * 2 - Math.PI / 2;
  const gradient = ctx.createLinearGradient(0, 0, 180, 180);
  gradient.addColorStop(0, '#c8432a');
  gradient.addColorStop(1, '#d4a843');

  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, angle);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// 获取生肖
function getShengxiao(year) {
  const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const emojis = ['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐷'];
  const zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const idx = (year - 4) % 12;
  return {
    name: animals[idx],
    emoji: emojis[idx],
    zhi: zhi[idx]
  };
}

// 生肖配对分析
function analyzeShengxiao(zhi1, zhi2) {
  const hePairs = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
  const chongPairs = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
  const xingPairs = [['子','卯'],['寅','巳'],['巳','申'],['申','亥'],['亥','未']];
  const haiPairs = [['子','未'],['丑','午'],['寅','巳'],['卯','辰'],['申','亥'],['酉','戌']];

  const pair = [zhi1, zhi2].sort();

  if (hePairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
    return { connector: '合', stars: 5, level: '六合大吉', desc: '生肖六合，乃上等婚配。两人性格互补，感情融洽，相处和谐，能相互扶持，共同创造美满家庭。' };
  }
  if (chongPairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
    return { connector: '冲', stars: 2, level: '六冲注意', desc: '生肖六冲，性格差异较大，容易产生矛盾。需要双方多包容理解，通过沟通化解分歧。' };
  }
  if (xingPairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
    return { connector: '刑', stars: 3, level: '相刑谨慎', desc: '生肖相刑，相处中可能有小摩擦。建议保持适当距离，尊重彼此空间，避免过度干涉。' };
  }
  if (haiPairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
    return { connector: '害', stars: 3, level: '相害一般', desc: '生肖相害，感情发展可能较缓慢。需要更多耐心培养感情，相互信任很重要。' };
  }

  return { connector: '平', stars: 4, level: '平和相处', desc: '生肖无明显合冲，属于中等婚配。感情发展平稳，需要双方共同努力经营婚姻。' };
}

// 生成五行互补文本
function generateWuxingComplementText(wx1, wx2) {
  const missing1 = Object.keys(wx1).filter(w => (wx1[w] || 0) < 1);
  const missing2 = Object.keys(wx2).filter(w => (wx2[w] || 0) < 1);
  const complement1 = missing1.filter(w => (wx2[w] || 0) >= 1.5);
  const complement2 = missing2.filter(w => (wx1[w] || 0) >= 1.5);

  if (complement1.length > 0 && complement2.length > 0) {
    return `双方五行互补性极佳。男方${complement1.join('、')}不足可由女方补充，女方${complement2.join('、')}不足可由男方补充，形成完美的五行循环，有利于家庭和谐与事业发展。`;
  } else if (complement1.length > 0) {
    return `男方${complement1.join('、')}偏弱，女方的五行配置正好可以弥补这一不足，有利于男方的事业发展和健康运势。`;
  } else if (complement2.length > 0) {
    return `女方${complement2.join('、')}偏弱，男方的五行配置可以为其提供有力补充，有助于女方的运势提升。`;
  }
  return '双方五行分布各有特点，建议在生活中注意五行平衡，可通过饮食、服饰、方位等方式进行调和。';
}

// 干支关系分析
function analyzeGanzhiRelations(bazi1, bazi2) {
  const items = [];
  const dayGan1 = bazi1.dayPillar.gan, dayZhi1 = bazi1.dayPillar.zhi;
  const dayGan2 = bazi2.dayPillar.gan, dayZhi2 = bazi2.dayPillar.zhi;

  // 日干相合
  const tianGanHe = { '甲':'己','乙':'庚','丙':'辛','丁':'壬','戊':'癸' };
  if (tianGanHe[dayGan1] === dayGan2 || tianGanHe[dayGan2] === dayGan1) {
    items.push({ type: 'positive', icon: '✦', color: 'var(--success)', title: '日干相合', desc: `双方日干${dayGan1}${dayGan2}天干五合，志趣相投，价值观契合，感情基础稳固。` });
  }

  // 日支六合
  const liuHe = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
  if (liuHe.some(p => p.includes(dayZhi1) && p.includes(dayZhi2))) {
    items.push({ type: 'positive', icon: '◈', color: 'var(--success)', title: '日支六合', desc: `双方日支${dayZhi1}${dayZhi2}六合，夫妻宫和谐，生活融洽，相互扶持。` });
  }

  // 日支六冲
  const liuChong = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
  if (liuChong.some(p => p.includes(dayZhi1) && p.includes(dayZhi2))) {
    items.push({ type: 'negative', icon: '⚡', color: 'var(--vermilion-500)', title: '日支六冲', desc: `双方日支${dayZhi1}${dayZhi2}相冲，婚后易有矛盾摩擦，需要多包容理解。` });
  }

  // 日干相生
  const sheng = { '甲':'水','乙':'水','丙':'木','丁':'木','戊':'火','己':'火','庚':'土','辛':'土','壬':'金','癸':'金' };
  const wxMap = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
  if (wxMap[dayGan1] === sheng[dayGan2]) {
    items.push({ type: 'positive', icon: '↗', color: 'var(--success)', title: '日干相生', desc: `男方生助女方，男方对女方关爱有加，有利于女方发展。` });
  } else if (wxMap[dayGan2] === sheng[dayGan1]) {
    items.push({ type: 'positive', icon: '↗', color: 'var(--success)', title: '日干相生', desc: `女方生助男方，女方对男方体贴入微，是男方的贤内助。` });
  }

  // 日主强弱互补
  const s1 = bazi1.strengthScore, s2 = bazi2.strengthScore;
  if ((s1 >= 60 && s2 <= 45) || (s1 <= 45 && s2 >= 60)) {
    items.push({ type: 'positive', icon: '⚖', color: 'var(--success)', title: '强弱互补', desc: '一方身强一方身弱，形成互补格局，有利于家庭分工协作。' });
  }

  // 年柱关系
  if (bazi1.yearPillar.zhi === bazi2.yearPillar.zhi) {
    items.push({ type: 'neutral', icon: '○', color: 'var(--text-tertiary)', title: '年支相同', desc: '双方年支相同，成长背景相似，容易有共同话题。' });
  }

  return items.length > 0 ? items : [{ type: 'neutral', icon: '◌', color: 'var(--text-tertiary)', title: '平和', desc: '双方八字干支关系平和，无明显合冲，属于中等婚配。' }];
}

// 生成婚姻总结
function generateMarriageSummary(score, dims) {
  if (score >= 85) return '你们是天作之合，八字高度匹配，五行互补，干支和谐。建议珍惜这段缘分，共同经营美好未来。';
  if (score >= 70) return '你们是良缘佳配，八字匹配度较高，有良好的感情基础。注意相互包容，婚姻会更加美满。';
  if (score >= 55) return '你们是中等匹配，八字无明显大忌，感情发展平稳。需要双方共同努力，多沟通多理解。';
  return '你们需要更多磨合，八字存在一定差异。建议多了解彼此，通过包容和沟通化解分歧。';
}

// =============================================
// 起名
// =============================================
function generateNames() {
  const surname = document.getElementById('namingSurname')?.value || '李';
  const dateVal = document.getElementById('namingDate')?.value;
  
  if (!dateVal) { showToast('请选择出生日期', 'error'); return; }
  
  const [y, m, d] = dateVal.split('-').map(Number);
  const hour = parseInt(document.getElementById('namingHour')?.value) || 11;
  
  const bazi = calculateBazi({ year: y, month: m, day: d, hour, gender: AppState.namingGender });
  
  // 取喜用神中用神的五行
  const xiyong = bazi.xiyong;
  const yongShen = xiyong.find(x => x.level === '用神')?.wuxing || '木';
  
  const names = generateNameSuggestions(surname, AppState.namingGender, yongShen);
  
  document.getElementById('namingResult').classList.remove('hidden');
  
  document.getElementById('namesGrid').innerHTML = names.map(n => `
    <div class="name-card">
      <div class="name-chars">${n.name}</div>
      <div class="name-pinyin">喜用神：${n.wuxing}</div>
      <div class="name-meaning">${n.meaning}</div>
      <span class="name-wx" style="background:${WUXING_LIGHT_COLORS[n.wuxing]};color:${WUXING_COLORS[n.wuxing]}">
        ${n.wuxing}气 ${n.score}分
      </span>
    </div>
  `).join('');
}

// =============================================
// 择吉
// =============================================
function findAuspiciousDays() {
  const dateVal = document.getElementById('ausDate')?.value;
  const monthVal = document.getElementById('ausMonth')?.value;
  
  if (!dateVal || !monthVal) { showToast('请填写完整参数', 'error'); return; }
  
  const [y, m, d] = dateVal.split('-').map(Number);
  const [qYear, qMonth] = monthVal.split('-').map(Number);
  const hour = parseInt(document.getElementById('ausHour')?.value) || 11;
  
  const bazi = calculateBazi({ year: y, month: m, day: d, hour, gender: 'male' });
  const xiyongWx = bazi.xiyong.find(x => x.level === '用神')?.wuxing || '木';
  
  const days = findAuspiciousDays(qYear, qMonth, AppState.selectedEvent, xiyongWx);
  
  renderAuspiciousCalendar(qYear, qMonth, days);
}

function renderAuspiciousCalendar(year, month, days) {
  const cal = document.getElementById('auspiciousCalendar');
  if (!cal) return;
  
  const monthNames = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const weekNames = ['日','一','二','三','四','五','六'];
  
  const firstDay = new Date(year, month - 1, 1).getDay();
  
  cal.innerHTML = `
    <div class="panel-card">
      <div class="aus-month-title">${year}年${monthNames[month-1]}月 · 择吉日历</div>
      <div class="aus-calendar-grid">
        ${weekNames.map(w => `<div class="aus-day-header">${w}</div>`).join('')}
        ${Array(firstDay).fill('<div class="aus-day empty"></div>').join('')}
        ${days.map(day => `
          <div class="aus-day ${day.level}">
            <span class="aus-day-num">${day.day}</span>
            <span class="aus-day-lunar">${day.lunar}</span>
            ${day.level !== 'normal' ? `<span class="aus-day-label">${day.reason}</span>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);margin-top:8px;">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:12px;height:12px;border-radius:3px;background:rgba(200,67,42,.15);border:1px solid rgba(200,67,42,.35)"></div>
          <span>大吉日</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:12px;height:12px;border-radius:3px;background:rgba(58,140,90,.1);border:1px solid rgba(58,140,90,.3)"></div>
          <span>吉日</span>
        </div>
        <div style="flex:1;text-align:right;color:var(--text-tertiary)">
          喜用神：<strong style="color:${WUXING_COLORS[days[0]?.level !== 'normal' ? '木' : '火']}">${AppState.selectedEvent}</strong>  
          结合您的喜用神进行推算
        </div>
      </div>
    </div>
  `;
}

// =============================================
// 知识库
// =============================================
const KNOWLEDGE_ARTICLES = {
  intro: `
    <div class="knowledge-article">
      <h2>生辰八字入门</h2>
      <div class="knowledge-highlight">
        八字，是中国传统命理学的核心体系，以出生年、月、日、时四个时间维度，各用一个天干一个地支来表示，共八个字，故称"八字"，又称"四柱"。
      </div>
      <h3>何为天干地支</h3>
      <p>天干十个：甲、乙、丙、丁、戊、己、庚、辛、壬、癸，分别对应五行（木木火火土土金金水水），且有阴阳之分。</p>
      <p>地支十二个：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥，对应十二月份，也有五行属性。天干地支循环组合，形成六十甲子，是古代时间计算的基础。</p>
      <h3>四柱的含义</h3>
      <table>
        <tr><th>柱</th><th>对应</th><th>代表领域</th><th>时间范围</th></tr>
        <tr><td>年柱</td><td>出生年</td><td>祖先、父母、童年运势</td><td>1-15岁前后</td></tr>
        <tr><td>月柱</td><td>出生月</td><td>父母、兄弟、青年运势</td><td>16-30岁前后</td></tr>
        <tr><td>日柱</td><td>出生日</td><td>自身（日主）、配偶</td><td>31-45岁前后</td></tr>
        <tr><td>时柱</td><td>出生时</td><td>子女、晚年运势</td><td>46岁以后</td></tr>
      </table>
      <h3>日主的重要性</h3>
      <p>日柱天干称为"日主"，是整个八字分析的核心。所有的五行关系、十神关系，都是以日主为中心来建立的。日主代表"我"，分析八字就是分析"我"与其他七个字之间的关系。</p>
    </div>
  `,
  tiangan: `
    <div class="knowledge-article">
      <h2>天干详解</h2>
      <div class="knowledge-highlight">天干共十位，甲乙属木，丙丁属火，戊己属土，庚辛属金，壬癸属水。奇数位为阳，偶数位为阴。</div>
      <table class="tiangan-table">
        <tr><th>天干</th><th>五行</th><th>阴阳</th><th>性格特质</th><th>象征</th></tr>
        <tr><td>甲</td><td style="color:var(--wx-wood)">木</td><td>阳</td><td>勇于开拓，领导气质强，不屈不挠</td><td>大树、栋梁</td></tr>
        <tr><td>乙</td><td style="color:var(--wx-wood)">木</td><td>阴</td><td>随机应变，温柔坚韧，情感细腻</td><td>花草、藤蔓</td></tr>
        <tr><td>丙</td><td style="color:var(--wx-fire)">火</td><td>阳</td><td>光明磊落，热情洋溢，社交活跃</td><td>太阳、烈火</td></tr>
        <tr><td>丁</td><td style="color:var(--wx-fire)">火</td><td>阴</td><td>内敛智慧，坚持不懈，艺术感强</td><td>蜡烛、星光</td></tr>
        <tr><td>戊</td><td style="color:var(--wx-earth)">土</td><td>阳</td><td>沉稳厚重，可靠诚信，事业心强</td><td>山岳、城墙</td></tr>
        <tr><td>己</td><td style="color:var(--wx-earth)">土</td><td>阴</td><td>温和谦逊，踏实勤劳，人缘极佳</td><td>田地、泥土</td></tr>
        <tr><td>庚</td><td style="color:var(--wx-metal)">金</td><td>阳</td><td>刚毅果断，正直坦率，极富正义感</td><td>斧钺、矿石</td></tr>
        <tr><td>辛</td><td style="color:var(--wx-metal)">金</td><td>阴</td><td>洁净优雅，注重细节，自尊心强</td><td>珠宝、金饰</td></tr>
        <tr><td>壬</td><td style="color:var(--wx-water)">水</td><td>阳</td><td>聪慧通达，胸怀远大，行动力佳</td><td>江河、大海</td></tr>
        <tr><td>癸</td><td style="color:var(--wx-water)">水</td><td>阴</td><td>神秘深邃，智慧内敛，感受力强</td><td>雨露、泉水</td></tr>
      </table>
    </div>
  `,
  dizhi: `
    <div class="knowledge-article">
      <h2>地支详解</h2>
      <div class="knowledge-highlight">地支十二位，子丑寅卯辰巳午未申酉戌亥，对应一年十二个月，以及一天十二个时辰。</div>
      <h3>地支与月份对应</h3>
      <table>
        <tr><th>地支</th><th>月份</th><th>五行</th><th>藏干</th><th>时辰</th></tr>
        <tr><td>子</td><td>十一月</td><td style="color:var(--wx-water)">水</td><td>壬癸</td><td>23-1时</td></tr>
        <tr><td>丑</td><td>十二月</td><td style="color:var(--wx-earth)">土</td><td>己癸辛</td><td>1-3时</td></tr>
        <tr><td>寅</td><td>正月</td><td style="color:var(--wx-wood)">木</td><td>甲丙戊</td><td>3-5时</td></tr>
        <tr><td>卯</td><td>二月</td><td style="color:var(--wx-wood)">木</td><td>甲乙</td><td>5-7时</td></tr>
        <tr><td>辰</td><td>三月</td><td style="color:var(--wx-earth)">土</td><td>戊乙癸</td><td>7-9时</td></tr>
        <tr><td>巳</td><td>四月</td><td style="color:var(--wx-fire)">火</td><td>丙庚戊</td><td>9-11时</td></tr>
        <tr><td>午</td><td>五月</td><td style="color:var(--wx-fire)">火</td><td>丙丁己</td><td>11-13时</td></tr>
        <tr><td>未</td><td>六月</td><td style="color:var(--wx-earth)">土</td><td>己丁乙</td><td>13-15时</td></tr>
        <tr><td>申</td><td>七月</td><td style="color:var(--wx-metal)">金</td><td>庚壬戊</td><td>15-17时</td></tr>
        <tr><td>酉</td><td>八月</td><td style="color:var(--wx-metal)">金</td><td>庚辛</td><td>17-19时</td></tr>
        <tr><td>戌</td><td>九月</td><td style="color:var(--wx-earth)">土</td><td>戊辛丁</td><td>19-21时</td></tr>
        <tr><td>亥</td><td>十月</td><td style="color:var(--wx-water)">水</td><td>壬甲</td><td>21-23时</td></tr>
      </table>
    </div>
  `,
  wuxing: `
    <div class="knowledge-article">
      <h2>五行生克制化</h2>
      <div class="knowledge-highlight">五行（木、火、土、金、水）之间存在相生和相克两种基本关系，是命理分析的基础框架。</div>
      <h3>五行相生</h3>
      <p>相生指一方促进另一方的生长：</p>
      <p><strong style="color:var(--wx-wood)">木</strong> 生 <strong style="color:var(--wx-fire)">火</strong> — 木材燃烧生火，木助火势</p>
      <p><strong style="color:var(--wx-fire)">火</strong> 生 <strong style="color:var(--wx-earth)">土</strong> — 火烧成灰化土，火温土脉</p>
      <p><strong style="color:var(--wx-earth)">土</strong> 生 <strong style="color:var(--wx-metal)">金</strong> — 土中含矿藏金，土中孕金</p>
      <p><strong style="color:var(--wx-metal)">金</strong> 生 <strong style="color:var(--wx-water)">水</strong> — 金属受热熔融成液，金生水</p>
      <p><strong style="color:var(--wx-water)">水</strong> 生 <strong style="color:var(--wx-wood)">木</strong> — 水滋润木的成长，水养木</p>
      <h3>五行相克</h3>
      <p>相克指一方抑制另一方：</p>
      <p><strong style="color:var(--wx-wood)">木</strong> 克 <strong style="color:var(--wx-earth)">土</strong> — 树根穿透土壤</p>
      <p><strong style="color:var(--wx-fire)">火</strong> 克 <strong style="color:var(--wx-metal)">金</strong> — 烈火熔化金属</p>
      <p><strong style="color:var(--wx-earth)">土</strong> 克 <strong style="color:var(--wx-water)">水</strong> — 堤坝阻挡水流</p>
      <p><strong style="color:var(--wx-metal)">金</strong> 克 <strong style="color:var(--wx-wood)">木</strong> — 刀斧砍伐树木</p>
      <p><strong style="color:var(--wx-water)">水</strong> 克 <strong style="color:var(--wx-fire)">火</strong> — 水可扑灭火焰</p>
      <div class="knowledge-highlight">
        在命理分析中，相生未必吉，相克未必凶。关键在于力量的平衡。过强需要克泄，过弱需要生扶，最终目的是达到命局平衡。
      </div>
    </div>
  `,
  shishen: `
    <div class="knowledge-article">
      <h2>十神体系</h2>
      <div class="knowledge-highlight">十神是以日主为中心，将其他天干分为十种关系。这十种关系涵盖了命主在人生各领域的互动模式。</div>
      <table>
        <tr><th>十神</th><th>与日主关系</th><th>代表含义</th></tr>
        <tr><td>比肩</td><td>同五行同阴阳</td><td>兄弟朋友，独立自主，竞争意识</td></tr>
        <tr><td>劫财</td><td>同五行异阴阳</td><td>争财夺利，意志坚定，情义重</td></tr>
        <tr><td>食神</td><td>日主生同阴阳</td><td>才华福寿，乐观豁达，口福之神</td></tr>
        <tr><td>伤官</td><td>日主生异阴阳</td><td>聪明才智，创新突破，艺术气质</td></tr>
        <tr><td>偏财</td><td>日主克同阴阳</td><td>意外之财，广缘人脉，父亲情缘</td></tr>
        <tr><td>正财</td><td>日主克异阴阳</td><td>勤劳务实，稳健理财，正统收入</td></tr>
        <tr><td>七杀</td><td>克日主同阴阳</td><td>权威魄力，竞争激烈，领导才能</td></tr>
        <tr><td>正官</td><td>克日主异阴阳</td><td>规则秩序，仕途前程，荣誉名声</td></tr>
        <tr><td>偏印</td><td>生日主同阴阳</td><td>独立思考，偏门技艺，直觉感知</td></tr>
        <tr><td>正印</td><td>生日主异阴阳</td><td>贵人相助，文化学识，母亲缘分</td></tr>
      </table>
    </div>
  `,
  dayun: `
    <div class="knowledge-article">
      <h2>大运与流年</h2>
      <div class="knowledge-highlight">大运以十年为一个周期，流年以一年为单位，两者叠加共同形成特定时期的运势走向。</div>
      <h3>起运计算</h3>
      <p>大运的起始年龄（起运岁数）按如下规则推算：</p>
      <p>• 男命阳年生、女命阴年生：顺推，即从出生日起算到下一节气的天数 ÷ 3，得到起运年龄。</p>
      <p>• 男命阴年生、女命阳年生：逆推，即从出生日起算到上一节气的天数 ÷ 3，得到起运年龄。</p>
      <h3>大运的影响</h3>
      <p>大运天干影响前五年，大运地支影响后五年。大运与八字喜忌是否相符，决定了这十年的整体顺逆。</p>
      <p>• 大运与喜神相符：这十年运势顺遂，事业财运较旺</p>
      <p>• 大运为忌神：这十年可能有较多挑战，需要谨慎应对</p>
      <h3>流年分析</h3>
      <p>流年干支每年更替，与命局、大运形成复杂的互动关系。重要的流年通常是：</p>
      <p>• 流年喜用神临时干支</p>
      <p>• 流年与命局形成六合、三合</p>
      <p>• 流年与命局形成六冲（需谨慎）</p>
    </div>
  `,
  xiyong: `
    <div class="knowledge-article">
      <h2>喜用神理论</h2>
      <div class="knowledge-highlight">喜用神是命理分析的核心结论，是对命局进行平衡调整的"药方"，指出应当扶持或引入哪种五行。</div>
      <h3>用神与喜神的区别</h3>
      <p>用神：命局最需要、最能调候平衡的那个五行，是第一选择。</p>
      <p>喜神：能够帮助用神发挥作用的五行，是辅助选择。</p>
      <p>忌神：对命局不利的五行，应当回避。</p>
      <h3>如何应用喜用神</h3>
      <p>在实际生活中，喜用神可以通过以下方式加以利用：</p>
      <p>• 服饰颜色：选择喜用神五行对应的颜色（木=绿、火=红、土=黄、金=白、水=黑）</p>
      <p>• 居住方位：根据五行方位（木=东、火=南、土=中、金=西、水=北）选择有利方位</p>
      <p>• 职业选择：木=文化教育、火=娱乐传媒、土=房产农业、金=金融机械、水=贸易流通</p>
      <p>• 起名用字：选用喜用神五行的字旁（木=林、火=炎、土=城、金=钦、水=涵）</p>
      <div class="knowledge-highlight">
        喜用神是参考指南，而非决定命运的绝对因素。后天的努力、选择和心态，同样是影响人生走向的重要力量。
      </div>
    </div>
  `
};

function initKnowledge() {
  showKnowledge(document.querySelector('.sidebar-item.active'), 'intro');
}

function showKnowledge(btn, key) {
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const content = document.getElementById('knowledgeContent');
  if (content) {
    content.innerHTML = KNOWLEDGE_ARTICLES[key] || '<p>内容加载中...</p>';
  }
}

// =============================================
// 弹窗系统
// =============================================
function showModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(event, id) {
  if (event.target.id === id) closeModal(id);
}

function switchLoginTab(btn, type) {
  document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('loginPhoneGroup').classList.toggle('hidden', type === 'password');
  document.getElementById('loginSmsGroup').classList.toggle('hidden', type === 'password');
  document.getElementById('loginPasswordGroup').classList.toggle('hidden', type === 'phone');
}

let smsTimer = null;
function sendSMS(btn) {
  if (smsTimer) return;
  btn.textContent = '60s后重发';
  btn.disabled = true;
  let count = 60;
  smsTimer = setInterval(() => {
    count--;
    btn.textContent = `${count}s后重发`;
    if (count <= 0) {
      clearInterval(smsTimer);
      smsTimer = null;
      btn.textContent = '发送验证码';
      btn.disabled = false;
    }
  }, 1000);
  showToast('验证码已发送（演示模式）', 'success');
}

function doLogin() {
  showToast('登录成功！欢迎使用命理轩', 'success');
  closeModal('loginModal');
}

function doRegister() {
  showToast('注册成功！已为您完成登录', 'success');
  closeModal('registerModal');
}

// =============================================
// 操作反馈
// =============================================
function saveResult() {
  showToast('命盘已保存到您的账号', 'success');
}

function shareResult() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast('链接已复制，可分享给好友', 'success');
  } else {
    showToast('分享功能暂需登录使用', 'info');
  }
}

// =============================================
// Toast 通知
// =============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = { success: 'var(--success)', error: 'var(--error)', info: 'var(--info)', warning: 'var(--warning)' };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span style="color:${colors[type]};font-size:16px">${icons[type]}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toast-out .3s var(--ease-out) forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =============================================
// 工具函数
// =============================================
function getShichenName(hour) {
  const map = {
    23:'子时', 1:'丑时', 3:'寅时', 5:'卯时', 7:'辰时', 9:'巳时',
    11:'午时', 13:'未时', 15:'申时', 17:'酉时', 19:'戌时', 21:'亥时'
  };
  return map[hour] || '午时';
}
