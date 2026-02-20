import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

const SAMPLE_REPORT = {
  generated_at: "2026-02-20T14:30:00",
  period: "2026-02-13 ~ 2026-02-20",
  total_articles: 187,
  top_keywords: [
    ["BTS", 24], ["아이브", 19], ["세븐틴", 16], ["에스파", 14], ["뉴진스", 12],
    ["스트레이키즈", 11], ["하이브", 10], ["블랙핑크", 8], ["아이들", 7], ["SM", 6],
    ["JYP", 5], ["카카오", 4], ["YG", 3]
  ],
  category_breakdown: {
    "뮤직": 58, "연예가화제": 45, "드라마예능": 38, "엔터비즈": 28, "영화": 18
  },
  top_journalists: [
    ["이수민", 14], ["조나연", 12], ["정다연", 11], ["이민경", 9], ["태유나", 8],
    ["이소정", 7], ["박서진", 5]
  ],
  daily_article_count: {
    "2026-02-13": 22, "2026-02-14": 31, "2026-02-15": 18,
    "2026-02-16": 25, "2026-02-17": 29, "2026-02-18": 34,
    "2026-02-19": 28, "2026-02-20": 0
  },
  keyword_articles: {
    "BTS": [
      { title: "방탄소년단 진, 솔로 월드투어 20만 동원", url: "#", category: "뮤직" },
      { title: "BTS 제이홉, 군 전역 후 첫 공식 스케줄 확정", url: "#", category: "뮤직" },
      { title: "하이브, BTS 신규 프로젝트 발표 예고", url: "#", category: "엔터비즈" },
    ],
    "아이브": [
      { title: "아이브, 日 오리콘 차트 1위 달성", url: "#", category: "뮤직" },
      { title: "장원영, 글로벌 브랜드 앰배서더 추가 선정", url: "#", category: "연예가화제" },
    ],
    "세븐틴": [
      { title: "세븐틴, 북미 스타디움 투어 전석 매진", url: "#", category: "뮤직" },
      { title: "세븐틴 호시, 자작곡으로 음원차트 진입", url: "#", category: "뮤직" },
    ],
  }
};

const COLORS = ["#FF6B35", "#E8308A", "#7B2FBE", "#2563EB", "#059669", "#D97706", "#DC2626", "#6366F1", "#0891B2", "#BE185D"];

const formatDate = (str) => {
  const parts = str.split("-");
  return `${parts[1]}/${parts[2]}`;
};

