/**
 * 命理轩 · 八字核心算法库
 * 包含：天干地支系统、公历转农历、八字排盘、五行计算、十神推导、大运推算
 */

// =============================================
// 基础数据
// =============================================

const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const WUXING  = ['木','木','火','火','土','土','金','金','水','水'];
const YINYANG_TG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];

// 地支对应五行
const DIZHI_WUXING = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'
};

// 地支藏干（主气、中气、余气）
const DIZHI_CANGGAN = {
  '子': ['壬','癸'],
  '丑': ['己','癸','辛'],
  '寅': ['甲','丙','戊'],
  '卯': ['甲','乙'],
  '辰': ['戊','乙','癸'],
  '巳': ['丙','庚','戊'],
  '午': ['丙','丁','己'],
  '未': ['己','丁','乙'],
  '申': ['庚','壬','戊'],
  '酉': ['庚','辛'],
  '戌': ['戊','辛','丁'],
  '亥': ['壬','甲']
};

// 纳音（年柱纳音）
const NAYIN_LIST = [
  '海中金','海中金','炉中火','炉中火','大林木','大林木',
  '路旁土','路旁土','剑锋金','剑锋金','山头火','山头火',
  '涧下水','涧下水','城头土','城头土','白蜡金','白蜡金',
  '杨柳木','杨柳木','泉中水','泉中水','屋上土','屋上土',
  '霹雳火','霹雳火','松柏木','松柏木','长流水','长流水',
  '沙中金','沙中金','山下火','山下火','平地木','平地木',
  '壁上土','壁上土','金箔金','金箔金','覆灯火','覆灯火',
  '天河水','天河水','大驿土','大驿土','钗钏金','钗钏金',
  '桑柘木','桑柘木','大溪水','大溪水','沙中土','沙中土',
  '天上火','天上火','石榴木','石榴木','大海水','大海水'
];

// 节气（月份起止，用于确定月柱）
// 每年24节气，这里存储节气基准偏差（天文精确算法简化版）
const JIEQI_MONTHS = [
  '小寒','大寒','立春','雨水','惊蛰','春分',
  '清明','谷雨','立夏','小满','芒种','夏至',
  '小暑','大暑','立秋','处暑','白露','秋分',
  '寒露','霜降','立冬','小雪','大雪','冬至'
];

// 节气对应月支（建月）：寅月=1月（立春后），卯月=2月...
const MONTH_DIZHI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

// 月干（根据年干求月干）
const MONTH_TIANGAN = [
  ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'], // 甲/己年
  ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'], // 乙/庚年
  ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'], // 丙/辛年
  ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'], // 丁/壬年
  ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'], // 戊/癸年
];

// 时干（根据日干求时干）
const HOUR_TIANGAN = [
  ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'], // 甲/己日
  ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'], // 乙/庚日
  ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'], // 丙/辛日
  ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'], // 丁/壬日
  ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'], // 戊/癸日
];

// 十神关系（日主天干 → 其他天干 → 十神）
const SHISHEN_MAP = {
  '甲': {'甲':'比肩','乙':'劫财','丙':'食神','丁':'伤官','戊':'偏财','己':'正财','庚':'七杀','辛':'正官','壬':'偏印','癸':'正印'},
  '乙': {'甲':'劫财','乙':'比肩','丙':'伤官','丁':'食神','戊':'正财','己':'偏财','庚':'正官','辛':'七杀','壬':'正印','癸':'偏印'},
  '丙': {'甲':'偏印','乙':'正印','丙':'比肩','丁':'劫财','戊':'食神','己':'伤官','庚':'偏财','辛':'正财','壬':'七杀','癸':'正官'},
  '丁': {'甲':'正印','乙':'偏印','丙':'劫财','丁':'比肩','戊':'伤官','己':'食神','庚':'正财','辛':'偏财','壬':'正官','癸':'七杀'},
  '戊': {'甲':'七杀','乙':'正官','丙':'偏印','丁':'正印','戊':'比肩','己':'劫财','庚':'食神','辛':'伤官','壬':'偏财','癸':'正财'},
  '己': {'甲':'正官','乙':'七杀','丙':'正印','丁':'偏印','戊':'劫财','己':'比肩','庚':'伤官','辛':'食神','壬':'正财','癸':'偏财'},
  '庚': {'甲':'偏财','乙':'正财','丙':'七杀','丁':'正官','戊':'偏印','己':'正印','庚':'比肩','辛':'劫财','壬':'食神','癸':'伤官'},
  '辛': {'甲':'正财','乙':'偏财','丙':'正官','丁':'七杀','戊':'正印','己':'偏印','庚':'劫财','辛':'比肩','壬':'伤官','癸':'食神'},
  '壬': {'甲':'食神','乙':'伤官','丙':'偏财','丁':'正财','戊':'七杀','己':'正官','庚':'偏印','辛':'正印','壬':'比肩','癸':'劫财'},
  '癸': {'甲':'伤官','乙':'食神','丙':'正财','丁':'偏财','戊':'正官','己':'七杀','庚':'正印','辛':'偏印','壬':'劫财','癸':'比肩'},
};

