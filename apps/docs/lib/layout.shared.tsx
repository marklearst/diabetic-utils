import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { LogoLockup } from './logo'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <LogoLockup size={22} />,
    },
    githubUrl: 'https://github.com/marklearst/glucoseiq',
    links: [{ text: 'Docs', url: '/docs' }],
  }
}
