#!/usr/bin/env python3
"""
텐아시아 기사 모니터링 & 수집 도구
====================================
텐아시아(tenasia.co.kr)에서 기사를 자동으로 수집하고
키워드별로 필터링하여 CSV/JSON으로 저장합니다.

사용법:
  1. 필요 패키지 설치: pip install requests beautifulsoup4 schedule
  2. 아래 KEYWORDS 리스트에 모니터링할 키워드를 추가
  3. 실행: python tenasia_monitor.py

주요 기능:
  - 카테고리별 최신 기사 수집 (뮤직, 드라마, 연예가화제 등)
  - 키워드 기반 필터링 (아티스트명, 소속사명 등)
  - CSV & JSON 자동 저장
  - 중복 기사 자동 제거
  - 스케줄링 (매 30분마다 자동 수집)
  - 트렌드 리포트 자동 생성
"""

import requests
from bs4 import BeautifulSoup
import json
import csv
import os
import re
from datetime import datetime, timedelta
from collections import Counter
from urllib.parse import urljoin

# ============================================================
# ⚙️ 설정 - 여기를 수정하세요!
# ============================================================

# 모니터링할 키워드 (아티스트명, 소속사명, 프로그램명 등)
KEYWORDS = [
    "BTS", "방탄소년단", "아이브", "IVE", "뉴진스", "NewJeans",
    "스트레이키즈", "에스파", "aespa", "세븐틴", "SEVENTEEN",
    "블랙핑크", "BLACKPINK", "아이들", "(G)I-DLE",
    "하이브", "SM", "JYP", "YG", "카카오",
    # 원하는 키워드를 추가하세요
]

# 수집할 카테고리 URL
CATEGORIES = {
    "연예가화제": "https://www.tenasia.co.kr/topic",
    "뮤직": "https://www.tenasia.co.kr/music",
    "드라마예능": "https://www.tenasia.co.kr/tv-drama",
    "영화": "https://www.tenasia.co.kr/movie",
    "엔터비즈": "https://www.tenasia.co.kr/enterbiz",
}

# 데이터 저장 경로
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CSV_FILE = os.path.join(DATA_DIR, "articles.csv")
JSON_FILE = os.path.join(DATA_DIR, "articles.json")
REPORT_FILE = os.path.join(DATA_DIR, "trend_report.json")

# 수집 간격 (분)
INTERVAL_MINUTES = 30

# 요청 헤더
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}

# ============================================================
# 핵심 기능
# ============================================================

def ensure_data_dir():
    """데이터 디렉토리 생성"""
    os.makedirs(DATA_DIR, exist_ok=True)


def load_existing_articles():
    """기존에 수집된 기사 목록 로드"""
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def get_existing_urls(articles):
    """이미 수집된 URL 세트 반환"""
    return set(a.get("url", "") for a in articles)


def fetch_category_page(category_name, url):
    """카테고리 페이지에서 기사 목록 수집"""
    articles = []
    try:
        print(f"  📡 [{category_name}] 페이지 수집 중... {url}")
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # 기사 링크 추출 (tenasia.co.kr/article/ 패턴)
        for link in soup.find_all("a", href=True):
            href = link.get("href", "")
            full_url = urljoin(url, href)

            if "/article/" not in full_url:
                continue

            # 제목 추출
            title = ""
            # 제목이 될 수 있는 요소들 탐색
            heading = link.find(["h1", "h2", "h3", "h4", "h5", "strong"])
            if heading:
                title = heading.get_text(strip=True)
            elif link.get_text(strip=True):
                title = link.get_text(strip=True)

            if not title or len(title) < 5:
                continue

            # 이미지 URL 추출
            img = link.find("img")
            thumbnail = img.get("src", "") if img else ""

            articles.append({
                "title": title,
                "url": full_url,
                "category": category_name,
                "thumbnail": thumbnail,
            })

        print(f"  ✅ [{category_name}] {len(articles)}개 기사 발견")

    except Exception as e:
        print(f"  ❌ [{category_name}] 수집 실패: {e}")

    return articles


