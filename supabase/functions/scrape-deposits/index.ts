import { corsHeaders, json } from '../_shared/http.ts'

/**
 * Cron placeholder for account scraping.
 * Providers: GND, Hecto Financial, BankSalad, CodeF.
 * Schedule later with: every 10 minutes.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return json(
    {
      implemented: false,
      message: '계좌 스크래핑은 아직 구현되지 않았습니다. confirm-deposit을 공통 진입점으로 사용하세요.',
      providers: ['gnd', 'hecto', 'banksalad', 'codef'],
    },
    501,
  )
})
