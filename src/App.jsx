import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

// ── 샘플 데이터 (실제 데이터 연동 전 데모용) ──────────────────────────
// 오늘 날짜 기준으로 상대적인 날짜 생성 (필터가 정상 동작하도록)
function daysAgo(n, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 19);
}

const ALL_SAMPLE_ARTICLES = [
  // 오늘 (7건)
  { title: "방탄소년단 진, 솔로 월드투어 20만 동원", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "이수민", views: 98200, shares: 4300, collected_at: daysAgo(0, 7) },
  { title: "아이브, 日 오리콘 차트 1위 달성", url: "#", category: "뮤직", matched_keywords: ["아이브"], journalist: "정다연", views: 75400, shares: 3100, collected_at: daysAgo(0, 8) },
  { title: "세븐틴 새 앨범 티저 공개, 팬덤 폭발적 반응", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "조나연", views: 61000, shares: 2700, collected_at: daysAgo(0, 9) },
  { title: "에스파 카리나, 글로벌 브랜드 캠페인 메인 발탁", url: "#", category: "연예가화제", matched_keywords: ["에스파"], journalist: "이민경", views: 54300, shares: 2200, collected_at: daysAgo(0, 10) },
  { title: "하이브, 상반기 글로벌 투어 일정 공개", url: "#", category: "엔터비즈", matched_keywords: ["하이브", "BTS"], journalist: "이수민", views: 47800, shares: 1900, collected_at: daysAgo(0, 11) },
  { title: "뉴진스, 일본 데뷔 싱글 오리콘 정상", url: "#", category: "뮤직", matched_keywords: ["뉴진스"], journalist: "태유나", views: 43200, shares: 1700, collected_at: daysAgo(0, 14) },
  { title: "JYP 신인 걸그룹, 데뷔 쇼케이스 전석 매진", url: "#", category: "연예가화제", matched_keywords: ["JYP"], journalist: "박서진", views: 38900, shares: 1500, collected_at: daysAgo(0, 16) },

  // 1일 전 (6건)
  { title: "BTS 제이홉, 군 전역 후 첫 공식 스케줄 확정", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "조나연", views: 112000, shares: 5800, collected_at: daysAgo(1, 8) },
  { title: "블랙핑크 제니, 솔로 앨범 글로벌 차트 석권", url: "#", category: "뮤직", matched_keywords: ["블랙핑크"], journalist: "이수민", views: 88500, shares: 4100, collected_at: daysAgo(1, 9) },
  { title: "장원영, 글로벌 브랜드 앰배서더 추가 선정", url: "#", category: "연예가화제", matched_keywords: ["아이브"], journalist: "이민경", views: 67300, shares: 3200, collected_at: daysAgo(1, 11) },
  { title: "스트레이키즈, 월드투어 추가 공연 확정", url: "#", category: "뮤직", matched_keywords: ["스트레이키즈"], journalist: "태유나", views: 55900, shares: 2600, collected_at: daysAgo(1, 13) },
  { title: "SM엔터, 상반기 신규 아티스트 데뷔 계획 발표", url: "#", category: "엔터비즈", matched_keywords: ["SM"], journalist: "박서진", views: 41200, shares: 1800, collected_at: daysAgo(1, 15) },
  { title: "아이들 신곡 MV, 24시간 1000만뷰 돌파", url: "#", category: "뮤직", matched_keywords: ["아이들"], journalist: "이소정", views: 36700, shares: 1600, collected_at: daysAgo(1, 17) },

  // 2일 전 (5건)
  { title: "하이브, BTS 신규 프로젝트 발표 예고", url: "#", category: "엔터비즈", matched_keywords: ["BTS", "하이브"], journalist: "이수민", views: 95400, shares: 4700, collected_at: daysAgo(2, 9) },
  { title: "세븐틴, 북미 스타디움 투어 전석 매진", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "조나연", views: 78200, shares: 3500, collected_at: daysAgo(2, 10) },
  { title: "에스파 윈터, 드라마 OST 참여 확정", url: "#", category: "드라마예능", matched_keywords: ["에스파"], journalist: "정다연", views: 52100, shares: 2300, collected_at: daysAgo(2, 12) },
  { title: "YG엔터, 블랙핑크 재계약 협상 진행 중", url: "#", category: "엔터비즈", matched_keywords: ["YG", "블랙핑크"], journalist: "이수민", views: 48700, shares: 2100, collected_at: daysAgo(2, 14) },
  { title: "뉴진스 컴백 일정 공식 발표", url: "#", category: "뮤직", matched_keywords: ["뉴진스"], journalist: "이소정", views: 44300, shares: 2000, collected_at: daysAgo(2, 16) },

  // 3일 전 (5건)
  { title: "BTS RM, 솔로 콘서트 전석 매진 기록", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "정다연", views: 87600, shares: 4200, collected_at: daysAgo(3, 8) },
  { title: "아이브 원영, 드라마 주연 캐스팅 확정", url: "#", category: "드라마예능", matched_keywords: ["아이브"], journalist: "이소정", views: 71500, shares: 3300, collected_at: daysAgo(3, 10) },
  { title: "카카오엔터, 글로벌 IP 사업 확장 발표", url: "#", category: "엔터비즈", matched_keywords: ["카카오"], journalist: "박서진", views: 39800, shares: 1700, collected_at: daysAgo(3, 13) },
  { title: "세븐틴 호시, 자작곡으로 음원차트 진입", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "태유나", views: 58300, shares: 2800, collected_at: daysAgo(3, 15) },
  { title: "스트레이키즈 방찬, 美 음악 매체 인터뷰 화제", url: "#", category: "연예가화제", matched_keywords: ["스트레이키즈"], journalist: "이민경", views: 46100, shares: 2100, collected_at: daysAgo(3, 17) },

  // 4일 전 (4건)
  { title: "에스파, 신보 발매 첫날 100만장 돌파", url: "#", category: "뮤직", matched_keywords: ["에스파"], journalist: "정다연", views: 93200, shares: 4600, collected_at: daysAgo(4, 9) },
  { title: "블랙핑크 리사, 솔로 월드투어 추가 도시 발표", url: "#", category: "뮤직", matched_keywords: ["블랙핑크"], journalist: "조나연", views: 81400, shares: 3900, collected_at: daysAgo(4, 11) },
  { title: "JYP, 2분기 실적 시장 예상 상회", url: "#", category: "엔터비즈", matched_keywords: ["JYP"], journalist: "이수민", views: 35600, shares: 1400, collected_at: daysAgo(4, 14) },
  { title: "뉴진스 민지, 파리 패션위크 참석", url: "#", category: "연예가화제", matched_keywords: ["뉴진스"], journalist: "이민경", views: 62700, shares: 3100, collected_at: daysAgo(4, 16) },

  // 5일 전 (4건)
  { title: "세븐틴, 한국 가수 최초 웸블리 단독 공연 확정", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "태유나", views: 104500, shares: 5200, collected_at: daysAgo(5, 9) },
  { title: "BTS 슈가, 솔로 투어 전 세계 반응 화제", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "이소정", views: 89300, shares: 4400, collected_at: daysAgo(5, 11) },
  { title: "SM엔터, 2분기 실적 전망 상향", url: "#", category: "엔터비즈", matched_keywords: ["SM"], journalist: "박서진", views: 33400, shares: 1200, collected_at: daysAgo(5, 14) },
  { title: "아이들, 유럽 투어 전석 매진 기록", url: "#", category: "뮤직", matched_keywords: ["아이들"], journalist: "정다연", views: 57800, shares: 2700, collected_at: daysAgo(5, 16) },

  // 6~7일 전 (4건)
  { title: "블랙핑크 지수, 솔로 앨범 빌보드 진입", url: "#", category: "뮤직", matched_keywords: ["블랙핑크"], journalist: "조나연", views: 76900, shares: 3600, collected_at: daysAgo(6, 10) },
  { title: "하이브, 위버스 글로벌 사용자 1억명 돌파", url: "#", category: "엔터비즈", matched_keywords: ["하이브"], journalist: "이수민", views: 44500, shares: 2000, collected_at: daysAgo(6, 13) },
  { title: "스트레이키즈, 미국 음악 시상식 수상", url: "#", category: "연예가화제", matched_keywords: ["스트레이키즈"], journalist: "이민경", views: 68200, shares: 3300, collected_at: daysAgo(7, 9) },
  { title: "에스파, 글로벌 팬미팅 추가 도시 확정", url: "#", category: "연예가화제", matched_keywords: ["에스파"], journalist: "태유나", views: 49800, shares: 2300, collected_at: daysAgo(7, 14) },

  // 2~3주 전 (4건)
  { title: "BTS, UN 연설 이후 글로벌 미디어 집중 조명", url: "#", category: "연예가화제", matched_keywords: ["BTS"], journalist: "이수민", views: 135000, shares: 7200, collected_at: daysAgo(14, 10) },
  { title: "세븐틴 디노, 솔로 데뷔 앨범 차트 1위", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "조나연", views: 58900, shares: 2900, collected_at: daysAgo(15, 11) },
  { title: "뉴진스, 광고 모델 계약 7건 동시 발표", url: "#", category: "엔터비즈", matched_keywords: ["뉴진스"], journalist: "박서진", views: 47200, shares: 2200, collected_at: daysAgo(18, 9) },
  { title: "카카오엔터, 새 아이돌 그룹 연내 데뷔 예고", url: "#", category: "엔터비즈", matched_keywords: ["카카오"], journalist: "이소정", views: 31500, shares: 1300, collected_at: daysAgo(21, 13) },
];

