import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { PRIVACY_PAGE } from '../pages/text.js'

// A slim line at the foot of the pages that scroll (not under the games, which fit one screen).
export default function Footer() {
  const tx = useText(PRIVACY_PAGE)
  return (
    <footer className="site-foot">
      <Link to="/privacy">{tx.footPrivacy}</Link>
      <span aria-hidden="true">·</span>
      <Link to="/licences">{tx.footLicences}</Link>
      <span aria-hidden="true">·</span>
      <Link to="/about">{tx.footAbout}</Link>
    </footer>
  )
}
