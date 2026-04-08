export const REGIONS = [
  "Luxembourg City",
  "Esch-sur-Alzette",
  "Differdange",
  "Dudelange",
  "Ettelbruck",
  "Diekirch",
  "Echternach",
  "Remich",
  "Grevenmacher",
  "Wiltz",
  "Clervaux",
  "Vianden",
  "Mersch",
  "Mondorf-les-Bains",
  "Moselle",
  "Nordstad",
  "Redange",
  "Capellen",
] as const;

export type Region = (typeof REGIONS)[number];

export const INTERESTS = [
  "Hiking",
  "Cycling",
  "Photography",
  "Cooking",
  "Music",
  "Art",
  "Reading",
  "Sports",
  "Gaming",
  "Yoga",
  "Dancing",
  "Wine tasting",
  "Languages",
  "History",
  "Technology",
  "Gardening",
  "Board games",
  "Volunteering",
  "Travel",
  "Film",
] as const;

export const EXPERTISE_AREAS = [
  "Employment",
  "Housing",
  "Healthcare",
  "Schools & childcare",
  "Administrative procedures",
  "Culture & social life",
  "Outdoor activities",
  "Language learning",
  "Partner experience",
  "Finance & taxes",
  "Public transport",
  "Volunteering",
] as const;

export const LANGUAGES = [
  "English",
  "French",
  "German",
  "Luxembourgish",
  "Portuguese",
  "Italian",
  "Spanish",
  "Dutch",
  "Chinese",
  "Arabic",
  "Russian",
  "Turkish",
  "Polish",
  "Romanian",
] as const;

export const EVENT_CATEGORIES = [
  "Social",
  "Cultural",
  "Sports",
  "Language exchange",
  "Walking tour",
  "Workshop",
  "Family",
  "Professional networking",
  "Volunteering",
  "Other",
] as const;

export const FAMILY_SITUATIONS = [
  "Single",
  "Couple without children",
  "Family with young children",
  "Family with school-age children",
  "Family with teenagers",
  "Single parent",
  "Retired",
] as const;

export const MEETING_STYLES = [
  "Coffee/café",
  "Walk/outdoor",
  "Activity-based",
  "Online first",
  "Flexible",
] as const;
