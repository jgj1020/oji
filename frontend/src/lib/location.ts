export function locationErrorMessage(code: number): string {
  if (code === 1) return "위치 권한이 꺼져 있어. 브라우저에서 권한을 허용하거나 지역을 입력해줘.";
  if (code === 3) return "위치 확인 시간이 초과됐어. 다시 시도하거나 지역을 입력해줘.";
  return "현재 위치를 확인하지 못했어. 다시 시도하거나 지역을 입력해줘.";
}