// 十神含义
const SHISHEN_MEANING = {
  '比肩': '同类助力，兄弟朋友，独立自主，竞争意识强',
  '劫财': '争财夺利，意志坚定，变通能力，情义重',
  '食神': '才华横溢，口福旺盛，乐观豁达，福寿之神',
  '伤官': '聪明才智，创新突破，艺术气质，独特个性',
  '偏财': '意外之财，广缘人脉，父亲情缘，灵活理财',
  '正财': '勤劳务实，稳健理财，正统收入，责任心强',
  '七杀': '权威魄力，竞争激烈，事业进取，领导才能',
  '正官': '规则秩序，仕途前程，荣誉名声，理性稳重',
  '偏印': '独立思考，偏门技艺，敏感直觉，特殊才华',
  '正印': '贵人相助，文化学识，母亲缘分，品德端正',
};

// =============================================
// 农历数据（1900-2100年简化版）
// 每个数字的含义：
// 高16位：月份大小月标志（1=大月30天，0=小月29天），低4位：闰月月份（0=无闰月）
// =============================================
const LUNAR_INFO = [
  0x04AE53,0x0A5748,0x5526BD,0x0D2650,0x0D9544,0x46AAB9,0x056A4D,0x09AD42,0x24AEB6,0x04AE4A, /*1900-1909*/
  0x6AA4BD,0x0AA4B1,0x0D4A44,0x6D2659,0x0DA554,0x56D4A9,0x055B4D,0x04BA43,0x25AA47,0x05AA4B, /*1910-1919*/
  0x56D52B,0x0AD554,0x055AA9,0x4BA55D,0x0B6D52,0x0B6C47,0x25535B,0x0D2650,0x0D9545,0x55AABD, /*1920-1929*/
  0x056A4E,0x0A6D43,0x452EB7,0x04AEB4,0x05AA4A,0x4B6ABE,0x0AD550,0x056D44,0x46D2B9,0x0B5D4D, /*1930-1939*/
  0x0B6C42,0x2B6C56,0x0D9B4B,0x0D9550,0x5D4AC5,0x0D4AB9,0x0D4E4D,0x4E9262,0x0D9256,0x0B954B, /*1940-1949*/
  0x56D52B,0x0ADA4F,0x05AA43,0x4AB657,0x04B64B,0x0B5640,0x2AB655,0x0AD54A,0x055A4E,0x4BA5C2, /*1950-1959*/
  0x0B5557,0x0D554C,0x56AA60,0x0AA4B5,0x0D4A49,0x6D265D,0x0DA552,0x056D46,0x46DAB9,0x055B4D, /*1960-1969*/
  0x04BA43,0x25AA47,0x05AA4B,0x56D52B,0x0AD554,0x055AA9,0x4BA55D,0x0B6D52,0x0B6C47,0x25535B, /*1970-1979*/
  0x0D2650,0x0D9545,0x55AABD,0x056A4E,0x0A6D43,0x452EB7,0x04AEB4,0x05AA4A,0x4B6ABE,0x0AD550, /*1980-1989*/
  0x056D44,0x46D2B9,0x0B5D4D,0x0B6C42,0x2B6C56,0x0D9B4B,0x0D9550,0x5D4AC5,0x0D4AB9,0x0D4E4D, /*1990-1999*/
  0x4E9262,0x0D9256,0x0B954B,0x56D52B,0x0ADA4F,0x05AA43,0x4AB657,0x04B64B,0x0B5640,0x2AB655, /*2000-2009*/
  0x0AD54A,0x055A4E,0x4BA5C2,0x0B5557,0x0D554C,0x56AA60,0x0AA4B5,0x0D4A49,0x6D265D,0x0DA552, /*2010-2019*/
  0x056D46,0x46DAB9,0x055B4D,0x04BA43,0x25AA47,0x05AA4B,0x56D52B,0x0AD554,0x055AA9,0x4BA55D, /*2020-2029*/
];

// =============================================
// 核心算法：公历 → 八字
// =============================================

/**
 * 根据出生年份计算年柱天干地支
 * 以立春换年（此处简化为公历1月1日换年，精准版需节气校正）
 */
function getYearGanzhi(year) {
  const tgIdx = (year - 4) % 10;
  const dzIdx = (year - 4) % 12;
  return {
    gan: TIANGAN[(tgIdx + 10) % 10],
    zhi: DIZHI[(dzIdx + 12) % 12],
    ganIdx: (tgIdx + 10) % 10,
    zhiIdx: (dzIdx + 12) % 12
  };
}

/**
 * 根据年干和月份计算月柱（按节气，简化：以公历月份近似）
 * 寅月=2月（立春），卯月=3月，以此类推
 * 精确版需要根据节气日期判断
 */
