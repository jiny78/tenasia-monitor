# 🔥 TenAsia Monitor — 텐아시아 기사 모니터링 & 트렌드 리포트

텐아시아(tenasia.co.kr) 기사를 자동 수집하고, K-Pop/K-엔터 키워드별 트렌드를 분석하는 도구입니다.

---

## 📦 구성

```
tenasia-monitor/
├── scripts/
│   └── tenasia_monitor.py    # 기사 수집 & 트렌드 분석 스크립트
├── dashboard/
│   └── tenasia_trend_dashboard.jsx  # React 트렌드 대시보드
├── data/                     # 수집 데이터 저장 디렉토리
│   └── .gitkeep
├── requirements.txt
└── README.md
```

## 🚀 빠른 시작

### 1. 설치

```bash
git clone https://github.com/YOUR_USERNAME/tenasia-monitor.git
cd tenasia-monitor
pip install -r requirements.txt
```

### 2. 키워드 설정

`scripts/tenasia_monitor.py`를 열어서 `KEYWORDS` 리스트를 수정하세요:

```python
KEYWORDS = [
    "BTS", "방탄소년단", "아이브", "IVE", "뉴진스", "NewJeans",
    "스트레이키즈", "에스파", "aespa", "세븐틴", "SEVENTEEN",
    # 원하는 키워드를 추가하세요
]
```

### 3. 실행

```bash
# 1회 실행 (상세 수집)
python scripts/tenasia_monitor.py

# 빠른 실행 (제목 + URL만)
python scripts/tenasia_monitor.py --quick

# 자동 반복 (30분 간격)
python scripts/tenasia_monitor.py --schedule
```

### 4. 출력 파일

| 파일 | 설명 |
|------|------|
| `data/articles.json` | 전체 수집 기사 (JSON) |
| `data/articles.csv` | 엑셀 호환 데이터 (CSV) |
| `data/trend_report.json` | 주간 트렌드 리포트 |

---

## 📊 대시보드

`dashboard/tenasia_trend_dashboard.jsx`는 React 컴포넌트입니다.

**사용법:**
1. 스크립트를 실행하여 `trend_report.json` 생성
2. 대시보드의 "📂 JSON 업로드" 버튼으로 파일 업로드
3. 실시간 데이터로 시각화 확인

**주요 기능:**
- 키워드별 언급 횟수 차트
- 일별 기사 추이 그래프
- 카테고리 분포 (파이차트)
- 기자별 활동량
- 키워드 클릭 시 관련 기사 조회

---

## ⚙️ 커스터마이징

### 수집 카테고리 변경

```python
CATEGORIES = {
    "연예가화제": "https://www.tenasia.co.kr/topic",
    "뮤직": "https://www.tenasia.co.kr/music",
    "드라마예능": "https://www.tenasia.co.kr/tv-drama",
    "영화": "https://www.tenasia.co.kr/movie",
    "엔터비즈": "https://www.tenasia.co.kr/enterbiz",
}
```

### 수집 간격 변경

```python
INTERVAL_MINUTES = 30  # 원하는 분 단위로 변경
```

### 데이터 저장 경로 변경

```python
DATA_DIR = "./data"  # 원하는 경로로 변경
```

---

## 🔧 기술 스택

- **수집**: Python, requests, BeautifulSoup4
- **스케줄링**: schedule
- **대시보드**: React, Recharts
- **데이터 포맷**: JSON, CSV

## 📝 License

MIT License
