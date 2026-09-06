/** Контент из JSON содержит разметку вроде <b>s</b>. Источник контролируем мы. */
export function Html({ as: Tag = "span", html, className }: { as?: keyof React.JSX.IntrinsicElements; html: string; className?: string }) {
  const T = Tag as "span";
  return <T className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