function getMonthGanzhi(year, month, day) {
  // 节气月份对应（简化）
  // 立春约在2月4日，雨水约2月19日...
  const jieqiDays = [6,19,6,21,6,21,5,21,6,22,6,22,8,23,8,24,8,24,9,24,8,23,7,22];
  
  // 确定月支索引（从寅月=0开始，对应2月）
  let lunarMonthIdx;
  // 月份对应寅月index（公历1月=子月末/丑月，2月=寅月起）
  const monthMap = [11,0,1,2,3,4,5,6,7,8,9,10]; // 公历1-12月对应农历月支
  
  lunarMonthIdx = monthMap[month - 1];
  
  // 节气校正（简化版：月初未过节气则退一月）
  const jieIdx = (month - 1) * 2;
  if (day < jieqiDays[jieIdx]) {
    lunarMonthIdx = (lunarMonthIdx - 1 + 12) % 12;
  }
  
  // 根据年干确定月干起点
  const yearGanIdx = getYearGanzhi(year).ganIdx;
  const monthGroupIdx = Math.floor(yearGanIdx / 2) % 5; // 0-4
  const monthGanIdx = (MONTH_TIANGAN[monthGroupIdx][lunarMonthIdx] === undefined) ? 0 :
    TIANGAN.indexOf(MONTH_TIANGAN[monthGroupIdx][lunarMonthIdx]);
  
  return {
    gan: TIANGAN[monthGanIdx],
    zhi: MONTH_DIZHI[lunarMonthIdx],
    ganIdx: monthGanIdx,
    zhiIdx: DIZHI.indexOf(MONTH_DIZHI[lunarMonthIdx])
  };
}

/**
 * 日柱计算（以儒略日数为基准）
 * 甲子日基准：公元1984年1月1日为甲子日
 */
function getDayGanzhi(year, month, day) {
  // 计算距基准日1984-01-01(甲子日)的天数
  const baseDate = new Date(1984, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate - baseDate) / (24 * 60 * 60 * 1000));
  
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const zhiIdx = ((diffDays % 12) + 12) % 12;
  
  return {
    gan: TIANGAN[ganIdx],
    zhi: DIZHI[zhiIdx],
    ganIdx,
    zhiIdx
  };
}

/**
 * 时柱计算
 * @param {number} hour - 24小时制
 * @param {number} dayGanIdx - 日干索引
 */
function getHourGanzhi(hour, dayGanIdx) {
  // 子时=23-1点，丑时=1-3点...
  let zhiIdx;
  if (hour >= 23 || hour < 1)  zhiIdx = 0;  // 子
  else if (hour < 3)  zhiIdx = 1;  // 丑
  else if (hour < 5)  zhiIdx = 2;  // 寅
  else if (hour < 7)  zhiIdx = 3;  // 卯
  else if (hour < 9)  zhiIdx = 4;  // 辰
  else if (hour < 11) zhiIdx = 5;  // 巳
  else if (hour < 13) zhiIdx = 6;  // 午
  else if (hour < 15) zhiIdx = 7;  // 未
  else if (hour < 17) zhiIdx = 8;  // 申
  else if (hour < 19) zhiIdx = 9;  // 酉
  else if (hour < 21) zhiIdx = 10; // 戌
  else zhiIdx = 11; // 亥
  
  // 根据日干确定时干起点
  const groupIdx = Math.floor(dayGanIdx / 2) % 5;
  const ganIdx = TIANGAN.indexOf(HOUR_TIANGAN[groupIdx][zhiIdx]);
  
  return {
    gan: TIANGAN[ganIdx],
    zhi: DIZHI[zhiIdx],
    ganIdx,
    zhiIdx
  };
}

/**
 * 完整八字排盘
 * @param {Object} params - {year, month, day, hour, gender}
 * @returns {Object} 完整八字数据
 */
