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
  { title: "방탄소년단 진, 솔로 월드투어 20만 동원", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "이수민", collected_at: daysAgo(0, 10) },
  { title: "BTS 제이홉, 군 전역 후 첫 공식 스케줄 확정", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "조나연", collected_at: daysAgo(1, 9) },
  { title: "하이브, BTS 신규 프로젝트 발표 예고", url: "#", category: "엔터비즈", matched_keywords: ["BTS", "하이브"], journalist: "이수민", collected_at: daysAgo(2, 11) },
  { title: "아이브, 日 오리콘 차트 1위 달성", url: "#", category: "뮤직", matched_keywords: ["아이브"], journalist: "정다연", collected_at: daysAgo(0, 8) },
  { title: "장원영, 글로벌 브랜드 앰배서더 추가 선정", url: "#", category: "연예가화제", matched_keywords: ["아이브"], journalist: "이민경", collected_at: daysAgo(3, 14) },
  { title: "세븐틴, 북미 스타디움 투어 전석 매진", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "태유나", collected_at: daysAgo(4, 10) },
  { title: "세븐틴 호시, 자작곡으로 음원차트 진입", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "조나연", collected_at: daysAgo(5, 9) },
  { title: "에스파, 신보 발매 첫날 100만장 돌파", url: "#", category: "뮤직", matched_keywords: ["에스파"], journalist: "정다연", collected_at: daysAgo(6, 12) },
  { title: "뉴진스 컴백 일정 공식 발표", url: "#", category: "뮤직", matched_keywords: ["뉴진스"], journalist: "이소정", collected_at: daysAgo(7, 10) },
  { title: "블랙핑크 제니, 솔로 앨범 글로벌 차트 석권", url: "#", category: "뮤직", matched_keywords: ["블랙핑크"], journalist: "이수민", collected_at: daysAgo(8, 11) },
  { title: "SM엔터, 2분기 실적 전망 상향", url: "#", category: "엔터비즈", matched_keywords: ["SM"], journalist: "박서진", collected_at: daysAgo(9, 9) },
  { title: "JYP 새 걸그룹 데뷔 예고", url: "#", category: "엔터비즈", matched_keywords: ["JYP"], journalist: "이민경", collected_at: daysAgo(10, 10) },
  { title: "스트레이키즈, 월드투어 추가 공연 확정", url: "#", category: "뮤직", matched_keywords: ["스트레이키즈"], journalist: "태유나", collected_at: daysAgo(11, 8) },
  { title: "아이들, 신곡 MV 공개 24시간 1000만뷰 돌파", url: "#", category: "뮤직", matched_keywords: ["아이들"], journalist: "조나연", collected_at: daysAgo(12, 14) },
  { title: "YG엔터, 블랙핑크 재계약 협상 진행 중", url: "#", category: "엔터비즈", matched_keywords: ["YG", "블랙핑크"], journalist: "이수민", collected_at: daysAgo(13, 11) },
  { title: "BTS RM, 솔로 콘서트 전석 매진", url: "#", category: "뮤직", matched_keywords: ["BTS"], journalist: "정다연", collected_at: daysAgo(14, 10) },
  { title: "카카오엔터, 글로벌 IP 사업 확장 발표", url: "#", category: "엔터비즈", matched_keywords: ["카카오"], journalist: "박서진", collected_at: daysAgo(15, 9) },
  { title: "아이브 원영, 드라마 주연 캐스팅 확정", url: "#", category: "드라마예능", matched_keywords: ["아이브"], journalist: "이소정", collected_at: daysAgo(16, 13) },
  { title: "세븐틴, 한국 가수 최초 웸블리 단독 공연", url: "#", category: "뮤직", matched_keywords: ["세븐틴"], journalist: "태유나", collected_at: daysAgo(17, 10) },
  { title: "뉴진스 민지, 파리 패션위크 참석", url: "#", category: "연예가화제", matched_keywords: ["뉴진스"], journalist: "이민경", collected_at: daysAgo(21, 11) },
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
function filterByPeriod(articles, days) {
  if (days >= 9999) return articles;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return articles.filter((a) => {
    const d = new Date(a.collected_at);
    return d >= cutoff;
  });
}

