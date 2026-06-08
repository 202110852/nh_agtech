# 스테이블 퓨전 UI 목업

농가 직송 기반 주문·배송·고객 관리 플랫폼의 **농가 관리 UI 목업**입니다.  
소비자 주문은 NH 씽씽몰에서 처리하며, 본 목업은 농가의 주문·배송·CRM 관리에 집중합니다.  
실제 API, 우체국·NH 연동 없이 화면 전환과 정적 데이터만 동작합니다.

## 주요 화면

- **대시보드** (`/`) — KPI, 최근 주문, 우체국 간편접수 바로가기
- **주문 관리** (`/orders`) — 상태별 주문 필터
- **배송 관리** (`/delivery`) — 우체국 간편 사전 접수
- **고객 관리** (`/crm`) — 고객 목록·구매 이력
- **설정** (`/settings`) — 요금제, NH 연동 상태

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 빌드

```bash
npm run build
npm run preview
```

## 배포

### Vercel

1. [vercel.com](https://vercel.com)에서 GitHub 저장소 연결
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy

`vercel.json`에 SPA 라우팅 설정이 포함되어 있습니다.

### Netlify

1. [netlify.com](https://netlify.com)에서 저장소 연결
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

`public/_redirects`에 SPA 라우팅 설정이 포함되어 있습니다.

## 디자인

- Primary: `#1b7e3c`
- 모바일 우선 반응형 (하단 탭 / 데스크탑 사이드바)
- 폰트: Pretendard
