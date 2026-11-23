import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { StoreHeader } from './StoreHeader'
import { WhatsAppFab } from './WhatsAppFab'

type AppShellProps = {
  children: ReactNode
  kicker?: string
  showFab?: boolean
  paddedTop?: string
}

export function AppShell({
  children,
  kicker,
  showFab = true,
  paddedTop = 'pt-[7.5rem]',
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-[15px] leading-6 text-on-surface antialiased">
      <StoreHeader kicker={kicker} />
      <main className={`relative flex w-full max-w-6xl mx-auto flex-col px-4 md:px-8 pb-28 md:pb-14 ${paddedTop}`}>
        {children}
      </main>
      {showFab ? <WhatsAppFab /> : null}
      <BottomNav />
    </div>
  )
}
