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
2. REST API 키의 Redirect URI에 **Supabase 콜백만** 등록합니다.
   - `https://pfysjhabkqwfytzpsbom.supabase.co/auth/v1/callback`
3. REST API 키에서 **Client Secret을 활성화**하고 값을 복사합니다.
4. [카카오 로그인] → [동의항목]에서 **닉네임**(`profile_nickname`), **프로필 사진**(`profile_image`)을 [설정]으로 켜 둡니다. 필수·선택 어느 쪽이든 됩니다. `account_email`은 비즈 앱이 아니면 요청하지 않습니다.
5. Supabase Dashboard → Authentication → Providers → Kakao를 켭니다.
   - Client ID: 카카오 REST API 키
   - Client Secret: 카카오 Client Secret
   - 이메일 없이 로그인 허용(Allow users without an email): ON (`account_email`을 안 쓰면 필수)
6. Authentication → URL Configuration
   - Site URL: `https://farmassi.kr`
   - Redirect URLs: `http://localhost:5173/**`, `https://farmassi.kr/**`, `https://www.farmassi.kr/**`

7. 배송지 검색용 **네이버 지도**를 켭니다.
   - [네이버 클라우드](https://console.ncloud.com) → Maps → Application에서 Dynamic Map, Geocoding, Reverse Geocoding을 선택합니다.
   - Web 서비스 URL: `http://localhost`, `http://farmassi.kr`
   - Client ID는 `.env.local`의 `VITE_NAVER_MAP_CLIENT_ID`에 넣습니다.
   - Client Secret은 프론트에 넣지 말고 Edge Function 시크릿 `NAVER_MAP_CLIENT_SECRET`으로 등록합니다.

8. Authentication → Providers → Email에서 **공개 회원가입은 끄고**, 관리자 계정은 Dashboard에서 직접 생성합니다.
9. SQL 또는 Table Editor로 해당 사용자의 `profiles.role` 을 `admin` 으로 변경합니다.

```sql
update public.profiles
   set role = 'admin'
 where id = '<auth user uuid>';
```

10. (선택) 웹 푸시용 VAPID 비밀키를 Edge Function 시크릿으로 등록합니다.

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
