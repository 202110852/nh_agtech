import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { safeHttpUrl } from '../../lib/format'
import {
  farmLandingUrl,
  farmProductLines,
  farmShareLead,
  hasFarmShareDetails,
  telHref,
  type FarmShareInput,
} from '../../lib/farmShareText'

export function FarmShareMessage({ farm }: { farm: FarmShareInput }) {
  if (!hasFarmShareDetails(farm)) return null

  const lead = farmShareLead(farm.description)
  const products = farmProductLines(farm.product_summary)
  const phoneHref = telHref(farm.phone)
  const mobileHref = telHref(farm.mobile_phone)
  const mapHref = safeHttpUrl(farm.map_url)
  const slug = farm.slug.trim()

  return (
    <Card className="space-y-3 text-sm leading-7 text-gray-800">
      {lead ? <p className="whitespace-pre-wrap">{lead}</p> : null}
      {farm.name.trim() ? <p>"{farm.name.trim()}" 입니다.</p> : null}
      {products.length > 0 ? (
        <ul className="space-y-0.5">
          {products.map((item) => (
            <li key={item}>🍇 {item}</li>
          ))}
        </ul>
      ) : null}
          {slug ? (
            <div>
              <p>👇 주문하러가기[클릭] 👇</p>
              <Link to={`/farm/${slug}`} className="break-all font-medium text-primary">
                {farmLandingUrl(slug)}
              </Link>
            </div>
          ) : null}
      {farm.phone?.trim() || farm.mobile_phone?.trim() ? (
        <div>
          <p>문의전화</p>
          {farm.phone?.trim() ? (
            <p>
              ☎️{' '}
              {phoneHref ? (
                <a href={phoneHref} className="font-medium text-primary">
                  {farm.phone.trim()}
                </a>
              ) : (
                farm.phone.trim()
              )}
            </p>
          ) : null}
          {farm.mobile_phone?.trim() ? (
            <p>
              📱{' '}
              {mobileHref ? (
                <a href={mobileHref} className="font-medium text-primary">
                  {farm.mobile_phone.trim()}
                </a>
              ) : (
                farm.mobile_phone.trim()
              )}
            </p>
          ) : null}
        </div>
      ) : null}
      {farm.address?.trim() || mapHref ? (
        <div>
          {farm.address?.trim() ? <p>▶️ 위치 : {farm.address.trim()}</p> : null}
          {mapHref ? (
            <p>
              ▶️ 길안내 :{' '}
              <a href={mapHref} target="_blank" rel="noreferrer" className="break-all font-medium text-primary">
                {mapHref}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
