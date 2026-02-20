// Vercel Serverless Function: 특정 날짜 텐아시아 사이트맵 실시간 수집
// GET /api/sitemap?date=YYYY-MM-DD
// 해당 날짜의 사이트맵에서 기사 목록을 실시간으로 가져옴

const KEYWORDS = [
  "BTS", "방탄소년단", "아이브", "IVE", "뉴진스", "NewJeans",
  "스트레이키즈", "에스파", "aespa", "세븐틴", "SEVENTEEN",
  "블랙핑크", "BLACKPINK", "아이들", "(G)I-DLE",
  "하이브", "SM", "JYP", "YG", "카카오",
  "임영웅", "이찬원", "영탁", "정동원", "장민호",
  "NCT", "엑소", "EXO", "샤이니", "SHINee",
  "트와이스", "TWICE", "레드벨벳",
];

function matchKeywords(text) {
  const upper = text.toUpperCase();
  return KEYWORDS.filter((kw) => upper.includes(kw.toUpperCase()));
}

function inferCategory(title) {
  const t = (title || "").toLowerCase();
  if (/음악|앨범|콘서트|차트|가수|아이돌|뮤직|싱글|컴백|발매|오리콘|빌보드/.test(t)) return "뮤직";
  if (/드라마|예능|방송|시청률|ost|출연|촬영|방영/.test(t)) return "드라마예능";
  if (/영화|개봉|박스오피스|감독|스크린/.test(t)) return "영화";
  if (/기획사|계약|레이블|실적|주가|인수|합병|투자/.test(t)) return "엔터비즈";
  return "연예가화제";
}

function parseSitemapHtml(html, dateStr) {
  const articles = [];
  // 절대URL 패턴: href="https://www.tenasia.co.kr/article/..."
  const linkRegex = /<a\s+href="(https:\/\/www\.tenasia\.co\.kr\/article\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();
    if (!rawTitle || rawTitle.length < 3) continue;
    const collected_at = new Date(`${dateStr}T12:00:00+09:00`).toISOString();
    articles.push({
      title: rawTitle,
      url,
      category: inferCategory(rawTitle),
      journalist: "",
      collected_at,
      matched_keywords: matchKeywords(rawTitle),
    });
  }
  return articles;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { date } = req.query;

  // 날짜 형식 검증: YYYY-MM-DD
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, error: "date 파라미터가 필요합니다. 형식: YYYY-MM-DD" });
  }

  // 미래 날짜 차단
  const todayKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (date > todayKST) {
    return res.status(400).json({ success: false, error: "미래 날짜는 조회할 수 없습니다." });
  }

  // 사이트맵 URL 조합: YYYY/MM/DD
  const datePath = date.replace(/-/g, "/");
  const sitemapUrl = `https://www.tenasia.co.kr/sitemap/${datePath}/`;

  try {
    const resp = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TenAsiaMonitor/2.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!resp.ok) {
      return res.status(200).json({
        success: true,
        date,
        total: 0,
        articles: [],
        message: `${date} 날짜의 사이트맵을 찾을 수 없습니다.`,
      });
    }

    const html = await resp.text();
    const articles = parseSitemapHtml(html, date);

    // 중복 제거 (URL 기준)
    const seen = new Set();
    const unique = articles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    // 캐시: 오늘이 아닌 날짜는 1시간 캐시, 오늘은 5분
    const isToday = date === todayKST;
    res.setHeader("Cache-Control", isToday
      ? "s-maxage=300, stale-while-revalidate=600"
      : "s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).json({
      success: true,
      date,
      fetched_at: new Date().toISOString(),
      total: unique.length,
      articles: unique,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