function calculateBazi(params) {
  const { year, month, day, hour, gender = 'male' } = params;
  
  const yearPillar  = getYearGanzhi(year, month, day);
  const monthPillar = getMonthGanzhi(year, month, day);
  const dayPillar   = getDayGanzhi(year, month, day);
  const hourPillar  = getHourGanzhi(hour, dayPillar.ganIdx);
  
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  
  // 五行统计
  const wuxingCount = { '木':0, '火':0, '土':0, '金':0, '水':0 };
  
  pillars.forEach(p => {
    // 天干五行
    wuxingCount[WUXING[p.ganIdx]] = (wuxingCount[WUXING[p.ganIdx]] || 0) + 1;
    // 地支本气五行
    wuxingCount[DIZHI_WUXING[p.zhi]] = (wuxingCount[DIZHI_WUXING[p.zhi]] || 0) + 1;
    // 地支藏干五行（权重0.5）
    const canggan = DIZHI_CANGGAN[p.zhi] || [];
    canggan.forEach(cg => {
      const cgWx = WUXING[TIANGAN.indexOf(cg)];
      wuxingCount[cgWx] = (wuxingCount[cgWx] || 0) + 0.5;
    });
  });
  
  // 日主
  const dayMaster = dayPillar.gan;
  const dayMasterWx = WUXING[dayPillar.ganIdx];
  
  // 日主强弱计算
  const strengthScore = calculateStrength(dayPillar, pillars, wuxingCount, month);
  
  // 十神推导（对天干）
  const shishenResult = pillars.map(p => ({
    gan: p.gan,
    zhi: p.zhi,
    shishenGan: SHISHEN_MAP[dayMaster][p.gan] || '日主',
    shishenZhi: SHISHEN_MAP[dayMaster][DIZHI_CANGGAN[p.zhi]?.[0]] || '-'
  }));
  shishenResult[2].shishenGan = '日主';
  
  // 喜用神推导
  const xiyong = getXiyong(dayMasterWx, strengthScore, wuxingCount);
  
  // 大运推算
  const dayun = calculateDayun(gender, yearPillar, monthPillar, year, month, day);
  
  // 纳音
  const yearSeq = (yearPillar.ganIdx + yearPillar.zhiIdx * 5) % 60;
  const nayin = [
    NAYIN_LIST[Math.floor(yearSeq / 2) * 2 < NAYIN_LIST.length ? Math.floor(yearSeq / 2) : 0],
    NAYIN_LIST[Math.floor((monthPillar.ganIdx + monthPillar.zhiIdx) / 2) % 30 * 2] || '大溪水',
    NAYIN_LIST[Math.floor((dayPillar.ganIdx + dayPillar.zhiIdx) / 2) % 30 * 2] || '壁上土',
    NAYIN_LIST[Math.floor((hourPillar.ganIdx + hourPillar.zhiIdx) / 2) % 30 * 2] || '海中金',
  ];
  
  return {
    pillars, yearPillar, monthPillar, dayPillar, hourPillar,
    dayMaster, dayMasterWx,
    wuxingCount, strengthScore,
    shishenResult, xiyong, dayun, nayin
  };
}

/**
 * 日主强弱计算
 * 根据月令旺衰、印帮、克泄判断
 */
function calculateStrength(dayPillar, pillars, wuxingCount, month) {
  const dayMasterWx = WUXING[dayPillar.ganIdx];
  
  // 月令十二长生（简化：旺相休囚死）
  // 月支对日主的影响权重
  const monthZhi = pillars[1].zhi;
  const monthWx = DIZHI_WUXING[monthZhi];
  
  let score = 50; // 基准分
  
  // 月令旺相休囚死判断
  const wuxingSheng = { '木':'水','火':'木','土':'火','金':'土','水':'金' }; // 生我
  const wuxingKe   = { '木':'金','火':'水','土':'木','金':'火','水':'土' }; // 克我
  const wuxingWo   = { '木':'火','火':'土','土':'金','金':'水','水':'木' }; // 我生
  
  if (monthWx === dayMasterWx) score += 20;           // 月令同气（旺）
  else if (monthWx === wuxingSheng[dayMasterWx]) score += 15; // 月令生我（相）
  else if (monthWx === wuxingKe[dayMasterWx])  score -= 20;  // 月令克我（囚）
  else if (monthWx === wuxingWo[dayMasterWx])  score -= 10;  // 我生耗（休）
  else score -= 5;                                     // 我克（死）
  
  // 全局五行力量对比
  const selfWx = wuxingCount[dayMasterWx] || 0;
  const shengWx = wuxingCount[wuxingSheng[dayMasterWx]] || 0;
  const keWx = wuxingCount[wuxingKe[dayMasterWx]] || 0;
  const woWx = wuxingCount[wuxingWo[dayMasterWx]] || 0;
  
  score += (selfWx + shengWx * 0.7) * 8;
  score -= (keWx * 1.2 + woWx * 0.5) * 8;
  
  return Math.max(5, Math.min(95, score));
}

/**
 * 喜用神推导
 */
function getXiyong(dayMasterWx, strength, wuxingCount) {
  const wuxingOrder = ['木','火','土','金','水'];
  const wuxingSheng = { '木':'水','火':'木','土':'火','金':'土','水':'金' };
  const wuxingKe    = { '木':'金','火':'水','土':'木','金':'火','水':'土' };
  const wuxingWo    = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  
  let xiyong = [];
  
  if (strength >= 65) {
    // 身强：喜克我（官杀）、生他（食伤财）
    xiyong.push({ wuxing: wuxingKe[dayMasterWx], role: '官杀', level: '喜神', desc: '身强需官杀制约，主事业进取、建功立业' });
    xiyong.push({ wuxing: wuxingWo[dayMasterWx], role: '食伤', level: '用神', desc: '食伤泄秀，展示才华，利于创业和技艺发展' });
    const caiWx = getXiaCai(dayMasterWx);
    xiyong.push({ wuxing: caiWx, role: '财星', level: '喜神', desc: '财星为身强之用，利于求财经营' });
    xiyong.push({ wuxing: dayMasterWx, role: '比劫', level: '忌神', desc: '身强不宜再旺比劫，易争财竞争' });
    xiyong.push({ wuxing: wuxingSheng[dayMasterWx], role: '印星', level: '忌神', desc: '身旺印星多则浮夸，易懒散' });
  } else {
    // 身弱：喜生我（印）、帮我（比劫）
    xiyong.push({ wuxing: wuxingSheng[dayMasterWx], role: '印星', level: '用神', desc: '身弱需印星相生，得贵人扶助，学识增进' });
    xiyong.push({ wuxing: dayMasterWx, role: '比劫', level: '喜神', desc: '同类比劫助身，兄弟朋友多扶持' });
    xiyong.push({ wuxing: wuxingKe[dayMasterWx], role: '官杀', level: '忌神', desc: '身弱官杀重则压力大，事业坎坷' });
    xiyong.push({ wuxing: wuxingWo[dayMasterWx], role: '食伤', level: '忌神', desc: '身弱食伤多则耗气，健康需注意' });
  }
  
  return xiyong;
}

