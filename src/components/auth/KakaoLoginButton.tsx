interface KakaoLoginButtonProps {
  disabled?: boolean
  onClick: () => void
}

export function KakaoLoginButton({ disabled, onClick }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="카카오 로그인"
      className="relative flex h-[45px] w-full items-center justify-center rounded-[12px] bg-[#FEE500] text-[15px] font-medium text-black/85 disabled:opacity-50"
      onClick={onClick}
    >
      <span className="absolute left-3.5 flex size-[18px] items-center justify-center">
        <KakaoSymbol />
      </span>
      카카오 로그인
    </button>
  )
}

function KakaoSymbol() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        fill="#000"
        fillRule="evenodd"
        d="M9 1.2C4.306 1.2.5 4.29.5 8.1c0 2.4 1.56 4.51 3.93 5.73L3.4 17.4c-.05.2.16.36.34.26l4.18-2.77c.35.05.71.07 1.08.07 4.694 0 8.5-3.09 8.5-6.9S13.694 1.2 9 1.2Z"
      />
    </svg>
  )
}
