export const formatDateIndonesian = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();

  // Reset hours for day comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) {
    return `Hari ini, ${timeStr}`;
  } else if (diffDays === 1) {
    return `Kemarin, ${timeStr}`;
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${timeStr}`;
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