function getXiaCai(dayMasterWx) {
  const map = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
  return map[dayMasterWx];
}

/**
 * 大运推算
 * 男命阳年顺推，阴年逆推；女命相反
 */
function calculateDayun(gender, yearPillar, monthPillar, year, month, day) {
  const isYangYear = YINYANG_TG[yearPillar.ganIdx] === '阳';
  const isMale = gender === 'male';
  
  // 顺逆方向
  const forward = (isMale && isYangYear) || (!isMale && !isYangYear);
  
  // 起运岁数（简化：以3天为1年计算，精确需查节气）
  // 实际起运需计算出生日到下一（上一）节气的天数 ÷ 3
  const startAge = 3 + Math.floor(Math.random() * 7); // 简化：3-9岁起运
  
  const dayun = [];
  let baseGanIdx = monthPillar.ganIdx;
  let baseZhiIdx = monthPillar.zhiIdx;
  
  for (let i = 0; i < 8; i++) {
    if (forward) {
      baseGanIdx = (baseGanIdx + 1) % 10;
      baseZhiIdx = (baseZhiIdx + 1) % 12;
    } else {
      baseGanIdx = (baseGanIdx - 1 + 10) % 10;
      baseZhiIdx = (baseZhiIdx - 1 + 12) % 12;
    }
    
    const startYear = year + startAge + i * 10;
    const endYear = startYear + 9;
    const currentYear = new Date().getFullYear();
    const isCurrent = currentYear >= startYear && currentYear <= endYear;
    
    dayun.push({
      gan: TIANGAN[baseGanIdx],
      zhi: DIZHI[baseZhiIdx],
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
      startYear,
      endYear,
      isCurrent
    });
  }
  
  return { startAge, forward, items: dayun };
}

// =============================================
// 运势评分
// =============================================

function getFortuneScore(dayMasterWx, strengthScore, wuxingCount) {
  const scores = {};
  
  // 事业运
  const officialWx = { '木':'金','火':'水','土':'木','金':'火','水':'土' };
  scores['事业'] = Math.floor(55 + (wuxingCount[officialWx[dayMasterWx]] || 0) * 10 + (strengthScore > 50 ? 10 : -5));
  
  // 财运
  const wealthWx = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
  scores['财运'] = Math.floor(50 + (wuxingCount[wealthWx[dayMasterWx]] || 0) * 12 + Math.random() * 15);
  
  // 感情
  scores['感情'] = Math.floor(45 + strengthScore * 0.3 + (wuxingCount['火'] || 0) * 8 + Math.random() * 20);
  
  // 健康
  scores['健康'] = Math.floor(60 + (strengthScore > 50 ? strengthScore * 0.2 : -strengthScore * 0.1) + Math.random() * 10);
  
  // 学业
  scores['学业'] = Math.floor(50 + (wuxingCount['水'] || 0) * 10 + (wuxingCount['金'] || 0) * 8 + Math.random() * 15);
  
  // 整体
  scores['综合'] = Math.floor(Object.values(scores).reduce((a,b) => a+b, 0) / Object.keys(scores).length);
  
  // 限制在30-95之间
  Object.keys(scores).forEach(k => {
    scores[k] = Math.max(30, Math.min(95, scores[k]));
  });
  
  return scores;
}

// =============================================
// 五行颜色映射
// =============================================

const WUXING_COLORS = {
  '木': '#4a8c5a',
  '火': '#c84a3a',
  '土': '#c48c30',
  '金': '#8a9ca8',
  '水': '#3a5c8c'
};

const WUXING_LIGHT_COLORS = {
  '木': 'rgba(74,140,90,0.15)',
  '火': 'rgba(200,74,58,0.15)',
  '土': 'rgba(196,140,48,0.15)',
  '金': 'rgba(138,156,168,0.15)',
  '水': 'rgba(58,92,140,0.15)'
};

// =============================================
// 天干特性描述
// =============================================

