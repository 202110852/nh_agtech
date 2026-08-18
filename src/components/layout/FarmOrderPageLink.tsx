import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FarmOrderPageLink({ slug }: { slug: string }) {
  return (
    <Link to={`/farm/${slug}`} className="flex items-center gap-1 text-sm font-medium text-primary">
      주문 페이지
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  )
}
