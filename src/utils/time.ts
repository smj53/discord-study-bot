const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

export function getCurrentKoreanTime(date: Date): Date {
  const utc =
    date.getTime() + KR_TIME_DIFF + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc);
}

export function getKorISOString(date: Date): string {
  const kr_curr = new Date(date.getTime() + KR_TIME_DIFF);
  return kr_curr.toISOString().substring(0, 19) + "+09:00";
}
