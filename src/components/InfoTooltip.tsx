'use client'

import { useState } from 'react'
import { GLOSSARY } from '@/lib/glossary'

interface InfoTooltipProps {
  term: string
  text?: string          // override do glossário
  side?: 'top' | 'bottom'
}

export function InfoTooltip({ term, text, side = 'top' }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)
  const content = text ?? GLOSSARY[term]
  if (!content) return null

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-slate-500 hover:text-slate-300 cursor-help text-xs leading-none select-none">ⓘ</span>
      {visible && (
        <span
          className={`
            absolute z-50 w-64 px-3 py-2 text-xs text-slate-200 bg-slate-800 border border-slate-600
            rounded-lg shadow-xl pointer-events-none
            ${side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}
            left-1/2 -translate-x-1/2
          `}
        >
          <span className="font-semibold text-white block mb-0.5">{term}</span>
          {content}
          {/* Arrow */}
          <span
            className={`
              absolute left-1/2 -translate-x-1/2 border-4 border-transparent
              ${side === 'top'
                ? 'top-full border-t-slate-600'
                : 'bottom-full border-b-slate-600'}
            `}
          />
        </span>
      )}
    </span>
  )
}
