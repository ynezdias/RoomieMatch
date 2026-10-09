import { Platform } from 'react-native'

export const palette = {
  canvas: '#100E11',
  surface: '#1B171C',
  ink: '#F5EEEE',
  muted: '#AEA6AB',
  primary: '#C93B4F',
  accent: '#F27886',
  primarySoft: '#342029',
  sage: '#2C2026',
  line: '#3A3038',
  dark: '#401D27',
  sand: '#282229',
  error: '#FF97A0',
}
export const displayFont = Platform.select({
  web: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  ios: 'Helvetica Neue',
  default: 'sans-serif',
})