// ── 리포트 생성 ────────────────────────────────────────────────────────
function buildReport(articles) {
  const keywordCount = {};
  const categoryCount = {};
  const dailyCount = {};
  const journalistCount = {};
  const keywordArticles = {};

  articles.forEach((a) => {
    // 카테고리
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    // 일별
    const day = a.collected_at?.slice(0, 10);
    if (day) dailyCount[day] = (dailyCount[day] || 0) + 1;
    // 기자
    if (a.journalist) journalistCount[a.journalist] = (journalistCount[a.journalist] || 0) + 1;
    // 키워드
    (a.matched_keywords || []).forEach((kw) => {
      keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      if (!keywordArticles[kw]) keywordArticles[kw] = [];
      if (keywordArticles[kw].length < 5) keywordArticles[kw].push({ title: a.title, url: a.url, category: a.category });
    });
  });

  const top_keywords = Object.entries(keywordCount).sort((a, b) => b[1] - a[1]);
  const top_journalists = Object.entries(journalistCount).sort((a, b) => b[1] - a[1]);

  return {
    total_articles: articles.length,
    top_keywords,
    category_breakdown: categoryCount,
    top_journalists,
    daily_article_count: Object.fromEntries(Object.entries(dailyCount).sort()),
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Gemini API 호출 실패");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "분석 결과를 가져올 수 없습니다.";
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

// ══════════════════════════════════════════════════════════════════════
export default function TenAsiaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(1); // index
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // AI 분석
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => { setTimeout(() => setIsLoaded(true), 100); }, []);

  const days = PERIOD_OPTIONS[selectedPeriod].days;
  const periodLabel = PERIOD_OPTIONS[selectedPeriod].label;
  const filtered = filterByPeriod(ALL_SAMPLE_ARTICLES, days);
  const report = buildReport(filtered);

  const keywordData = (report.top_keywords || []).map(([name, count]) => ({ name, count }));
  const categoryData = Object.entries(report.category_breakdown || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const dailyData = Object.entries(report.daily_article_count || {}).map(([date, count]) => ({ date: formatDate(date), count }));
  const journalistData = (report.top_journalists || []).slice(0, 7).map(([name, count]) => ({ name, count }));

  const avgDaily = dailyData.length ? Math.round(dailyData.reduce((s, d) => s + d.count, 0) / dailyData.length) : 0;
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E6F0",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
    }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />

      {/* ── Header ── */}
      <header style={{
        padding: "20px 24px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(255,107,53,0.08) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {/* 로고 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#FF6B35" }}>TEN</span>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#E8E6F0" }}>TREND</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "rgba(255,107,53,0.15)", color: "#FF6B35", marginLeft: 4 }}>REPORT</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(232,230,240,0.4)", margin: 0 }}>텐아시아 K-엔터 트렌드 모니터</p>
          </div>

          {/* 기간 선택 */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
            {PERIOD_OPTIONS.map((opt, i) => (
              <button key={i} onClick={() => { setSelectedPeriod(i); setSelectedKeyword(null); setAiResult(""); setAiError(""); }} style={{
                padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                background: selectedPeriod === i ? "#FF6B35" : "transparent",
                color: selectedPeriod === i ? "#fff" : "rgba(232,230,240,0.45)",
                fontSize: 12, fontWeight: selectedPeriod === i ? 700 : 500,
                transition: "all 0.2s",
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { id: "overview", label: "📊 개요" },
            { id: "keywords", label: "🔥 키워드" },
            { id: "articles", label: "📰 베스트 기사" },
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
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(232,230,240,0.3)" }}>
            조회 기간: <span style={{ color: "#FF6B35", fontWeight: 600 }}>{periodLabel}</span>
            &nbsp;·&nbsp; 기사 {report.total_articles}건
          </span>
        </div>

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

            {/* 일별 추이 */}
            {dailyData.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>일별 기사 추이</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyData}>
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

        {/* ── 베스트 기사 탭 ── */}
        {activeTab === "articles" && (
          <div>
            {filtered.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
                <p style={{ color: "rgba(232,230,240,0.3)", fontSize: 14 }}>선택한 기간에 기사가 없습니다.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(232,230,240,0.35)" }}>
                    키워드 언급 많은 순 · 총 <span style={{ color: "#FF6B35", fontWeight: 600 }}>{filtered.length}건</span>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...filtered]
                    .sort((a, b) => (b.matched_keywords?.length || 0) - (a.matched_keywords?.length || 0))
                    .map((article, i) => (
                      <a
                        key={i}
                        href={article.url !== "#" ? article.url : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <div style={{
                          padding: "16px 18px", borderRadius: 12,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          transition: "all 0.2s",
                          cursor: article.url !== "#" ? "pointer" : "default",
                          display: "flex", alignItems: "flex-start", gap: 14,
                        }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(255,107,53,0.05)";
                            e.currentTarget.style.borderColor = "rgba(255,107,53,0.2)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                          }}
                        >
                          {/* 순위 */}
                          <div style={{
                            minWidth: 28, height: 28, borderRadius: 8,
                            background: i < 3 ? `linear-gradient(135deg, ${COLORS[i]}, ${COLORS[i]}88)` : "rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800,
                            color: i < 3 ? "#fff" : "rgba(232,230,240,0.3)",
                            flexShrink: 0,
                          }}>
                            {i + 1}
                          </div>

                          {/* 본문 */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 13, fontWeight: 600, margin: "0 0 8px",
                              color: "#E8E6F0", lineHeight: 1.5,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {article.title}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                              {/* 카테고리 뱃지 */}
                              <span style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(232,230,240,0.45)",
                              }}>
                                {article.category}
                              </span>
                              {/* 키워드 태그 */}
                              {(article.matched_keywords || []).map((kw, ki) => (
                                <span key={ki} style={{
                                  fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                  background: `${COLORS[ki % COLORS.length]}18`,
                                  color: COLORS[ki % COLORS.length],
                                  fontWeight: 600,
                                }}>
                                  # {kw}
                                </span>
                              ))}
                              {/* 날짜 */}
                              <span style={{ fontSize: 11, color: "rgba(232,230,240,0.25)", marginLeft: "auto" }}>
                                {article.collected_at?.slice(0, 10)}
                              </span>
                            </div>
                          </div>

                          {/* 외부링크 아이콘 */}
                          {article.url !== "#" && (
                            <span style={{ fontSize: 14, color: "rgba(232,230,240,0.2)", flexShrink: 0 }}>↗</span>
                          )}
                        </div>
                      </a>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

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
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