const COLORS = ["#FF6B35", "#E8308A", "#7B2FBE", "#2563EB", "#059669", "#D97706", "#DC2626", "#6366F1", "#0891B2", "#BE185D"];

const formatDate = (str) => {
  const parts = str.split("-");
  return `${parts[1]}/${parts[2]}`;
};

const PERIOD_OPTIONS = [
  { label: "오늘", days: 1 },
  { label: "1주일", days: 7 },
  { label: "1개월", days: 30 },
  { label: "전체", days: 9999 },
];

// ── 기간 필터링 ────────────────────────────────────────────────────────
// specificDate: "YYYY-MM-DD" 형식이면 해당 날짜 하루만, 없으면 days 기준
function filterByPeriod(articles, days, specificDate = null) {
  if (specificDate) {
    return articles.filter((a) => {
      const kst = new Date(new Date(a.collected_at).getTime() + 9 * 60 * 60 * 1000);
      return kst.toISOString().slice(0, 10) === specificDate;
    });
  }
  if (days >= 9999) return articles;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return articles.filter((a) => {
    const d = new Date(a.collected_at);
    return d >= cutoff;
  });
}

// ── 키워드 자동 추출 (기사 제목에서 자연어 분석) ──────────────────────
const STOP_WORDS = new Set([
  // 일반 불용어
  "하는","있다","에서","이다","까지","그리고","하고","에게","으로","했다",
  "이어","한다","대한","위해","있는","없는","이후","이전","바로","것이",
  "통해","함께","대해","관련","하며","하면","한번","무엇","어떤","이것",
  "그것","저것","여기","거기","어디","이번","그동안","그래서","그러나",
  // 시간
  "오늘","어제","내일","지금","올해","매일","최근","당시",
  // 기사체 상투어
  "했다더니","알고보니","밝혔다","언급했다","고백했다","알렸다","전했다",
  "결국","올라간","가장","입소문","터졌다","요즘","화제","대세","드러났다",
  "나왔다","됐다","했다","된다","한다","봤다","갔다","왔다","줬다","넘는",
  "이상","이하","정도","이래","소식","사실","모습","심경","충격","논란",
  "공개","확정","발표","참석","진행","예정","소속","활동","계획","관심",
  "만에","만큼","가운데","또한","여전히","이미","다시","위한","같은",
  "아닌","것으로","대해서","뿐만","아니라","하지만","그런데","그래도",
  // 조사·어미 단편
  "에는","으로는","까지도","에서도","에게도","했는데","했지만","했다가",
  // 수치·단위
  "100","200","300","500","1000","만원","만명","억원",
]);