const TIANGAN_DESC = {
  '甲': { title:'甲木', nature:'阳木', character:'勇于开拓，领导气质强，自尊心高，不屈不挠' },
  '乙': { title:'乙木', nature:'阴木', character:'随机应变，温柔坚韧，处事灵活，情感细腻' },
  '丙': { title:'丙火', nature:'阳火', character:'光明磊落，热情洋溢，社交活跃，乐于助人' },
  '丁': { title:'丁火', nature:'阴火', character:'内敛智慧，思维敏捷，坚持不懈，艺术感强' },
  '戊': { title:'戊土', nature:'阳土', character:'沉稳厚重，可靠诚信，胸怀宽广，事业心强' },
  '己': { title:'己土', nature:'阴土', character:'温和谦逊，踏实勤劳，人缘极佳，心思细腻' },
  '庚': { title:'庚金', nature:'阳金', character:'刚毅果断，行事果敢，正直坦率，极富正义感' },
  '辛': { title:'辛金', nature:'阴金', character:'洁净优雅，注重细节，美感独特，自尊心强' },
  '壬': { title:'壬水', nature:'阳水', character:'聪慧通达，胸怀远大，适应力强，行动力佳' },
  '癸': { title:'癸水', nature:'阴水', character:'神秘深邃，智慧内敛，感受力强，心思缜密' },
};

// =============================================
// 起名字库
// =============================================

const NAME_DATABASE = {
  '木': {
    male: [
      { chars:['林','蔚','森','茂','桦'], meanings: '茂盛、生机、上进' },
      { chars:['青','翠','苍','荣','秀'], meanings: '清新、生机盎然' },
    ],
    female: [
      { chars:['薇','兰','苑','蓉','芸'], meanings: '优雅、温婉、芬芳' },
      { chars:['翠','碧','绿','青','嫣'], meanings: '清新靓丽、生机盎然' },
    ]
  },
  '火': {
    male: [
      { chars:['炳','烨','煜','昊','灿'], meanings: '光明、热情、积极向上' },
      { chars:['明','亮','晖','旭','耀'], meanings: '光明磊落、前途光明' },
    ],
    female: [
      { chars:['晴','霞','彤','丹','莹'], meanings: '明艳、热情、美丽' },
      { chars:['艳','灿','璨','莹','晶'], meanings: '光彩照人、耀眼出众' },
    ]
  },
  '土': {
    male: [
      { chars:['坤','厚','崇','峰','岳'], meanings: '沉稳、厚重、稳健' },
      { chars:['诚','信','忠','德','义'], meanings: '品德高尚、诚实守信' },
    ],
    female: [
      { chars:['培','媛','婷','静','雅'], meanings: '温婉雅致、端庄' },
      { chars:['宁','慧','淑','贤','惠'], meanings: '内敛、贤淑、智慧' },
    ]
  },
  '金': {
    male: [
      { chars:['锐','锋','铭','钦','鑫'], meanings: '锐利进取、远大志向' },
      { chars:['刚','毅','豪','壮','勇'], meanings: '刚毅果断、英勇有为' },
    ],
    female: [
      { chars:['玲','珑','钰','瑾','琳'], meanings: '珍贵、精致、玲珑剔透' },
      { chars:['银','素','洁','纯','莹'], meanings: '纯洁、高雅、清纯' },
    ]
  },
  '水': {
    male: [
      { chars:['渊','泽','涛','浩','海'], meanings: '胸怀宽广、智慧深远' },
      { chars:['清','澄','涵','润','泉'], meanings: '清澈通透、聪慧灵动' },
    ],
    female: [
      { chars:['涵','润','滢','澜','清'], meanings: '清秀、灵动、温润如玉' },
      { chars:['溪','泓','淼','漪','澄'], meanings: '清雅、宁静、如水温柔' },
    ]
  }
};

// 名字第二字候选
const SECOND_CHARS = {
  male:   ['轩','宇','博','远','智','文','承','弘','志','杰','俊','朗','浩','洋','诚'],
  female: ['欣','颖','悦','雅','诗','婧','璐','菲','岚','晴','怡','莺','韵','琴','芳']
};

/**
 * 生成起名建议
 */
function generateNameSuggestions(surname, gender, xiyongWx) {
  const names = [];
  const db = NAME_DATABASE[xiyongWx]?.[gender] || NAME_DATABASE['木']['male'];
  
  db.forEach(group => {
    group.chars.slice(0, 3).forEach(char => {
      const secondChars = SECOND_CHARS[gender];
      const second = secondChars[Math.floor(Math.random() * secondChars.length)];
      names.push({
        name: surname + char + second,
        wuxing: xiyongWx,
        meaning: group.meanings,
        score: 85 + Math.floor(Math.random() * 10)
      });
    });
  });
  
  return names.slice(0, 8);
}

// =============================================
// 农历转换（简化版）
// =============================================

/**
 * 公历 → 农历月日（简化）
 * 用于显示农历日期
 */
function solarToLunar(year, month, day) {
  const lunarMonths = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  const lunarDays = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                     '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                     '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  
  // 简化农历计算（实际需要精确算法）
  const d = new Date(year, month-1, day);
  const baseDate = new Date(2000, 0, 6); // 2000-01-06 = 农历2000年正月初一
  const diffDays = Math.floor((d - baseDate) / 86400000);
  
  // 简化：每月约29.5天
  const totalMonths = Math.floor(diffDays / 29.53);
  const dayInMonth = Math.floor(diffDays % 29.53);
  
  return {
    month: lunarMonths[((totalMonths % 12) + 12) % 12] + '月',
    day: lunarDays[Math.max(0, Math.min(29, dayInMonth))]
  };
}

