// Vercel Serverless Function: 텐아시아 하이브리드 기사 수집
// - 오늘 + 어제: RSS 피드 (시간 정보 포함 → 시간별 그래프)
// - 과거 13일:   사이트맵 (날짜별 실제 50~60건 반영)
//
// [핵심 수정]
// 사이트맵 href가 절대URL(https://www.tenasia.co.kr/article/...) 형태임을 반영

const KEYWORDS = [
  "BTS", "방탄소년단", "아이브", "IVE", "뉴진스", "NewJeans",
  "스트레이키즈", "에스파", "aespa", "세븐틴", "SEVENTEEN",
  "블랙핑크", "BLACKPINK", "아이들", "(G)I-DLE",
  "하이브", "SM", "JYP", "YG", "카카오",
  "임영웅", "이찬원", "영탁", "정동원", "장민호",
  "NCT", "엑소", "EXO", "샤이니", "SHINee",
  "트와이스", "TWICE", "레드벨벳",
];

const RSS_FEEDS = {
  "뮤직": "https://www.tenasia.co.kr/rss/music/",
  "연예가화제": "https://www.tenasia.co.kr/rss/topic/",
  "드라마예능": "https://www.tenasia.co.kr/rss/tv-drama/",
  "영화": "https://www.tenasia.co.kr/rss/movie/",
};

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

// KST 기준 YYYY-MM-DD 반환
function toKSTDateStr(date) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// YYYY/MM/DD 경로 형식 (KST 기준)
function toKSTDatePath(date) {
  return toKSTDateStr(date).replace(/-/g, "/");
}

// RSS XML 파싱
function parseRssXml(xml, category) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(
        new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`)
      );
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const title = get("title");
    const link = get("link");
    const author = get("author");
    const pubDate = get("pubDate");
    if (title && link) {
      items.push({
        title,
        url: link,
        category,
        journalist: author,
        collected_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        matched_keywords: matchKeywords(title),
      });
    }
  }
  return items;
}

// 사이트맵 HTML 파싱 → 기사 링크 + 제목 추출
// href는 절대URL: https://www.tenasia.co.kr/article/...
function parseSitemapHtml(html, dateStr) {
  const articles = [];
  // 절대URL 패턴 매칭
  const linkRegex = /<a\s+href="(https:\/\/www\.tenasia\.co\.kr\/article\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();
    if (!rawTitle || rawTitle.length < 3) continue;
    // 사이트맵엔 시간 정보 없음 → 정오(12:00 KST)로 설정
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
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const now = new Date();
    const todayKST = toKSTDateStr(now);       // KST 기준 오늘
    const allArticles = [];

    // ① 오늘: RSS 피드 (시간 정보 포함 → 시간별 차트)
    const rssResults = await Promise.allSettled(
      Object.entries(RSS_FEEDS).map(async ([category, url]) => {
        const resp = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; TenAsiaMonitor/2.0)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) return [];
        const xml = await resp.text();
        const items = parseRssXml(xml, category);
        // KST 기준 오늘 날짜인 기사만 필터
        return items.filter((a) => toKSTDateStr(new Date(a.collected_at)) === todayKST);
      })
    );

    const rssUrls = new Set();
    rssResults.forEach((r) => {
      if (r.status === "fulfilled") {
        r.value.forEach((a) => {
          allArticles.push(a);
          rssUrls.add(a.url);
        });
      }
    });

    // ② 과거 13일: 사이트맵 (날짜별 실제 전체 기사 수집)
    const dateList = [];
    for (let i = 1; i <= 13; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dateList.push({
        dateStr: toKSTDateStr(d),
        datePath: toKSTDatePath(d),
      });
    }

    const sitemapResults = await Promise.allSettled(
      dateList.map(async ({ dateStr, datePath }) => {
        const url = `https://www.tenasia.co.kr/sitemap/${datePath}/`;
        const resp = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TenAsiaMonitor/2.0)",
            Accept: "text/html,application/xhtml+xml",
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) return [];
        const html = await resp.text();
        return parseSitemapHtml(html, dateStr);
      })
    );

    sitemapResults.forEach((r) => {
      if (r.status === "fulfilled") {
        r.value.forEach((a) => {
          if (!rssUrls.has(a.url)) allArticles.push(a); // RSS 중복 제외
        });
      }
    });

    // 날짜순 정렬 (최신 먼저)
    allArticles.sort((a, b) => new Date(b.collected_at) - new Date(a.collected_at));

    // URL 기준 중복 제거
    const seen = new Set();
    const unique = allArticles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    res.status(200).json({
      success: true,
      fetched_at: now.toISOString(),
      source: "hybrid(rss+sitemap)",
      today_kst: todayKST,
      total: unique.length,
      articles: unique,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