function extractKeywords(title) {
  if (!title) return [];
  const cleaned = title
    .replace(/\[.*?\]/g, " ")     // [전문], [TEN차트] 등 제거
    .replace(/\(.*?\)/g, " ")     // (사진) 등 제거
    .replace(/['""''…·→←↗↘!?]/g, " ")
    .replace(/\d+세|\d+살|\d+일|\d+월|\d+년|\d+시|\d+분/g, " ") // 나이/날짜 제거
    .replace(/\d+k|\d+만|\d+억/g, " ");

  const words = cleaned
    .split(/[\s,.'·…"+]+/)
    .map((w) => w.trim())
    .filter((w) => {
      if (w.length < 2) return false;
      if (/^\d+$/.test(w)) return false;
      if (STOP_WORDS.has(w)) return false;
      return true;
    });
  return words;
}

// ── 리포트 생성 ────────────────────────────────────────────────────────
function buildReport(articles) {
  const keywordCount = {};
  const categoryCount = {};
  const dailyCount = {};
  const hourlyCount = {};
  const journalistCount = {};
  const keywordArticles = {};

  articles.forEach((a) => {
    // 카테고리
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    // 한국시간(KST = UTC+9) 기준으로 날짜/시간 추출
    const kstDate = a.collected_at ? new Date(new Date(a.collected_at).getTime() + 9 * 60 * 60 * 1000) : null;
    // 일별 (KST)
    const day = kstDate ? kstDate.toISOString().slice(0, 10) : null;
    if (day) dailyCount[day] = (dailyCount[day] || 0) + 1;
    // 시간별 (KST)
    const hour = kstDate ? String(kstDate.getUTCHours()).padStart(2, "0") : null;
    if (hour) hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    // 기자
    if (a.journalist) journalistCount[a.journalist] = (journalistCount[a.journalist] || 0) + 1;
    // 키워드 자동 추출 (기사 제목에서)
    const words = extractKeywords(a.title);
    const seen = new Set(); // 같은 기사에서 중복 카운트 방지
    words.forEach((kw) => {
      if (seen.has(kw)) return;
      seen.add(kw);
      keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      if (!keywordArticles[kw]) keywordArticles[kw] = [];
      if (keywordArticles[kw].length < 8) keywordArticles[kw].push({ title: a.title, url: a.url, category: a.category });
    });
  });

  // 2회 이상 등장한 키워드만 (의미 있는 트렌드)
  const top_keywords = Object.entries(keywordCount)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);
  const top_journalists = Object.entries(journalistCount).sort((a, b) => b[1] - a[1]);

  return {
    total_articles: articles.length,
    top_keywords,
    category_breakdown: categoryCount,
    top_journalists,
    daily_article_count: Object.fromEntries(Object.entries(dailyCount).sort()),
    hourly_article_count: hourlyCount,
    keyword_articles: keywordArticles,
  };
}

// ── Gemini AI 분석 ─────────────────────────────────────────────────────
async function analyzeWithGemini(report, period) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API 키가 설정되지 않았습니다.");

  const topKw = (report.top_keywords || []).slice(0, 10).map(([k, v]) => `${k}(${v}건)`).join(", ");
  const topCat = Object.entries(report.category_breakdown || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}(${v}건)`).join(", ");
  const dailyArr = Object.entries(report.daily_article_count || {});
  const dailySummary = dailyArr.map(([d, c]) => `${d}: ${c}건`).join(", ");

  const prompt = `
당신은 K-Pop / K-엔터테인먼트 미디어 트렌드 전문 애널리스트입니다.
아래는 텐아시아(tenasia.co.kr) 기사 수집 데이터입니다. [기간: ${period}]

📊 총 기사 수: ${report.total_articles}건
🔥 TOP 키워드 언급량: ${topKw}
📂 카테고리 분포: ${topCat}
📅 일별 기사 수: ${dailySummary}

위 데이터를 바탕으로 다음을 분석해주세요:
1. **이 기간 가장 주목받은 아티스트/이슈** 와 그 이유
2. **카테고리 트렌드** — 어떤 분야에 관심이 집중되었는지
3. **일별 추이 해석** — 특이한 급등/급락이 있다면 이유 추측
4. **종합 인사이트** — 이 시기 K-엔터 업계의 전반적인 흐름

한국어로, 친절하고 전문적으로 작성해주세요. 각 항목은 명확히 구분해주세요.
  `.trim();

  // 모델 fallback 목록 (순서대로 시도 — 하나 막히면 다음으로 자동 전환)
  const MODELS = [
    { ver: "v1beta", name: "gemini-2.5-flash" },
    { ver: "v1beta", name: "gemini-2.5-pro" },
    { ver: "v1beta", name: "gemini-2.0-flash-exp" },
    { ver: "v1beta", name: "gemini-2.0-flash" },
    { ver: "v1beta", name: "gemini-1.5-flash-latest" },
    { ver: "v1beta", name: "gemini-1.5-pro-latest" },
    { ver: "v1beta", name: "gemini-1.5-flash" },
    { ver: "v1beta", name: "gemini-1.5-pro" },
  ];

  let lastError = null;
  for (const { ver, name } of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${ver}/models/${name}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        lastError = err?.error?.message || `${name} 호출 실패`;
        continue; // 다음 모델 시도
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) {
      lastError = e.message;
    }
  }
  throw new Error(lastError || "사용 가능한 Gemini 모델을 찾을 수 없습니다.");
}

// ── 마크다운 간단 렌더 ─────────────────────────────────────────────────
function SimpleMarkdown({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.9, fontSize: 13 }}>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} style={{ color: "#FF6B35", fontWeight: 700, margin: "16px 0 6px", fontSize: 14 }}>{line.replace("### ", "")}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} style={{ color: "#FF6B35", fontWeight: 800, margin: "20px 0 8px", fontSize: 15 }}>{line.replace("## ", "")}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} style={{ color: "#FF6B35", fontWeight: 800, margin: "20px 0 8px", fontSize: 16 }}>{line.replace("# ", "")}</h2>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ fontWeight: 700, color: "#E8308A", margin: "12px 0 4px" }}>{line.replaceAll("**", "")}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} style={{ color: "rgba(232,230,240,0.8)", marginLeft: 16, marginBottom: 4 }}>{line.replace(/^[-•] /, "")}</li>;
        if (line.trim() === "") return <br key={i} />;
        // 인라인 **bold** 처리
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ color: "rgba(232,230,240,0.75)", margin: "3px 0" }}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} style={{ color: "#E8E6F0", fontWeight: 700 }}>{p.replaceAll("**", "")}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

// ── RSS 데이터 가져오기 (기본: 오늘+최근 13일) ────────────────────────
async function fetchRssArticles() {
  const res = await fetch("/api/rss");
  if (!res.ok) throw new Error("RSS 데이터를 가져올 수 없습니다.");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "RSS 수집 실패");
  return data.articles;
}

// ── 특정일 사이트맵 실시간 요청 ───────────────────────────────────────
async function fetchSitemapByDate(dateStr) {
  const res = await fetch(`/api/sitemap?date=${dateStr}`);
  if (!res.ok) throw new Error("사이트맵 요청 실패");
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "사이트맵 수집 실패");
  return data.articles || [];
}

// ── 기자명 보완 (기사 페이지에서 추출) ────────────────────────────────
// 동명이인 목록 — 이 이름은 기자명이 있어도 이메일 기반 재구분 필요
const DUPLICATE_NAMES = new Set(["김지원"]);

async function fetchJournalists(articles) {
  // 기자명 없는 기사 + 동명이인 이름인 기사 → 모두 URL 추출
  const urlsToFetch = articles
    .filter((a) => a.url && a.url !== "#" && (!a.journalist || DUPLICATE_NAMES.has(a.journalist)))
    .map((a) => a.url);

  if (urlsToFetch.length === 0) return articles;

  try {
    const res = await fetch("/api/journalist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: urlsToFetch }),
    });
    if (!res.ok) return articles;
    const data = await res.json();
    if (!data.success || !data.mapping) return articles;

    // 기자명 매핑 적용
    return articles.map((a) => {
      const info = data.mapping[a.url];
      if (!info?.author) return a;
      // 동명이인이면 항상 API 결과(김지원A/B)로 대체
      if (DUPLICATE_NAMES.has(a.journalist)) return { ...a, journalist: info.author };
      // 기자명 없으면 보완
      if (!a.journalist) return { ...a, journalist: info.author };
      return a;
    });
  } catch {
    return articles;
  }
}

// ══════════════════════════════════════════════════════════════════════
export default function TenAsiaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(1); // index
  const [specificDate, setSpecificDate] = useState(""); // "YYYY-MM-DD" or ""
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 실제 데이터 (기본: 오늘+최근 13일)
  const [articles, setArticles] = useState(ALL_SAMPLE_ARTICLES);
  const [dataSource, setDataSource] = useState("demo"); // "demo" | "live"
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  // 특정일 데이터 (실시간 요청)
  const [dateArticles, setDateArticles] = useState(null); // null = 미선택
  const [dateLoading, setDateLoading] = useState(false);
  const [dateError, setDateError] = useState("");

  // 기자명 보완
  const [journalistLoading, setJournalistLoading] = useState(false);

  // AI 분석
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    // 실제 RSS+사이트맵 데이터 가져오기 → 기자명 보완
    fetchRssArticles()
      .then(async (data) => {
        if (data && data.length > 0) {
          setArticles(data);
          setDataSource("live");
          setDataLoading(false);
          // 기자명 없는 기사들 → 기사 페이지에서 기자명 추출 (백그라운드)
          const needFetch = data.filter((a) => !a.journalist && a.url && a.url !== "#");
          if (needFetch.length > 0) {
            setJournalistLoading(true);
            try {
              const enriched = await fetchJournalists(data);
              setArticles(enriched);
            } catch {}
            setJournalistLoading(false);
          }
        }
      })
      .catch((e) => {
        console.warn("RSS 로딩 실패, 데모 데이터 사용:", e.message);
        setDataError(e.message);
        setDataLoading(false);
      });
  }, []);

  const days = PERIOD_OPTIONS[selectedPeriod].days;
  const periodLabel = specificDate ? `${specificDate} 하루` : PERIOD_OPTIONS[selectedPeriod].label;
  // 특정일 선택 시 → dateArticles 우선, 없으면 기존 articles에서 필터
  const filtered = specificDate
    ? (dateArticles !== null ? dateArticles : filterByPeriod(articles, days, specificDate))
    : filterByPeriod(articles, days, null);
  const report = buildReport(filtered);

  const keywordData = (report.top_keywords || []).map(([name, count]) => ({ name, count }));
  const categoryData = Object.entries(report.category_breakdown || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const journalistData = (report.top_journalists || []).slice(0, 7).map(([name, count]) => ({ name, count }));

  // 오늘 또는 특정일 하루 선택이면 시간별, 그 외엔 일별 차트 데이터
  const todayStr = new Date(new Date().getTime() + 9*60*60*1000).toISOString().slice(0,10);
  const isToday = (days === 1 && !specificDate) || specificDate === todayStr || (!!specificDate && specificDate.length === 10);
  let trendData, trendXLabel;
  if (isToday) {
    // 0~23시까지 모든 시간 슬롯 생성 (빈 시간도 표시)
    trendData = Array.from({ length: 24 }, (_, h) => {
      const hh = String(h).padStart(2, "0");
      return { date: `${hh}시`, count: report.hourly_article_count?.[hh] || 0 };
    });
    trendXLabel = "시간대별 기사 수";
  } else {
    // 기간 내 모든 날짜 슬롯 생성 (빈 날짜도 표시)
    const dailyMap = report.daily_article_count || {};
    const allDates = Object.keys(dailyMap).sort();
    if (allDates.length > 0) {
      const start = new Date(allDates[0]);
      const end = new Date(allDates[allDates.length - 1]);
      trendData = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        trendData.push({ date: formatDate(key), count: dailyMap[key] || 0 });
      }
    } else {
      trendData = [];
    }
    trendXLabel = "일별 기사 추이";
  }

  const avgDaily = trendData.length ? Math.round(trendData.reduce((s, d) => s + d.count, 0) / trendData.filter(d => d.count > 0).length || 0) : 0;
  const topKeyword = keywordData[0]?.name || "-";
  const topCategory = categoryData[0]?.name || "-";

  const handleAiAnalyze = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResult("");
    try {
      const result = await analyzeWithGemini(report, periodLabel);
      setAiResult(result);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const cardStyle = {
    padding: "20px 16px", borderRadius: 14,
    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
  };

  const isAnyLoading = dataLoading || dateLoading || journalistLoading;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E6F0",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
    }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />

      {/* ── 글로벌 로딩 바 ── */}
      {isAnyLoading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, padding: "10px 20px",
        }}>
          <span style={{ fontSize: 18, animation: "hourglass 1.2s ease-in-out infinite" }}>⏳</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.3px" }}>
            {dataLoading ? "기사 데이터 수집 중..." :
             dateLoading ? "특정일 데이터 수집 중..." :
             journalistLoading ? "기자명 수집 중..." : "로딩 중..."}
          </span>
          <div style={{
            position: "absolute", bottom: 0, left: 0, height: 2,
            background: "linear-gradient(90deg, transparent, #FF6B35, transparent)",
            animation: "loadingSlide 1.5s ease-in-out infinite",
            width: "40%",
          }} />
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        padding: "20px 24px 0",
        paddingTop: isAnyLoading ? 52 : 20,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(255,107,53,0.08) 0%, transparent 100%)",
        transition: "padding-top 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {/* 로고 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#FF6B35" }}>TEN</span>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#E8E6F0" }}>TREND</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(255,107,53,0.15)", color: "#FF6B35", marginLeft: 4 }}>REPORT</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(232,230,240,0.4)", margin: 0 }}>
              텐아시아 K-엔터 트렌드 모니터
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, marginLeft: 8,
                background: dataSource === "live" ? "rgba(5,150,105,0.15)" : "rgba(255,107,53,0.15)",
                color: dataSource === "live" ? "#059669" : "#FF6B35",
              }}>
                {dataLoading ? "⏳ 로딩 중..." : dataSource === "live" ? "🟢 LIVE" : "📋 DEMO"}
              </span>
            </p>
          </div>

          {/* 기간 선택 */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* 기간 버튼 그룹 */}
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              {PERIOD_OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => {
                  setSelectedPeriod(i);
                  setSpecificDate("");
                  setShowDatePicker(false);
                  setSelectedKeyword(null);
                  setAiResult(""); setAiError("");
                }} style={{
                  padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: selectedPeriod === i && !specificDate ? "#FF6B35" : "transparent",
                  color: selectedPeriod === i && !specificDate ? "#fff" : "rgba(232,230,240,0.45)",
                  fontSize: 12, fontWeight: selectedPeriod === i && !specificDate ? 700 : 500,
                  transition: "all 0.2s",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 특정일 선택 버튼 */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDatePicker(v => !v)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: specificDate ? "#FF6B35" : "rgba(255,255,255,0.05)",
                  color: specificDate ? "#fff" : "rgba(232,230,240,0.5)",
                  fontSize: 12, fontWeight: specificDate ? 700 : 500,
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all 0.2s",
                }}
              >
                📅 {specificDate || "특정일"}
                {specificDate && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setSpecificDate(""); setShowDatePicker(false); setDateArticles(null); setDateError(""); setAiResult(""); setAiError(""); }}
                    style={{ marginLeft: 4, fontSize: 13, lineHeight: 1, opacity: 0.8, cursor: "pointer" }}
                  >✕</span>
                )}
              </button>

              {/* 날짜 피커 드롭다운 */}
              {showDatePicker && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
                  background: "#1A1A24", border: "1px solid rgba(255,107,53,0.3)",
                  borderRadius: 10, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  minWidth: 220,
                }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(232,230,240,0.4)" }}>날짜를 선택하세요</p>
                  <input
                    type="date"
                    value={specificDate}
                    max={new Date(new Date().getTime() + 9*60*60*1000).toISOString().slice(0,10)}
                    onChange={(e) => {
                      const d = e.target.value;
                      setSpecificDate(d);
                      setShowDatePicker(false);
                      setSelectedKeyword(null);
                      setAiResult(""); setAiError("");
                      setDateArticles(null);
                      setDateError("");
                      if (d) {
                        // 기존 articles에 해당 날짜 데이터가 충분히 있는지 확인
                        const existing = filterByPeriod(articles, 9999, d);
                        if (existing.length > 0 && dataSource === "live") {
                          // 이미 있으면 그대로 사용
                          setDateArticles(existing);
                        } else {
                          // 없으면 실시간 사이트맵 요청 + 기자명 보완
                          setDateLoading(true);
                          fetchSitemapByDate(d)
                            .then(async (data) => {
                              setDateArticles(data);
                              setDateLoading(false);
                              // 기자명 보완 (백그라운드)
                              const needJ = data.filter(a => !a.journalist && a.url);
                              if (needJ.length > 0) {
                                setJournalistLoading(true);
                                try {
                                  const enriched = await fetchJournalists(data);
                                  setDateArticles(enriched);
                                } catch {}
                                setJournalistLoading(false);
                              }
                            })
                            .catch((err) => { setDateError(err.message); setDateLoading(false); });
                        }
                      }
                    }}
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 7,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,107,53,0.3)",
                      color: "#E8E6F0", fontSize: 13,
                      outline: "none", boxSizing: "border-box",
                      colorScheme: "dark",
                    }}
                  />
                  <p style={{ margin: "8px 0 0", fontSize: 10, color: "rgba(232,230,240,0.25)" }}>
                    최근 13일 이내 날짜만 데이터가 있습니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { id: "overview", label: "📊 개요" },
            { id: "keywords", label: "🔥 키워드" },
            { id: "journalists", label: "✍️ 활발한 기자" },
            { id: "ai", label: "🤖 AI 분석" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none",
              background: activeTab === tab.id ? "rgba(255,107,53,0.12)" : "transparent",
              color: activeTab === tab.id ? "#FF6B35" : "rgba(232,230,240,0.45)",
              cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              transition: "all 0.2s",
              borderBottom: activeTab === tab.id ? "2px solid #FF6B35" : "2px solid transparent",
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ padding: "20px 24px 60px", opacity: isLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* 기간 배지 */}
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(232,230,240,0.3)" }}>
            조회 기간: <span style={{ color: "#FF6B35", fontWeight: 600 }}>{periodLabel}</span>
            &nbsp;·&nbsp; 기사 {report.total_articles}건
          </span>
        </div>

        {/* 특정일 로딩 / 에러 / 결과 배너 */}
        {specificDate && (
          <div style={{ marginBottom: 16 }}>
            {dateLoading && (
              <div style={{
                padding: "10px 16px", borderRadius: 8, fontSize: 12,
                background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)",
                color: "rgba(255,107,53,0.8)", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                {specificDate} 날짜 기사를 불러오는 중...
              </div>
            )}
            {!dateLoading && dateError && (
              <div style={{
                padding: "10px 16px", borderRadius: 8, fontSize: 12,
                background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
                color: "rgba(255,100,100,0.9)",
              }}>
                ⚠️ {dateError}
              </div>
            )}
            {!dateLoading && !dateError && dateArticles !== null && (
              <div style={{
                padding: "10px 16px", borderRadius: 8, fontSize: 12,
                background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)",
                color: "rgba(5,200,120,0.9)",
              }}>
                ✅ {specificDate} — 총 <strong>{dateArticles.length}건</strong> 조회됨
                {dateArticles.length === 0 && <span style={{ marginLeft: 8, opacity: 0.6 }}>(해당 날짜 기사 없음)</span>}
              </div>
            )}
          </div>
        )}

        {/* ── 개요 탭 ── */}
        {activeTab === "overview" && (
          <div>
            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "총 기사", value: report.total_articles, suffix: "건", color: "#FF6B35" },
                { label: "일 평균", value: avgDaily, suffix: "건", color: "#E8308A" },
                { label: "TOP 키워드", value: topKeyword, suffix: "", color: "#7B2FBE" },
                { label: "TOP 카테고리", value: topCategory, suffix: "", color: "#2563EB" },
              ].map((kpi, i) => (
                <div key={i} style={{
                  padding: "16px 14px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${kpi.color}18, ${kpi.color}06)`,
                  border: `1px solid ${kpi.color}25`,
                  animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
                }}>
                  <p style={{ fontSize: 11, color: "rgba(232,230,240,0.4)", margin: "0 0 6px", fontWeight: 500 }}>{kpi.label}</p>
                  <p style={{ fontSize: typeof kpi.value === "number" ? 26 : 18, fontWeight: 800, margin: 0, color: kpi.color, letterSpacing: "-0.5px" }}>
                    {kpi.value}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>{kpi.suffix}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* 기사 추이 (오늘=시간별, 그 외=일별) */}
            {trendData.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>{trendXLabel}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} width={30} />
                    <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }} />
                    <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: "#FF6B35", r: 4 }} activeDot={{ r: 6 }} name="기사 수" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 카테고리 + 기자 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>카테고리 분포</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
                  {categoryData.map((d, i) => (
                    <span key={i} style={{ fontSize: 11, color: "rgba(232,230,240,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], display: "inline-block" }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>활발한 기자</h3>
                {journalistData.length === 0 && (
                  <p style={{ fontSize: 12, color: "rgba(232,230,240,0.3)", textAlign: "center", marginTop: 40 }}>데이터 없음</p>
                )}
                {journalistData.map((j, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(232,230,240,0.5)", width: 55, flexShrink: 0 }}>{j.name}</span>
                    <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        width: `${(j.count / journalistData[0].count) * 100}%`,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}88, ${COLORS[i % COLORS.length]}44)`,
                        transition: "width 1s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(232,230,240,0.35)", width: 25, textAlign: "right" }}>{j.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 키워드 탭 ── */}
        {activeTab === "keywords" && (
          <div>
            {keywordData.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
                <p style={{ color: "rgba(232,230,240,0.3)", fontSize: 14 }}>선택한 기간에 데이터가 없습니다.</p>
              </div>
            ) : (
              <>
                <div style={{ ...cardStyle, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>키워드별 언급 횟수</h3>
                  <ResponsiveContainer width="100%" height={Math.max(220, keywordData.length * 34)}>
                    <BarChart data={keywordData} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "rgba(232,230,240,0.6)" }} width={85} />
                      <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }} />
                      <Bar dataKey="count" name="언급 수" radius={[0, 6, 6, 0]} cursor="pointer" onClick={(d) => setSelectedKeyword(d.name)}>
                        {keywordData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 키워드 태그 */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {keywordData.map((kw, i) => (
                    <button key={kw.name} onClick={() => setSelectedKeyword(selectedKeyword === kw.name ? null : kw.name)} style={{
                      padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                      background: selectedKeyword === kw.name ? COLORS[i % COLORS.length] : `${COLORS[i % COLORS.length]}18`,
                      color: selectedKeyword === kw.name ? "#fff" : COLORS[i % COLORS.length],
                      fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                    }}>
                      {kw.name} <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 4 }}>{kw.count}</span>
                    </button>
                  ))}
                </div>

                {/* 선택된 키워드 기사 */}
                {selectedKeyword && report.keyword_articles?.[selectedKeyword] && (
                  <div style={{ padding: "20px 16px", borderRadius: 14, background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.15)" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#FF6B35" }}>"{selectedKeyword}" 관련 기사</h3>
                    {report.keyword_articles[selectedKeyword].map((article, i, arr) => (
                      <div key={i} style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "#E8E6F0" }}>{article.title}</p>
                        <span style={{ fontSize: 11, color: "rgba(232,230,240,0.35)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>
                          {article.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 활발한 기자 탭 ── */}
        {activeTab === "journalists" && (() => {
          // 기자별 기사 수 집계 (기자명 있는 기사만)
          const journalistMap = {};
          filtered.forEach((a) => {
            if (!a.journalist) return;
            if (!journalistMap[a.journalist]) journalistMap[a.journalist] = [];
            journalistMap[a.journalist].push(a);
          });
          // 기사 수 기준 내림차순 정렬
          const rankedJournalists = Object.entries(journalistMap)
            .map(([name, arts]) => ({ name, articles: arts, count: arts.length }))
            .sort((a, b) => b.count - a.count);

          const noJournalistCount = filtered.filter(a => !a.journalist).length;

          return (
          <div>
            {/* 기자명 로딩 중 배너 */}
            {journalistLoading && (
              <div style={{
                padding: "10px 16px", borderRadius: 8, fontSize: 12, marginBottom: 16,
                background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)",
                color: "rgba(255,107,53,0.8)", display: "flex", alignItems: "center", gap: 8,
              }}>
                ⏳ 기사 페이지에서 기자명을 수집하는 중...
              </div>
            )}
            {rankedJournalists.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
                <p style={{ color: "rgba(232,230,240,0.3)", fontSize: 14 }}>
                  {journalistLoading
                    ? "기자명을 수집하는 중입니다. 잠시 기다려주세요..."
                    : noJournalistCount > 0
                    ? `${noJournalistCount}건의 기사가 있지만 기자명을 아직 불러오지 못했습니다.`
                    : "선택한 기간에 기사가 없습니다."}
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "rgba(232,230,240,0.35)" }}>
                    기사 수 기준 · 기자 <span style={{ color: "#FF6B35", fontWeight: 600 }}>{rankedJournalists.length}명</span>
                    &nbsp;· 기사 <span style={{ color: "#FF6B35", fontWeight: 600 }}>{rankedJournalists.reduce((s, j) => s + j.count, 0)}건</span>
                  </span>
                  {noJournalistCount > 0 && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: "rgba(232,230,240,0.25)" }}>
                      + 기자명 없는 기사 {noJournalistCount}건
                    </span>
                  )}
                </div>

                {/* 기자 랭킹 차트 */}
                <div style={{ ...cardStyle, marginBottom: 20 }}>
                  <ResponsiveContainer width="100%" height={Math.max(200, rankedJournalists.slice(0, 15).length * 34)}>
                    <BarChart data={rankedJournalists.slice(0, 15)} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "rgba(232,230,240,0.6)" }} width={70} />
                      <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }} />
                      <Bar dataKey="count" name="기사 수" radius={[0, 6, 6, 0]}>
                        {rankedJournalists.slice(0, 15).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 기자별 기사 목록 (상위 10명) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {rankedJournalists.slice(0, 10).map((j, ji) => (
                    <div key={j.name} style={{
                      ...cardStyle,
                      borderLeft: `3px solid ${COLORS[ji % COLORS.length]}`,
                      animation: `fadeIn 0.4s ease ${ji * 0.05}s both`,
                    }}>
                      {/* 기자 헤더 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{
                          minWidth: 32, height: 32, borderRadius: 8,
                          background: `linear-gradient(135deg, ${COLORS[ji % COLORS.length]}, ${COLORS[ji % COLORS.length]}88)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                        }}>
                          {ji + 1}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#E8E6F0" }}>{j.name}</p>
                          <p style={{ fontSize: 11, color: "rgba(232,230,240,0.35)", margin: 0 }}>
                            기사 {j.count}건
                          </p>
                        </div>
                      </div>

                      {/* 기사 리스트 */}
                      {j.articles.slice(0, 5).map((article, ai, arr) => (
                        <a
                          key={ai}
                          href={article.url !== "#" ? article.url : undefined}
                          target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: "none", display: "block" }}
                        >
                          <div style={{
                            padding: "8px 12px",
                            borderBottom: ai < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            transition: "background 0.2s", borderRadius: 6, cursor: "pointer",
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,53,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <p style={{
                              fontSize: 13, fontWeight: 500, margin: "0 0 4px",
                              color: "rgba(232,230,240,0.8)", lineHeight: 1.5,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {article.title}
                            </p>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(232,230,240,0.35)" }}>
                                {article.category}
                              </span>
                              {(article.matched_keywords || []).slice(0, 2).map((kw, ki) => (
                                <span key={ki} style={{ fontSize: 10, color: COLORS[ki % COLORS.length], fontWeight: 600 }}>#{kw}</span>
                              ))}
                              <span style={{ fontSize: 10, color: "rgba(232,230,240,0.2)", marginLeft: "auto" }}>
                                {article.collected_at?.slice(0, 10)}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                      {j.count > 5 && (
                        <p style={{ fontSize: 11, color: "rgba(232,230,240,0.25)", margin: "8px 0 0 12px" }}>
                          ... 외 {j.count - 5}건
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          );
        })()}

        {/* ── AI 분석 탭 ── */}
        {activeTab === "ai" && (
          <div>
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 4px", color: "#E8E6F0" }}>🤖 Gemini AI 트렌드 분석</h3>
                  <p style={{ fontSize: 12, color: "rgba(232,230,240,0.4)", margin: 0 }}>
                    선택 기간: <span style={{ color: "#FF6B35", fontWeight: 600 }}>{periodLabel}</span> · {report.total_articles}건 데이터 기반
                  </p>
                </div>
                <button onClick={handleAiAnalyze} disabled={aiLoading} style={{
                  padding: "10px 22px", borderRadius: 10, border: "none", cursor: aiLoading ? "not-allowed" : "pointer",
                  background: aiLoading ? "rgba(255,107,53,0.3)" : "linear-gradient(135deg, #FF6B35, #E8308A)",
                  color: "#fff", fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                  opacity: aiLoading ? 0.7 : 1,
                  boxShadow: aiLoading ? "none" : "0 4px 15px rgba(255,107,53,0.3)",
                }}>
                  {aiLoading ? "⏳ 분석 중..." : "✨ AI 분석 시작"}
                </button>
              </div>
            </div>

            {/* 에러 */}
            {aiError && (
              <div style={{ padding: "16px", borderRadius: 12, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>⚠️ {aiError}</p>
              </div>
            )}

            {/* 결과 */}
            {aiResult && (
              <div style={{ ...cardStyle, borderColor: "rgba(255,107,53,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35" }}>Gemini 분석 결과</span>
                  <span style={{ fontSize: 11, color: "rgba(232,230,240,0.3)", marginLeft: "auto" }}>{periodLabel} 기준</span>
                </div>
                <SimpleMarkdown text={aiResult} />
              </div>
            )}

            {/* 안내 (결과 없을 때) */}
            {!aiResult && !aiError && !aiLoading && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <p style={{ fontSize: 14, color: "rgba(232,230,240,0.4)", marginBottom: 8 }}>위의 "AI 분석 시작" 버튼을 눌러주세요</p>
                <p style={{ fontSize: 12, color: "rgba(232,230,240,0.25)" }}>Gemini가 {periodLabel} 동안의 K-엔터 트렌드를 분석합니다</p>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hourglass {
          0%   { transform: rotate(0deg); }
          40%  { transform: rotate(180deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes loadingSlide {
          0%   { left: -40%; }
          100% { left: 100%; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