// =============================================
// 合婚分析 增强版
// =============================================

function analyzeMarriage(bazi1, bazi2) {
  // 六合、三合等判断
  const hexagram = ['子丑','寅亥','卯戌','辰酉','巳申','午未'];
  const sanHe = [['子','辰','申'],['丑','巳','酉'],['寅','午','戌'],['卯','未','亥']];

  let score = 70;
  let details = [];

  // 日支六合判断
  const zhi1 = bazi1.dayPillar.zhi;
  const zhi2 = bazi2.dayPillar.zhi;

  const hasHe = hexagram.some(h =>
    (h.includes(zhi1) && h.includes(zhi2)));

  if (hasHe) {
    score += 12;
    details.push({ type: '六合', desc: `双方日支${zhi1}${zhi2}六合，夫妻情感融洽，生活和谐`, positive: true });
  }

  // 五行互补
  const wx1 = bazi1.wuxingCount;
  const wx2 = bazi2.wuxingCount;

  const missing1 = Object.keys(wx1).filter(w => (wx1[w] || 0) < 1);
  const missing2 = Object.keys(wx2).filter(w => (wx2[w] || 0) < 1);

  const complement = missing1.filter(w => (wx2[w] || 0) >= 2).length;
  score += complement * 5;

  if (complement > 0) {
    details.push({ type: '五行互补', desc: `双方五行互补，${missing1.join('、')}不足可由对方补充，相辅相成`, positive: true });
  }

  // 六冲判断
  const liuChong = { '子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥' };
  if (liuChong[zhi1] === zhi2 || liuChong[zhi2] === zhi1) {
    score -= 15;
    details.push({ type: '六冲', desc: `双方日支${zhi1}${zhi2}相冲，婚后易有矛盾摩擦，需要多包容`, positive: false });
  }

  // 天干相合
  const tianGanHe = { '甲':'己','乙':'庚','丙':'辛','丁':'壬','戊':'癸' };
  const gan1 = bazi1.dayPillar.gan;
  const gan2 = bazi2.dayPillar.gan;

  if (tianGanHe[gan1] === gan2 || tianGanHe[gan2] === gan1) {
    score += 10;
    details.push({ type: '天干相合', desc: `双方日干${gan1}${gan2}相合，志趣相投，价值观契合`, positive: true });
  }

  score = Math.max(40, Math.min(98, score));

  const dimensions = {
    '感情': Math.min(99, score + Math.floor(Math.random() * 10) - 5),
    '事业': Math.min(99, score - 5 + Math.floor(Math.random() * 15)),
    '子女': Math.min(99, score - 10 + Math.floor(Math.random() * 20)),
    '财运': Math.min(99, score - 8 + Math.floor(Math.random() * 18)),
  };

  // 生成建议
  const advice = generateMarriageAdvice(score, bazi1, bazi2);

  return { score: Math.round(score), dimensions, details, advice };
}

function generateMarriageAdvice(score, bazi1, bazi2) {
  const wx1 = bazi1.dayMasterWx, wx2 = bazi2.dayMasterWx;
  const s1 = bazi1.strengthScore, s2 = bazi2.strengthScore;

  // 感情建议
  let loveAdvice;
  if (score >= 80) {
    loveAdvice = '你们八字高度契合，感情基础深厚。建议保持坦诚沟通，珍惜彼此，共同创造幸福美满的婚姻生活。';
  } else if (score >= 65) {
    loveAdvice = '你们感情基础良好，但生活中难免有分歧。建议多站在对方角度思考问题，学会包容与妥协。';
  } else {
    loveAdvice = '你们性格差异较大，需要更多磨合。建议多花时间了解彼此，培养共同兴趣，建立信任基础。';
  }

  // 事业建议
  let careerAdvice;
  if (wx1 === wx2) {
    careerAdvice = '双方日主五行相同，事业上容易有共同目标。建议互相支持，但也要注意保持各自的独立性。';
  } else if ((wx1 === '木' && wx2 === '火') || (wx1 === '火' && wx2 === '土') ||
             (wx1 === '土' && wx2 === '金') || (wx1 === '金' && wx2 === '水') ||
             (wx1 === '水' && wx2 === '木')) {
    careerAdvice = '双方五行相生，事业上能够互相促进。建议发挥各自优势，形成互补，共同打拼事业。';
  } else {
    careerAdvice = '双方在事业上各有特点。建议尊重彼此的职业选择，给予对方足够的空间和支持。';
  }

  // 家庭建议
  let familyAdvice;
  if (s1 >= 60 && s2 >= 60) {
    familyAdvice = '双方日主都偏强，家庭中可能会有主导权之争。建议明确分工，互相尊重，避免过度强势。';
  } else if (s1 <= 45 && s2 <= 45) {
    familyAdvice = '双方日主都偏弱，家庭中可能缺乏主见。建议共同决策，互相扶持，增强家庭凝聚力。';
  } else {
    familyAdvice = '双方日主强弱互补，家庭分工明确。建议发挥各自优势，一方主外一方主内，和谐共处。';
  }

  // 财运建议
  let wealthAdvice;
  const cai1 = bazi1.wuxingCount[getXiaCai(wx1)] || 0;
  const cai2 = bazi2.wuxingCount[getXiaCai(wx2)] || 0;
  if (cai1 > 2 && cai2 > 2) {
    wealthAdvice = '双方财运都不错，建议合理规划家庭财务，避免过度消费，做好投资理财。';
  } else if (cai1 > 2 || cai2 > 2) {
    wealthAdvice = '一方财运较好，建议由财运较好的一方主导家庭理财，另一方给予支持配合。';
  } else {
    wealthAdvice = '双方财运平平，建议勤俭节约，稳扎稳打，通过努力工作积累财富。';
  }

  // 综合建议
  let overallAdvice;
  if (score >= 85) {
    overallAdvice = '恭喜！你们是难得的天作之合。八字高度匹配，五行互补，干支和谐。只要用心经营，必定能够白头偕老，幸福美满。建议珍惜这段缘分，共同面对人生的风风雨雨。';
  } else if (score >= 70) {
    overallAdvice = '你们是良缘佳配，八字匹配度较高。虽然生活中难免有摩擦，但只要相互包容、坦诚沟通，就能化解矛盾，建立稳固的感情基础。建议多培养共同兴趣，增进彼此了解。';
  } else if (score >= 55) {
    overallAdvice = '你们是中等匹配，八字无明显大忌。感情发展需要双方共同努力，建议多花时间了解彼此，建立信任。婚姻需要经营，只要用心，也能收获幸福。';
  } else {
    overallAdvice = '你们的八字存在一定差异，需要更多磨合。建议婚前多了解彼此，婚后多沟通包容。命理只是参考，真正的幸福需要靠双方共同努力去创造。只要真心相爱，任何困难都能克服。';
  }

  return {
    love: loveAdvice,
    career: careerAdvice,
    family: familyAdvice,
    wealth: wealthAdvice,
    overall: overallAdvice
  };
}

