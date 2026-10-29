const paths = {
  arrow: 'M7 17 17 7M7 7h10v10',
  down: 'm6 9 6 6 6-6',
  back: 'm12 5-7 7 7 7M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
}

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}
