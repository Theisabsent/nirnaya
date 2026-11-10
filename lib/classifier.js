const departmentRules = [
  { department: 'Water', words: ['water', 'pipe', 'pipeline', 'leak', 'sewer', 'drain', 'flood'] },
  { department: 'Electricity', words: ['electric', 'power', 'light', 'transformer', 'wire', 'outage'] },
  { department: 'Infrastructure', words: ['road', 'bridge', 'pothole', 'sidewalk', 'building', 'traffic'] },
  { department: 'Waste Management', words: ['garbage', 'waste', 'trash', 'rubbish', 'dump', 'collection'] },
  { department: 'Sanitation', words: ['sanitation', 'toilet', 'clean', 'hygiene', 'mosquito'] },
  { department: 'Public Safety', words: ['safety', 'unsafe', 'fire', 'accident', 'danger', 'collapse'] },
];

const criticalTerms = ['collapse', 'burst', 'fire', 'life-threatening', 'electrocution', 'major leak', 'injured', 'emergency'];
const highTerms = ['dangerous', 'exposed wire', 'overflow', 'blocked road', 'contaminated', 'structural crack'];

export function classifyComplaint(text = '', category = '') {
  const normalized = `${category} ${text}`.toLowerCase();
  const match = departmentRules.find((rule) => rule.words.some((word) => normalized.includes(word)));
  const urgency = criticalTerms.some((word) => normalized.includes(word))
    ? 'Critical'
    : highTerms.some((word) => normalized.includes(word))
      ? 'High'
      : /garbage|routine|streetlight|pothole|cleanup/.test(normalized)
        ? 'Medium'
        : 'Low';
  const slaHours = { Critical: 0, High: 6, Medium: 48, Low: 120 }[urgency];

  return {
    department: match?.department ?? category ?? 'Infrastructure',
    urgency,
    slaHours,
    confidence: match ? 0.94 : 0.81,
    pipeline: ['Submitted', 'AI Categorized', 'Department Assigned'],
  };
}
