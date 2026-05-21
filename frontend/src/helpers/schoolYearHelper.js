export const getSchoolYear = (date = new Date()) => {
  // Assume school year starts in June. If month is June (5) or later, school year is currentYear-(currentYear+1)
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-based
  if (m >= 5) {
    return `${y}-${y + 1}`;
  }

  return `${y - 1}-${y}`;
};