def fetch_article_detail(url):
    """개별 기사 상세 내용 수집"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # 본문 텍스트 추출 (일반적인 기사 본문 선택자)
        content = ""
        # 다양한 선택자 시도
        for selector in ["article", ".article-body", ".article-content",
                         "#article-body", ".news-body", ".entry-content",
                         ".post-content", "[itemprop='articleBody']"]:
            body = soup.select_one(selector)
            if body:
                content = body.get_text(separator="\n", strip=True)
                break

        if not content:
            # fallback: <p> 태그 모아서 추출
            paragraphs = soup.find_all("p")
            content = "\n".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20)

        # 기자 이름 추출
        journalist = ""
        journalist_match = re.search(r"(\S+)\s*텐아시아\s*기자", content)
        if journalist_match:
            journalist = journalist_match.group(1)

        # 날짜 추출
        date_str = ""
        time_tag = soup.find("time")
        if time_tag:
            date_str = time_tag.get("datetime", time_tag.get_text(strip=True))
        if not date_str:
            # meta 태그에서 시도
            meta_date = soup.find("meta", {"property": "article:published_time"})
            if meta_date:
                date_str = meta_date.get("content", "")

        return {
            "content_preview": content[:500] if content else "",
            "journalist": journalist,
            "published_date": date_str,
        }

    except Exception as e:
        print(f"    ⚠️ 상세 수집 실패: {e}")
        return {"content_preview": "", "journalist": "", "published_date": ""}


def match_keywords(title, content_preview, keywords):
    """키워드 매칭 - 제목이나 본문에 포함된 키워드 반환"""
    text = (title + " " + content_preview).upper()
    matched = []
    for kw in keywords:
        if kw.upper() in text:
            matched.append(kw)
    return matched


def collect_all_articles(fetch_details=True):
    """전체 카테고리에서 기사 수집"""
    print(f"\n{'='*60}")
    print(f"🔍 텐아시아 기사 수집 시작 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    existing_articles = load_existing_articles()
    existing_urls = get_existing_urls(existing_articles)
    new_articles = []

    for cat_name, cat_url in CATEGORIES.items():
        raw_articles = fetch_category_page(cat_name, cat_url)

        for article in raw_articles:
            if article["url"] in existing_urls:
                continue

            # 상세 정보 수집 (선택적)
            if fetch_details:
                print(f"    📖 상세 수집: {article['title'][:40]}...")
                details = fetch_article_detail(article["url"])
                article.update(details)

            # 키워드 매칭
            matched = match_keywords(
                article.get("title", ""),
                article.get("content_preview", ""),
                KEYWORDS
            )
            article["matched_keywords"] = matched
            article["collected_at"] = datetime.now().isoformat()

            new_articles.append(article)
            existing_urls.add(article["url"])

    # 기존 데이터와 합치기
    all_articles = existing_articles + new_articles

    print(f"\n📊 수집 결과: 신규 {len(new_articles)}개 / 전체 {len(all_articles)}개")

    return all_articles, new_articles


def save_to_json(articles):
    """JSON 파일로 저장"""
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON 저장: {JSON_FILE}")


def save_to_csv(articles):
    """CSV 파일로 저장"""
    if not articles:
        return

    fieldnames = [
        "title", "url", "category", "matched_keywords",
        "journalist", "published_date", "collected_at",
        "content_preview", "thumbnail"
    ]

    with open(CSV_FILE, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for article in articles:
            row = article.copy()
            # 리스트를 문자열로 변환
            if isinstance(row.get("matched_keywords"), list):
                row["matched_keywords"] = ", ".join(row["matched_keywords"])
            writer.writerow(row)
    print(f"💾 CSV 저장: {CSV_FILE}")


def generate_trend_report(articles):
    """트렌드 리포트 생성"""
    print(f"\n{'='*60}")
    print(f"📈 트렌드 리포트 생성 중...")
    print(f"{'='*60}")

    now = datetime.now()
    week_ago = now - timedelta(days=7)

    # 이번 주 기사만 필터
    recent = []
    for a in articles:
        collected = a.get("collected_at", "")
        if collected:
            try:
                dt = datetime.fromisoformat(collected)
                if dt >= week_ago:
                    recent.append(a)
            except:
                recent.append(a)  # 날짜 파싱 실패 시 포함
        else:
            recent.append(a)

    # 1. 키워드별 언급 횟수
    keyword_counts = Counter()
    for a in recent:
        for kw in a.get("matched_keywords", []):
            keyword_counts[kw] += 1

    # 2. 카테고리별 기사 수
    category_counts = Counter()
    for a in recent:
        category_counts[a.get("category", "기타")] += 1

    # 3. 기자별 기사 수
    journalist_counts = Counter()
    for a in recent:
        j = a.get("journalist", "")
        if j:
            journalist_counts[j] += 1

    # 4. 일별 기사 수
    daily_counts = Counter()
    for a in recent:
        collected = a.get("collected_at", "")
        if collected:
            try:
                day = datetime.fromisoformat(collected).strftime("%Y-%m-%d")
                daily_counts[day] += 1
            except:
                pass

    # 리포트 데이터
    report = {
        "generated_at": now.isoformat(),
        "period": f"{week_ago.strftime('%Y-%m-%d')} ~ {now.strftime('%Y-%m-%d')}",
        "total_articles": len(recent),
        "top_keywords": keyword_counts.most_common(20),
        "category_breakdown": dict(category_counts),
        "top_journalists": journalist_counts.most_common(10),
        "daily_article_count": dict(sorted(daily_counts.items())),
        "keyword_articles": {},  # 키워드별 대표 기사
    }

    # 키워드별 대표 기사 (상위 5개 키워드)
    for kw, count in keyword_counts.most_common(5):
        kw_articles = [
            {"title": a["title"], "url": a["url"], "category": a.get("category", "")}
            for a in recent
            if kw in a.get("matched_keywords", [])
        ][:5]
        report["keyword_articles"][kw] = kw_articles

    # 저장
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"💾 트렌드 리포트 저장: {REPORT_FILE}")

    # 콘솔 출력
    print(f"\n📊 주간 트렌드 리포트 ({report['period']})")
    print(f"   총 수집 기사: {report['total_articles']}건")

    print(f"\n🔥 TOP 키워드:")
    for kw, count in keyword_counts.most_common(10):
        bar = "█" * count
        print(f"   {kw:15s} | {bar} ({count}건)")

    print(f"\n📂 카테고리별:")
    for cat, count in category_counts.most_common():
        print(f"   {cat:10s} | {count}건")

    print(f"\n✍️ 활발한 기자:")
    for j, count in journalist_counts.most_common(5):
        print(f"   {j} ({count}건)")

    return report


def run_once(fetch_details=True):
    """한번 실행"""
    ensure_data_dir()
    all_articles, new_articles = collect_all_articles(fetch_details=fetch_details)
    save_to_json(all_articles)
    save_to_csv(all_articles)
    report = generate_trend_report(all_articles)

    # 키워드 매칭된 신규 기사 알림
    keyword_matched = [a for a in new_articles if a.get("matched_keywords")]
    if keyword_matched:
        print(f"\n🔔 키워드 매칭 신규 기사 {len(keyword_matched)}건:")
        for a in keyword_matched:
            kws = ", ".join(a["matched_keywords"])
            print(f"   [{kws}] {a['title']}")
            print(f"   → {a['url']}")
    else:
        print(f"\n💤 키워드 매칭 신규 기사 없음")

    return report


def run_scheduled():
    """스케줄링 모드로 실행"""
    try:
        import schedule
        import time

        print(f"⏰ 스케줄러 시작: {INTERVAL_MINUTES}분 간격으로 수집")
        print(f"   종료하려면 Ctrl+C를 누르세요\n")

        # 즉시 1회 실행
        run_once()

        # 스케줄 등록
        schedule.every(INTERVAL_MINUTES).minutes.do(run_once)

        while True:
            schedule.run_pending()
            time.sleep(1)

    except ImportError:
        print("⚠️ schedule 패키지가 없습니다. pip install schedule 로 설치하세요.")
        print("   단일 실행 모드로 전환합니다.\n")
        run_once()
    except KeyboardInterrupt:
        print("\n\n🛑 스케줄러 종료")


# ============================================================
# 실행
# ============================================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--schedule":
        run_scheduled()
    elif len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # 상세 수집 없이 빠르게 (제목+URL만)
        run_once(fetch_details=False)
    else:
        # 기본: 상세 수집 포함 1회 실행
        run_once(fetch_details=True)
