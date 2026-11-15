import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { COMMON } from '../text.js'

// Where am I: "Topics › Mean, median and mode" (Bootstrap breadcrumb, src/styles/_bootstrap.scss).
//   items: [{ to, label }]; an item without `to` is the current page (aria-current).
export default function Breadcrumb({ items, className = '' }) {
  const tx = useText(COMMON)
  return (
    <nav aria-label={tx.breadcrumb} className={`crumbs ${className}`}>
      <ol className="breadcrumb">
        {items.map((it, k) =>
          it.to ? (
            <li key={k} className="breadcrumb-item">
              <Link to={it.to}>{it.label}</Link>
            </li>
          ) : (
            <li key={k} className="breadcrumb-item active" aria-current="page">
              {it.label}
            </li>
          ),
        )}
      </ol>
    </nav>
  )
}
