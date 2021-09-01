export function isNumeral(s: string): boolean {
  if (!s) {
    return false
  }

  return s >= '0' && s <= '9'
}

export function toEnvarCase(s: string): string {
  let c = null
  let p = null
  const words: string[] = []
  let buf = ''

  for (let i = 0; i < s.length; ++i) {
    c = s[i]
    if (c >= 'a' && c <= 'z') {
      if (p !== null) {
        p = null
      }
      buf += c.toUpperCase()
    } else if (c >= 'A' && c <= 'Z') {
      if (p === null && (i === 0 || !isNumeral(s[i - 1]))) {
        if (buf.length > 0) {
          words.push(buf)
        }
        buf = c
      } else {
        buf += c
      }
      p = c
    } else if (isNumeral(c)) {
      buf += c
    } else {
      if (buf.length > 0) {
        words.push(buf)
        buf = ''
      } else {
        words.push('')
      }
      if (p !== null) {
        p = null
      }
    }
  }

  if (buf.length > 0) {
    words.push(buf)
  }

  return words.join('_')
}

export function resolveShellTemplate(s: string): string {
  return ''
}