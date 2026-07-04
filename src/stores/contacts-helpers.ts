export type ContactStatus = 'PENDING' | 'ANSWERED'

export function contactStatusLabel(s: ContactStatus): string {
  return s === 'ANSWERED' ? '답변완료' : '답변대기'
}

export function contactStatusTone(s: ContactStatus): 'accent' | 'info' {
  return s === 'ANSWERED' ? 'accent' : 'info'
}
