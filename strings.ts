export function toEnvarCase(s: string) {
  var c = null
  var p = null
  const words = []
  var buf = ''

  for (var i = 0; i < s.length; ++i) {
    c = s[i]
    if (c >= 'a' && c <= 'z') {
      if (p != null) {
        p = null
      }
      buf += c.toUpperCase()
    } else if (c >= 'A' && c <= 'Z') {
      if (p == null) {
        if (buf.length > 0) {
          words.push(buf)
        }
        buf = c
      } else {
        buf += c
      }
      p = c
    } else if (c >= '0' && c <= '9'){
      buf += c
    } else {
      if (buf.length > 0) {
        words.push(buf)
        buf = ''
      } else {
        words.push('')
      }
      if (p != null) {
        p = null
      }
    }
  }

  if (buf.length > 0) {
    words.push(buf)
  }

  return words.join('_')
}