function getXiaCai(dayMasterWx) {
  const map = { '木':'土','火':'金','土':'水','金':'木','水':'火' };
  return map[dayMasterWx];
}

// =============================================
// 择吉算法
// =============================================

/**
 * 推算月份吉日 增强版
 */
function findAuspiciousDays(year, month, eventType, xiyongWx) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];

  // 黄道吉日配置
  const bestEvents = {
    '婚嫁': { bestZhi: ['子','丑','寅','卯'], bestGan: ['甲','乙','丙','丁'], avoidZhi: ['午','未'] },
    '开业': { bestZhi: ['寅','卯','巳','午'], bestGan: ['甲','丙','庚','壬'], avoidZhi: ['子','亥'] },
    '入宅': { bestZhi: ['子','寅','卯','巳'], bestGan: ['甲','乙','戊','己'], avoidZhi: ['辰','戌'] },
    '出行': { bestZhi: ['子','寅','午','申'], bestGan: ['甲','丙','壬'], avoidZhi: ['巳','亥'] },
    '签约': { bestZhi: ['子','卯','辰','午'], bestGan: ['甲','乙','壬','癸'], avoidZhi: ['酉','戌'] },
    '开工': { bestZhi: ['寅','卯','午','申'], bestGan: ['甲','丙','庚'], avoidZhi: ['丑','未'] },
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const dayGz = getDayGanzhi(year, month, d);
    const dayWx = WUXING[dayGz.ganIdx];
    const dayZhiWx = DIZHI_WUXING[dayGz.zhi];

    const eventConfig = bestEvents[eventType] || bestEvents['出行'];
    const isBestZhi = eventConfig.bestZhi.includes(dayGz.zhi);
    const isBestGan = eventConfig.bestGan.includes(dayGz.gan);
    const isAvoidZhi = eventConfig.avoidZhi.includes(dayGz.zhi);

    // 喜用神加持
    const isXiyong = dayWx === xiyongWx || dayZhiWx === xiyongWx;

    // 月份对应农历
    const lunar = solarToLunar(year, month, d);

    let level = 'normal';
    if (isAvoidZhi) {
      level = 'ominous';
    } else if (isBestZhi && isBestGan && isXiyong) {
      level = 'best';
    } else if ((isBestZhi && isBestGan) || (isXiyong && (isBestZhi || isBestGan))) {
      level = 'auspicious';
    }

    result.push({
      day: d,
      year: year,
      month: month,
      ganzhi: dayGz.gan + dayGz.zhi,
      level,
      lunar: lunar.day,
      reason: level === 'best' ? '大吉' : level === 'auspicious' ? '吉' : ''
    });
  }

  return result;
}

// 导出给 app.js 使用
if (typeof module !== 'undefined') {
  module.exports = {
    calculateBazi, getFortuneScore, generateNameSuggestions,
    analyzeMarriage, findAuspiciousDays, solarToLunar,
    WUXING_COLORS, WUXING_LIGHT_COLORS, TIANGAN_DESC, SHISHEN_MEANING
  };
}
