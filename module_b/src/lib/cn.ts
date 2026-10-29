/** Склейка CSS-классов с отбрасыванием пустых значений. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
