update public.farms
set share_text = replace(
  share_text,
  '👇 주문하러가기[클릭] 👇',
  '👇 💬 카카오톡 문의와 주문하러가기[클릭] 👇'
)
where share_text like '%👇 주문하러가기[클릭] 👇%';
