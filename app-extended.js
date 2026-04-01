/**
 * 命理轩 · 扩展功能增强模块
 * 包含：择吉日增强、知识库增强
 */

// =============================================
// 择吉日 增强版
// =============================================

const EVENT_DESC = {
  '婚嫁': '婚姻大事，宜选天德、月德、六合、三合等吉日，忌冲克新人八字的日子。',
  '开业': '开业大吉，宜选财星临日、贵人日，忌破日、败日。',
  '入宅': '乔迁新居，宜选黄道吉日、天德月德，忌五鬼、月破。',
  '出行': '远行外出，宜选驿马日、天德，忌往亡、月刑。',
  '签约': '签约合作，宜选天愿、六合，忌月破、平日。',
  '开工': '开工动土，宜选天德、月德、满日，忌月破、平日。'
};

function selectEvent(btn) {
  document.querySelectorAll('.event-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  AppState.selectedEvent = btn.textContent.trim();

  const descEl = document.getElementById('ausEventDesc');
  if (descEl) {
    descEl.textContent = EVENT_DESC[AppState.selectedEvent] || '';
  }
}

function runAuspiciousDays() {
  const dateVal = document.getElementById('ausDate')?.value;
  const monthVal = document.getElementById('ausMonth')?.value;

  if (!dateVal || !monthVal) { showToast('请填写完整参数', 'error'); return; }

  const [y, m, d] = dateVal.split('-').map(Number);
  const [qYear, qMonth] = monthVal.split('-').map(Number);
  const hour = parseInt(document.getElementById('ausHour')?.value) || 11;

  const bazi = calculateBazi({ year: y, month: m, day: d, hour, gender: 'male' });
  const xiyongWx = bazi.xiyong.find(x => x.level === '用神')?.wuxing || '木';

  const tipEl = document.getElementById('ausXiyongTip');
  if (tipEl) {
    tipEl.style.display = 'block';
    tipEl.innerHTML = '您的喜用神为<strong>' + xiyongWx + '</strong>，本日历已结合喜用神进行吉日筛选。';
  }

  const days = findAuspiciousDays(qYear, qMonth, AppState.selectedEvent, xiyongWx);

  AppState.currentAuspiciousDays = days;
  AppState.currentAuspiciousXiyong = xiyongWx;

  renderAuspiciousCalendar(qYear, qMonth, days);
}

function renderAuspiciousCalendar(year, month, days) {
  const cal = document.getElementById('auspiciousCalendar');
  if (!cal) return;

  const monthNames = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const weekNames = ['日','一','二','三','四','五','六'];

  const firstDay = new Date(year, month - 1, 1).getDay();

  const bestCount = days.filter(d => d.level === 'best').length;
  const goodCount = days.filter(d => d.level === 'auspicious').length;

  cal.innerHTML = `
    <div class="aus-calendar-card">
      <div class="aus-calendar-header">
        <div class="aus-month-title">${year}年${monthNames[month-1]}月 · ${AppState.selectedEvent}择吉</div>
        <div class="aus-calendar-stats">
          <div class="aus-stat-item">
            <div class="aus-stat-dot" style="background:rgba(200,67,42,.5)"></div>
            <span>大吉 ${bestCount}天</span>
          </div>
          <div class="aus-stat-item">
            <div class="aus-stat-dot" style="background:rgba(58,140,90,.5)"></div>
            <span>吉日 ${goodCount}天</span>
          </div>
        </div>
      </div>
      <div class="aus-calendar-grid">
        ${weekNames.map(w => '<div class="aus-day-header">' + w + '</div>').join('')}
        ${Array(firstDay).fill('<div class="aus-day empty"></div>').join('')}
        ${days.map((day, idx) => `
          <div class="aus-day ${day.level}" onclick="showAusDayDetail(${idx})">
            <span class="aus-day-num">${day.day}</span>
            <span class="aus-day-gz">${day.ganzhi}</span>
            ${day.level !== 'normal' ? '<span class="aus-day-label">' + day.reason + '</span>' : ''}
          </div>
        `).join('')}
      </div>
      <div class="aus-legend">
        <div class="aus-legend-item">
          <div class="aus-legend-dot" style="background:rgba(200,67,42,.15);border:1.5px solid rgba(200,67,42,.35)"></div>
          <span>大吉日 · 诸事皆宜</span>
        </div>
        <div class="aus-legend-item">
          <div class="aus-legend-dot" style="background:rgba(58,140,90,.1);border:1.5px solid rgba(58,140,90,.3)"></div>
          <span>吉日 · 宜${AppState.selectedEvent}</span>
        </div>
        <div class="aus-legend-item">
          <div class="aus-legend-dot" style="background:var(--bg-subtle);border:1.5px solid var(--border-color)"></div>
          <span>平日 · 谨慎行事</span>
        </div>
      </div>
    </div>
  `;
}

function showAusDayDetail(dayIdx) {
  const day = AppState.currentAuspiciousDays?.[dayIdx];
  if (!day) return;

  const detailEl = document.getElementById('ausDayDetail');
  const dateEl = document.getElementById('ausDetailDate');
  const bodyEl = document.getElementById('ausDetailBody');

  if (!detailEl || !dateEl || !bodyEl) return;

  dateEl.textContent = day.year + '年' + day.month + '月' + day.day + '日 · ' + day.ganzhi + ' · ' + day.lunar;

  const shichen = generateShichenRecommendations(day.ganzhi, AppState.currentAuspiciousXiyong, AppState.selectedEvent);
  const yiji = generateYiJi(AppState.selectedEvent, day.level);

  bodyEl.innerHTML = `
    <div class="aus-detail-sections">
      <div>
        <div class="aus-detail-section-title">推荐时辰</div>
        <div class="aus-shichen-grid">
          ${shichen.map(sc => `
            <div class="aus-shichen-item ${sc.level}">
              <div class="aus-shichen-name">${sc.name}</div>
              <div class="aus-shichen-time">${sc.time}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="aus-detail-section-title">宜忌事项</div>
        <div class="aus-yiji-list">
          <div class="aus-yiji-row">
            <span class="aus-yiji-label yi">宜</span>
            <span>${yiji.yi}</span>
          </div>
          <div class="aus-yiji-row">
            <span class="aus-yiji-label ji">忌</span>
            <span>${yiji.ji}</span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color);">
      <div class="aus-detail-section-title">当日简评</div>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;margin-top:8px;">
        ${day.comment || generateDayComment(day, AppState.selectedEvent)}
      </p>
    </div>
  `;

  detailEl.classList.remove('hidden');
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeAusDayDetail() {
  document.getElementById('ausDayDetail')?.classList.add('hidden');
}

function generateShichenRecommendations(dayGanzhi, xiyongWx, eventType) {
  const scNames = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const scTimes = ['23-1','1-3','3-5','5-7','7-9','9-11','11-13','13-15','15-17','17-19','19-21','21-23'];

  const bestSc = ['寅','卯','午','申'];
  const goodSc = ['辰','巳','酉','戌'];

  return scNames.map((name, i) => {
    let level = 'normal-sc';
    if (bestSc.includes(name)) level = 'best-sc';
    else if (goodSc.includes(name)) level = 'good-sc';
    return { name, time: scTimes[i], level };
  });
}

function generateYiJi(eventType, dayLevel) {
  const yiMap = {
    '婚嫁': '嫁娶、纳采、订盟、祭祀、祈福、求嗣',
    '开业': '开市、交易、立券、纳财、挂匾、祭祀',
    '入宅': '入宅、移徙、安床、开光、祈福、求嗣',
    '出行': '出行、移徙、入宅、嫁娶、开市、交易',
    '签约': '订盟、纳采、嫁娶、开市、交易、立券',
    '开工': '动土、修造、拆卸、起基、入宅、移徙'
  };
  const jiMap = {
    '婚嫁': '安葬、行丧、伐木、作梁',
    '开业': '安葬、行丧、探病、斋醮',
    '入宅': '安葬、行丧、伐木、作梁',
    '出行': '安葬、行丧、伐木、作梁',
    '签约': '安葬、行丧、探病、斋醮',
    '开工': '安葬、行丧、嫁娶、入宅'
  };
  return { yi: yiMap[eventType] || '诸事皆宜', ji: jiMap[eventType] || '诸事不宜' };
}

function generateDayComment(day, eventType) {
  if (day.level === 'best') {
    return '本日为' + day.ganzhi + '，与您的喜用神高度契合，是' + eventType + '的上等吉日。' + (eventType === '婚嫁' ? '新人感情和睦，婚后生活美满。' : eventType === '开业' ? '财运亨通，生意兴隆。' : '诸事顺遂，心想事成。');
  }
  if (day.level === 'auspicious') {
    return '本日为' + day.ganzhi + '，适合' + eventType + '，运势较好，可顺利进行。';
  }
  return '本日为' + day.ganzhi + '，运势平平，' + eventType + '需谨慎，建议选择其他吉日。';
}

// =============================================
// 知识库 增强版
// =============================================

const KNOWLEDGE_ARTICLES_EXTENDED = {
  geju: `
    <div class="knowledge-article">
      <h2>八字格局</h2>
      <div class="knowledge-highlight">
        八字格局是根据日主与其他干支的关系，对命局进行分类的方法。格局决定了一个人的基本命运走向和人生层次。
      </div>
      <h3>正格（普通格局）</h3>
      <div class="geju-grid">
        <div class="geju-card">
          <div class="geju-card-name">正官格</div>
          <span class="geju-card-level upper">上等</span>
          <div class="geju-card-desc">日主身旺，官星清透，主仕途顺畅，有领导才能。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">七杀格</div>
          <span class="geju-card-level middle">中等</span>
          <div class="geju-card-desc">身强杀旺，需食神制杀，主权威魄力，事业有成。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">正印格</div>
          <span class="geju-card-level upper">上等</span>
          <div class="geju-card-desc">日主身弱，印星生扶，主学业有成，贵人相助。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">偏印格</div>
          <span class="geju-card-level middle">中等</span>
          <div class="geju-card-desc">偏印夺食，主聪明独特，适合偏门技艺。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">正财格</div>
          <span class="geju-card-level upper">上等</span>
          <div class="geju-card-desc">日主身旺，财星得用，主财运亨通，勤俭致富。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">偏财格</div>
          <span class="geju-card-level middle">中等</span>
          <div class="geju-card-desc">偏财透干，主意外之财，善于理财投资。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">食神格</div>
          <span class="geju-card-level upper">上等</span>
          <div class="geju-card-desc">食神生财，主才华横溢，口福旺盛，福寿双全。</div>
        </div>
        <div class="geju-card">
          <div class="geju-card-name">伤官格</div>
          <span class="geju-card-level middle">中等</span>
          <div class="geju-card-desc">伤官配印，主聪明创新，艺术气质，独特个性。</div>
        </div>
      </div>
      <h3>特殊格局</h3>
      <table>
        <tr><th>格局</th><th>成格条件</th><th>特点</th></tr>
        <tr><td>从强格</td><td>日主极旺，无克泄</td><td>顺势而为，专旺一方，大富大贵</td></tr>
        <tr><td>从弱格</td><td>日主极弱，无生扶</td><td>弃命从杀/财/儿，成就非凡</td></tr>
        <tr><td>化气格</td><td>天干五合化气成功</td><td>化气清纯，格局极高</td></tr>
        <tr><td>专旺格</td><td>五行专旺一气</td><td>曲直/炎上/稼穑/从革/润下</td></tr>
      </table>
    </div>
  `,
  shengxiao: `
    <div class="knowledge-article">
      <h2>十二生肖</h2>
      <div class="knowledge-highlight">
        十二生肖，又称属相，是中国传统文化中与十二地支相配的十二种动物，每个人出生的年份对应一个生肖。
      </div>
      <div class="shengxiao-grid">
        <div class="sx-card"><div class="sx-emoji">🐭</div><div class="sx-name">鼠</div><div class="sx-zhi">子</div></div>
        <div class="sx-card"><div class="sx-emoji">🐮</div><div class="sx-name">牛</div><div class="sx-zhi">丑</div></div>
        <div class="sx-card"><div class="sx-emoji">🐯</div><div class="sx-name">虎</div><div class="sx-zhi">寅</div></div>
        <div class="sx-card"><div class="sx-emoji">🐰</div><div class="sx-name">兔</div><div class="sx-zhi">卯</div></div>
        <div class="sx-card"><div class="sx-emoji">🐲</div><div class="sx-name">龙</div><div class="sx-zhi">辰</div></div>
        <div class="sx-card"><div class="sx-emoji">🐍</div><div class="sx-name">蛇</div><div class="sx-zhi">巳</div></div>
        <div class="sx-card"><div class="sx-emoji">🐴</div><div class="sx-name">马</div><div class="sx-zhi">午</div></div>
        <div class="sx-card"><div class="sx-emoji">🐑</div><div class="sx-name">羊</div><div class="sx-zhi">未</div></div>
        <div class="sx-card"><div class="sx-emoji">🐵</div><div class="sx-name">猴</div><div class="sx-zhi">申</div></div>
        <div class="sx-card"><div class="sx-emoji">🐔</div><div class="sx-name">鸡</div><div class="sx-zhi">酉</div></div>
        <div class="sx-card"><div class="sx-emoji">🐶</div><div class="sx-name">狗</div><div class="sx-zhi">戌</div></div>
        <div class="sx-card"><div class="sx-emoji">🐷</div><div class="sx-name">猪</div><div class="sx-zhi">亥</div></div>
      </div>
      <h3>生肖配对</h3>
      <table>
        <tr><th>关系</th><th>配对</th><th>说明</th></tr>
        <tr><td>六合</td><td>鼠牛、虎猪、兔狗、龙鸡、蛇猴、马羊</td><td>最佳配对，和谐美满</td></tr>
        <tr><td>三合</td><td>猴鼠龙、虎马狗、蛇鸡牛、猪兔羊</td><td>上等配对，互助互利</td></tr>
        <tr><td>六冲</td><td>鼠马、牛羊、虎猴、兔鸡、龙狗、蛇猪</td><td>相冲相克，需谨慎</td></tr>
        <tr><td>六害</td><td>鼠羊、牛马、虎蛇、兔龙、猴猪、鸡狗</td><td>相害相破，多磨合</td></tr>
      </table>
    </div>
  `,
  nayin: `
    <div class="knowledge-article">
      <h2>纳音五行</h2>
      <div class="knowledge-highlight">
        纳音五行是六十甲子中，每两个干支组合对应一种五行属性，共三十种纳音，用于更细致地分析命局。
      </div>
      <h3>纳音五行表（部分）</h3>
      <div class="nayin-cycle-grid">
        <div class="nayin-item"><span class="nayin-ganzhi">甲子</span><span class="nayin-name">海中金</span><span class="nayin-wx-dot" style="background:#c4a030"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">丙寅</span><span class="nayin-name">炉中火</span><span class="nayin-wx-dot" style="background:#c84a3a"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">戊辰</span><span class="nayin-name">大林木</span><span class="nayin-wx-dot" style="background:#4a8c5a"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">庚午</span><span class="nayin-name">路旁土</span><span class="nayin-wx-dot" style="background:#8a6c40"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">壬申</span><span class="nayin-name">剑锋金</span><span class="nayin-wx-dot" style="background:#c4a030"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">甲戌</span><span class="nayin-name">山头火</span><span class="nayin-wx-dot" style="background:#c84a3a"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">丙子</span><span class="nayin-name">涧下水</span><span class="nayin-wx-dot" style="background:#3a5c8c"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">戊寅</span><span class="nayin-name">城头土</span><span class="nayin-wx-dot" style="background:#8a6c40"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">庚辰</span><span class="nayin-name">白蜡金</span><span class="nayin-wx-dot" style="background:#c4a030"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">壬午</span><span class="nayin-name">杨柳木</span><span class="nayin-wx-dot" style="background:#4a8c5a"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">甲申</span><span class="nayin-name">泉中水</span><span class="nayin-wx-dot" style="background:#3a5c8c"></span></div>
        <div class="nayin-item"><span class="nayin-ganzhi">丙戌</span><span class="nayin-name">屋上土</span><span class="nayin-wx-dot" style="background:#8a6c40"></span></div>
      </div>
      <h3>纳音应用</h3>
      <p>纳音五行主要用于年柱分析，可以辅助判断一个人的先天禀赋、祖业根基、与父母的关系等。在合婚时，纳音相生相合也是重要的参考因素。</p>
    </div>
  `
};

// 搜索知识库
function searchKnowledge(query) {
  if (!query || query.length < 2) {
    initKnowledge();
    return;
  }

  const content = document.getElementById('knowledgeContent');
  if (!content) return;

  const results = [];
  const allArticles = { ...KNOWLEDGE_ARTICLES, ...KNOWLEDGE_ARTICLES_EXTENDED };

  Object.entries(allArticles).forEach(([key, html]) => {
    const text = html.replace(/<[^>]+>/g, '');
    if (text.toLowerCase().includes(query.toLowerCase())) {
      // 找到匹配位置，提取摘要
      const index = text.toLowerCase().indexOf(query.toLowerCase());
      const excerpt = text.substring(Math.max(0, index - 30), Math.min(text.length, index + 60)) + '...';
      const titleMap = {
        'intro': '八字入门', 'tiangan': '天干详解', 'dizhi': '地支详解', 'wuxing': '五行生克',
        'shishen': '十神体系', 'dayun': '大运流年', 'xiyong': '喜用神理论',
        'geju': '八字格局', 'shengxiao': '十二生肖', 'nayin': '纳音五行'
      };
      results.push({ key, title: titleMap[key] || key, excerpt });
    }
  });

  if (results.length === 0) {
    content.innerHTML = '<div class="kb-search-empty">未找到相关内容，请尝试其他关键词</div>';
    return;
  }

  content.innerHTML = `
    <div class="kb-search-result-list">
      ${results.map(r => `
        <div class="kb-search-result-item" onclick="showKnowledge(null,'${r.key}')">
          <div class="kb-result-title">${r.title}</div>
          <div class="kb-result-excerpt">${r.excerpt.replace(new RegExp(query, 'gi'), '<strong style="color:var(--vermilion-500)">$&</strong>')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// 扩展知识库显示
function initKnowledge() {
  showKnowledge(document.querySelector('.sidebar-item.active'), 'intro');
}

function showKnowledge(btn, key) {
  document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('knowledgeContent');
  if (!content) return;

  const allArticles = { ...KNOWLEDGE_ARTICLES, ...KNOWLEDGE_ARTICLES_EXTENDED };
  content.innerHTML = allArticles[key] || '<p>内容加载中...</p>';
}
