import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  rightElement?: React.ReactNode
}

export function Header({ title, subtitle, showBack, backTo, rightElement }: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 md:px-6">
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted truncate">{subtitle}</p>}
        </div>
        {rightElement}
      </div>
    </header>
  )
}
