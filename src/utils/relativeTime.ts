/**
 * Chuyển đổi ISO string sang thời gian tương đối (Tiếng Việt)
 */
export function toRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  
  return new Date(isoString).toLocaleDateString('vi-VN');
}
