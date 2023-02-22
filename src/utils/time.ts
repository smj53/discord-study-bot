const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

export function getCurrentKoreanTime() {
  const curr = new Date();
  const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + KR_TIME_DIFF);
}

export function getKorISOString(now: Date) {
  const kr_curr = new Date(now.getTime() + KR_TIME_DIFF);
  return kr_curr.toISOString().substring(0, 19) + "+09:00";
}
