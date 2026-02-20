// Vercel Serverless Function: 기사 페이지에서 기자명+이메일 추출
// POST /api/journalist  body: { urls: ["https://...article/123", ...] }
// 각 기사 페이지의 meta 태그에서 기자명, 이메일을 추출하여 반환
// 동명이인(김지원 등)은 이메일로 구분

// 김지원 동명이인 이메일 매핑
const NAME_OVERRIDES = {
  "김지원": {
    "bella@tenasia.co.kr": "김지원A",
    "one@tenasia.co.kr": "김지원B",
  },
};

async function extractJournalist(url) {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TenAsiaMonitor/2.0)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!resp.ok) return { url, author: "", email: "" };
    const html = await resp.text();

    // meta 태그에서 기자명 추출
    const authorMatch = html.match(/<meta\s+property="dable:author"\s+content="([^"]+)"/);
    let author = authorMatch ? authorMatch[1].trim() : "";

    // 이메일 추출 (tenten@는 사이트 공용이므로 제외)
    const emails = (html.match(/[\w.-]+@tenasia\.co\.kr/g) || [])
      .filter(e => e !== "tenten@tenasia.co.kr");
    const email = emails[0] || "";

    // 동명이인 처리
    if (author && NAME_OVERRIDES[author] && email) {
      author = NAME_OVERRIDES[author][email] || author;
    }

    return { url, author, email };
  } catch {
    return { url, author: "", email: "" };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { urls } = req.body || {};
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls 배열이 필요합니다" });
  }

  // 최대 80개로 제한 (Vercel 타임아웃 방지)
  const limitedUrls = urls.slice(0, 80);

  try {
    // 10개씩 배치로 병렬 요청 (서버 부하 방지)
    const batchSize = 10;
    const results = [];
    for (let i = 0; i < limitedUrls.length; i += batchSize) {
      const batch = limitedUrls.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((url) => extractJournalist(url))
      );
      batchResults.forEach((r) => {
        if (r.status === "fulfilled") results.push(r.value);
      });
    }

    // URL → { author, email } 매핑
    const mapping = {};
    results.forEach(({ url, author, email }) => {
      if (author) mapping[url] = { author, email };
    });

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");

    return res.status(200).json({
      success: true,
      total: Object.keys(mapping).length,
      mapping,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
