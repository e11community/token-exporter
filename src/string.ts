//import { miscUtils } from '@yarnpkg/core'

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

export function replaceEnvVariables(value, { env }) {
  const regex = /\${(?<variableName>[\d\w_]+)(?<colon>:)?(?:-(?<fallback>[^}]*))?}/g;
  return value.replace(regex, (...args) => {
      const { variableName, colon, fallback } = args[args.length - 1];
      const variableExist = Object.prototype.hasOwnProperty.call(env, variableName);
      const variableValue = env[variableName];
      if (variableValue)
          return variableValue;
      if (variableExist && !colon)
          return variableValue;
      if (fallback != null)
          return fallback;
      throw new Error(`Environment variable not found (${variableName})`);
  });
}

export function resolveShellTemplate(s: string): string {
  return replaceEnvVariables(s, {
    env: process.env,
  });
}