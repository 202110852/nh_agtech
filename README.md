# 팜어시 (Farmassi)

농가별 주문 페이지, 무통장 입금, 농가 알림, 관리자 운영을 위한 주문·배송 플랫폼입니다.

## 로컬 실행

```bash
cp .env.example .env.local
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`

## 역할

- **주문자 / 농가**: 카카오 로그인
- **관리자**: 이메일 + 비밀번호 (`/admin/login`)

## 화면

- `/o/:farmSlug` — 농가 주문 페이지
- `/farm` — 농가 주문·배송 (승인된 농가)
- `/apply` — 농가 입점 신청
- `/admin` — 주문·입금·농가 전체 관리

## 처음 쓰는 순서

1. [카카오 디벨로퍼스](https://developers.kakao.com/console/app)에서 앱을 만들고 **카카오 로그인을 ON** 합니다.
2. [앱] → [플랫폼 키] → **JavaScript 키**에 웹 도메인을 등록합니다.
   - `http://localhost`
   - `https://farmassi.kr`
   - `https://www.farmassi.kr`
3. JavaScript 키와 REST API 키의 **리다이렉트 URI**를 등록합니다. 도메인과 달리 여기는 요청 주소와 같아야 합니다.
   - `http://localhost:5173/auth/callback` (로컬 Vite 포트가 다르면 그 포트)
   - `https://farmassi.kr/auth/callback`
   - `https://www.farmassi.kr/auth/callback`
4. [카카오 로그인] → [동의항목]에서 닉네임·프로필 이미지를 설정합니다.
5. `.env.local`에 JavaScript 키와 REST API 키를 넣습니다.

```bash
VITE_KAKAO_JS_KEY=카카오_JavaScript_키
KAKAO_REST_API_KEY=카카오_REST_API_키
```

6. 같은 REST API 키를 Edge Function 시크릿 `KAKAO_REST_API_KEY`로도 등록합니다. Client Secret을 켜 두었다면 함께 등록합니다.

```bash
npx supabase secrets set KAKAO_REST_API_KEY=... --project-ref pfysjhabkqwfytzpsbom
```

휴대폰 웹/PWA에서는 [카카오 JavaScript SDK 간편로그인](https://developers.kakao.com/docs/latest/ko/kakaologin/js)이 카카오톡 앱을 직접 엽니다. PC 웹은 카카오계정 로그인 화면으로 넘어갑니다.

7. Authentication → Providers → Email에서 **공개 회원가입은 끄고**, 관리자 계정은 Dashboard에서 직접 생성합니다.
8. SQL 또는 Table Editor로 해당 사용자의 `profiles.role` 을 `admin` 으로 변경합니다.

```sql
update public.profiles
   set role = 'admin'
 where id = '<auth user uuid>';
```

9. (선택) 웹 푸시용 VAPID 비밀키를 Edge Function 시크릿으로 등록합니다.

```bash
npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... --project-ref pfysjhabkqwfytzpsbom
```

웹 푸시는 브라우저 권한·iOS 홈화면 추가 여부에 따라 100% 보장되지 않습니다. 농가 페이지가 열려 있으면 Realtime 인앱 알림이 동작합니다.

## 이후 연동 (기반만 준비됨)

- 우체국 송장: `src/integrations/shipping`, Edge Function `kpost-shipment`
- 계좌 스크래핑(GND, 헥토파이낸셜, 뱅크샐러드, 코드에프): `src/integrations/deposit`, Edge Function `scrape-deposits`
- 입금 확인 공통 진입점: `confirm-deposit`

## 배포

Vercel Framework Preset: Vite, Build: `npm run build`, Output: `dist`