export default function TenAsiaDashboard() {
  const [report, setReport] = useState(SAMPLE_REPORT);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUsingDemo, setIsUsingDemo] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setReport(data);
        setIsUsingDemo(false);
        setSelectedKeyword(null);
      } catch {
        alert("JSON 파일 형식이 올바르지 않습니다.");
      }
    };
    reader.readAsText(file);
  };

  const keywordData = (report.top_keywords || []).map(([name, count]) => ({ name, count }));
  const categoryData = Object.entries(report.category_breakdown || {}).map(([name, value]) => ({ name, value }));
  const dailyData = Object.entries(report.daily_article_count || {}).map(([date, count]) => ({ date: formatDate(date), count, fullDate: date }));
  const journalistData = (report.top_journalists || []).slice(0, 7).map(([name, count]) => ({ name, count }));

  const totalMentions = keywordData.reduce((s, d) => s + d.count, 0);
  const avgDaily = dailyData.length ? Math.round(dailyData.reduce((s, d) => s + d.count, 0) / dailyData.length) : 0;
  const topKeyword = keywordData[0]?.name || "-";
  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0]?.name || "-";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E6F0",
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />

      {/* Header */}
      <header style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(255,107,53,0.08) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#FF6B35" }}>TEN</span>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#E8E6F0" }}>TREND</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                background: "rgba(255,107,53,0.15)", color: "#FF6B35", marginLeft: 4,
              }}>REPORT</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(232,230,240,0.45)", margin: 0 }}>
              {report.period} · {isUsingDemo ? "데모 데이터" : "실제 데이터"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => fileInputRef.current?.click()} style={{
              padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "#E8E6F0", cursor: "pointer",
              fontSize: 12, fontWeight: 500, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,107,53,0.12)"; e.target.style.borderColor = "rgba(255,107,53,0.3)"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              📂 JSON 업로드
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={{ display: "none" }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginTop: 16 }}>
          {[
            { id: "overview", label: "개요" },
            { id: "keywords", label: "키워드" },
            { id: "articles", label: "기사" },
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

      {/* Content */}
      <main style={{ padding: "20px 24px 40px", opacity: isLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "총 기사", value: report.total_articles, suffix: "건", color: "#FF6B35" },
                { label: "일 평균", value: avgDaily, suffix: "건", color: "#E8308A" },
                { label: "TOP 키워드", value: topKeyword, suffix: "", color: "#7B2FBE" },
                { label: "TOP 카테고리", value: topCategory, suffix: "", color: "#2563EB" },
              ].map((kpi, i) => (
                <div key={i} style={{
                  padding: "16px 14px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${kpi.color}10, ${kpi.color}05)`,
                  border: `1px solid ${kpi.color}20`,
                  animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                }}>
                  <p style={{ fontSize: 11, color: "rgba(232,230,240,0.45)", margin: "0 0 6px", fontWeight: 500 }}>{kpi.label}</p>
                  <p style={{ fontSize: typeof kpi.value === "number" ? 26 : 18, fontWeight: 800, margin: 0, color: kpi.color, letterSpacing: "-0.5px" }}>
                    {kpi.value}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>{kpi.suffix}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Daily Trend Chart */}
            <div style={{
              padding: "20px 16px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>일별 기사 추이</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} width={30} />
                  <Tooltip
                    contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }}
                    labelStyle={{ color: "rgba(232,230,240,0.6)" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: "#FF6B35", r: 4 }} activeDot={{ r: 6, fill: "#FF6B35" }} name="기사 수" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category + Journalist */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{
                padding: "20px 16px", borderRadius: 14,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
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

              <div style={{
                padding: "20px 16px", borderRadius: 14,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>활발한 기자</h3>
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

        {/* Keywords Tab */}
        {activeTab === "keywords" && (
          <div>
            <div style={{
              padding: "20px 16px", borderRadius: 14, marginBottom: 20,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "rgba(232,230,240,0.7)" }}>키워드별 언급 횟수</h3>
              <ResponsiveContainer width="100%" height={Math.max(250, keywordData.length * 32)}>
                <BarChart data={keywordData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(232,230,240,0.35)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "rgba(232,230,240,0.6)" }} width={85} />
                  <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#E8E6F0" }} />
                  <Bar dataKey="count" name="언급 수" radius={[0, 6, 6, 0]} cursor="pointer"
                    onClick={(data) => setSelectedKeyword(data.name)}
                  >
                    {keywordData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Keyword Tags */}
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

            {/* Selected Keyword Articles */}
            {selectedKeyword && report.keyword_articles?.[selectedKeyword] && (
              <div style={{
                padding: "20px 16px", borderRadius: 14,
                background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.12)",
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#FF6B35" }}>
                  "{selectedKeyword}" 관련 기사
                </h3>
                {report.keyword_articles[selectedKeyword].map((article, i) => (
                  <div key={i} style={{
                    padding: "10px 0",
                    borderBottom: i < report.keyword_articles[selectedKeyword].length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "#E8E6F0" }}>
                      {article.title}
                    </p>
                    <span style={{ fontSize: 11, color: "rgba(232,230,240,0.35)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>
                      {article.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div>
            <div style={{
              padding: "20px", borderRadius: 14,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "rgba(232,230,240,0.7)" }}>사용 가이드</h3>
              <div style={{ fontSize: 13, color: "rgba(232,230,240,0.5)", lineHeight: 1.8 }}>
                <p style={{ margin: "0 0 16px" }}>
                  Python 스크립트(<code style={{ background: "rgba(255,107,53,0.1)", padding: "2px 6px", borderRadius: 4, color: "#FF6B35", fontSize: 12 }}>tenasia_monitor.py</code>)를
                  실행하면 <code style={{ background: "rgba(255,107,53,0.1)", padding: "2px 6px", borderRadius: 4, color: "#FF6B35", fontSize: 12 }}>trend_report.json</code> 파일이 생성됩니다.
                </p>

                <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 10, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, marginBottom: 16 }}>
                  <div style={{ color: "rgba(232,230,240,0.3)", marginBottom: 4 }}># 1. 패키지 설치</div>
                  <div style={{ color: "#FF6B35" }}>pip install requests beautifulsoup4 schedule</div>
                  <br />
                  <div style={{ color: "rgba(232,230,240,0.3)", marginBottom: 4 }}># 2. 1회 실행</div>
                  <div style={{ color: "#FF6B35" }}>python tenasia_monitor.py</div>
                  <br />
                  <div style={{ color: "rgba(232,230,240,0.3)", marginBottom: 4 }}># 3. 빠른 실행 (제목만 수집)</div>
                  <div style={{ color: "#FF6B35" }}>python tenasia_monitor.py --quick</div>
                  <br />
                  <div style={{ color: "rgba(232,230,240,0.3)", marginBottom: 4 }}># 4. 자동 반복 (30분 간격)</div>
                  <div style={{ color: "#FF6B35" }}>python tenasia_monitor.py --schedule</div>
                </div>

                <p style={{ margin: "0 0 12px" }}>
                  생성된 <strong>trend_report.json</strong> 파일을 위의 "📂 JSON 업로드" 버튼으로 업로드하면 실제 데이터로 대시보드가 업데이트됩니다.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#FF6B35", margin: "0 0 6px" }}>📁 생성 파일</p>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.8 }}>
                      articles.json — 전체 기사 데이터<br />
                      articles.csv — 엑셀 호환 데이터<br />
                      trend_report.json — 트렌드 리포트
                    </p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#E8308A", margin: "0 0 6px" }}>⚙️ 커스터마이징</p>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.8 }}>
                      KEYWORDS — 모니터링 키워드 수정<br />
                      CATEGORIES — 수집 카테고리 수정<br />
                      INTERVAL — 수집 간격 조정
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        code { font-family: 'SF Mono', 'Fira Code', monospace; }
      `}</style>
    </div>
  );
}
