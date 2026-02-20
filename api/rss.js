// Vercel Serverless Function: 텐아시아 RSS 수집 프록시
// 브라우저 CORS 제한을 우회하여 RSS 데이터를 JSON으로 반환

const FEEDS = {
  "뮤직": "https://www.tenasia.co.kr/rss/music/",
  "연예가화제": "https://www.tenasia.co.kr/rss/topic/",
  "드라마예능": "https://www.tenasia.co.kr/rss/tv-drama/",
  "영화": "https://www.tenasia.co.kr/rss/movie/",
  "엔터비즈": "https://www.tenasia.co.kr/rss/enterbiz/",
};

// 키워드 목록
const KEYWORDS = [
  "BTS", "방탄소년단", "아이브", "IVE", "뉴진스", "NewJeans",
  "스트레이키즈", "에스파", "aespa", "세븐틴", "SEVENTEEN",
  "블랙핑크", "BLACKPINK", "아이들", "(G)I-DLE",
  "하이브", "SM", "JYP", "YG", "카카오",
];

function matchKeywords(text) {
  const upper = text.toUpperCase();
  return KEYWORDS.filter((kw) => upper.includes(kw.toUpperCase()));
}

function parseRssItems(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const title = get("title");
    const link = get("link");
    const author = get("author");
    const pubDate = get("pubDate");
    if (title && link) {
      items.push({ title, link, author, pubDate });
    }
  }
  return items;
}

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); // 5분 캐시

  try {
    const allArticles = [];

    // 모든 카테고리 RSS를 병렬로 가져오기
    const results = await Promise.allSettled(
      Object.entries(FEEDS).map(async ([category, url]) => {
        const resp = await fetch(url, {
          headers: { "User-Agent": "TenAsiaMonitor/1.0" },
        });
        if (!resp.ok) return [];
        const xml = await resp.text();
        const items = parseRssItems(xml);
        return items.map((item) => ({
          title: item.title,
          url: item.link,
          category,
          journalist: item.author,
          collected_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          matched_keywords: matchKeywords(item.title),
        }));
      })
    );

    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        allArticles.push(...r.value);
      }
    });

    // 날짜순 정렬 (최신 먼저)
    allArticles.sort((a, b) => new Date(b.collected_at) - new Date(a.collected_at));

    // 중복 제거 (URL 기준)
    const seen = new Set();
    const unique = allArticles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    res.status(200).json({
      success: true,
      fetched_at: new Date().toISOString(),
      total: unique.length,
      articles: unique,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
