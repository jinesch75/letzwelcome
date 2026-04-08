import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Admin user ───
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@letzwelcome.lu" },
    update: {},
    create: {
      email: "admin@letzwelcome.lu",
      name: "Letzwelcome Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      gdprConsent: true,
      gdprConsentAt: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // ─── Badges ───
  const badges = [
    // Buddy badges
    { name: "Verified Buddy", description: "5+ connections with a rating of 4.0 or higher", criteria: "5+ connections, rating ≥ 4.0", type: "BUDDY" as const },
    { name: "Trail Companion", description: "Organised or joined 5+ walking tours", criteria: "5+ walking tour participations", type: "BUDDY" as const },
    { name: "Community Seed", description: "Referred 3+ clubs or volunteering opportunities", criteria: "3+ club/volunteering referrals", type: "BUDDY" as const },
    { name: "Language Companion", description: "Actively helps newcomers learn Luxembourgish", criteria: "Admin-awarded", type: "BUDDY" as const },
    { name: "Trusted Guide", description: "10+ connections with excellent rating and 12+ months active", criteria: "10+ connections, rating ≥ 4.5, 12+ months active", type: "BUDDY" as const },
    // Newcomer badges
    { name: "First Steps", description: "Completed profile and connected with a buddy within the first month", criteria: "Profile complete + first buddy connection within 30 days", type: "NEWCOMER" as const },
    { name: "Explorer", description: "Joined 3+ community events or walks", criteria: "3+ event participations", type: "NEWCOMER" as const },
    { name: "Language Learner", description: "Attending a language coffee or course", criteria: "Admin-awarded", type: "NEWCOMER" as const },
    { name: "Community Member", description: "Joined a local club through the platform", criteria: "1+ club membership", type: "NEWCOMER" as const },
    { name: "Paying it Forward", description: "Transitioned to buddy status and completed first match", criteria: "Changed to buddy role + 1 completed match", type: "NEWCOMER" as const },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
  console.log(`✅ ${badges.length} badges seeded`);

  // ─── Checklist items ───
  const checklistItems = [
    {
      titleKey: "checklist.commune.title",
      descriptionKey: "checklist.commune.description",
      category: "admin",
      order: 1,
      externalLinks: ["https://guichet.public.lu/en/citoyens/immigration/arrivee-luxembourg/declaration-arrivee.html"],
      stepsKey: "checklist.commune.steps",
    },
    {
      titleKey: "checklist.cns.title",
      descriptionKey: "checklist.cns.description",
      category: "health",
      order: 2,
      externalLinks: ["https://cns.public.lu"],
    },
    {
      titleKey: "checklist.tax.title",
      descriptionKey: "checklist.tax.description",
      category: "finance",
      order: 3,
      externalLinks: ["https://impotsdirects.public.lu"],
    },
    {
      titleKey: "checklist.transport.title",
      descriptionKey: "checklist.transport.description",
      category: "daily",
      order: 4,
      externalLinks: ["https://www.mobiliteit.lu"],
    },
    {
      titleKey: "checklist.language_vouchers.title",
      descriptionKey: "checklist.language_vouchers.description",
      category: "language",
      order: 5,
      externalLinks: ["https://www.lifelong-learning.lu"],
    },
    {
      titleKey: "checklist.cai.title",
      descriptionKey: "checklist.cai.description",
      category: "admin",
      order: 6,
      externalLinks: ["https://www.olai.public.lu"],
    },
    {
      titleKey: "checklist.residence_permit.title",
      descriptionKey: "checklist.residence_permit.description",
      category: "admin",
      order: 7,
      isNonEuOnly: true,
      externalLinks: ["https://maee.gouvernement.lu/en/directions-du-ministere/immigration.html"],
    },
    {
      titleKey: "checklist.banking.title",
      descriptionKey: "checklist.banking.description",
      category: "finance",
      order: 8,
      externalLinks: [],
    },
    {
      titleKey: "checklist.gp.title",
      descriptionKey: "checklist.gp.description",
      category: "health",
      order: 9,
      externalLinks: ["https://sante.public.lu"],
    },
    {
      titleKey: "checklist.schools.title",
      descriptionKey: "checklist.schools.description",
      category: "family",
      order: 10,
      isFamilyOnly: true,
      externalLinks: ["https://men.public.lu", "https://www.enfancejeunesse.lu"],
    },
  ];

  for (const item of checklistItems) {
    await prisma.checklistItem.upsert({
      where: { id: item.titleKey.replace(/\./g, "_") },
      update: item,
      create: { id: item.titleKey.replace(/\./g, "_"), ...item },
    });
  }
  console.log(`✅ ${checklistItems.length} checklist items seeded`);

  // ─── Autopedestre routes ───
  const routes = [
    { name: "Mullerthal Trail - Route 1", region: "Echternach", difficulty: "MEDIUM" as const, distanceKm: 37, durationMinutes: 660, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/mullerthal-trail-route-1", description: "The flagship trail through Luxembourg's Little Switzerland. Dramatic rock formations, narrow gorges, mossy forests, and the famous Schéissendëmpel waterfall." },
    { name: "Wenzelweg (Wenzel Walk)", region: "Luxembourg City", difficulty: "EASY" as const, distanceKm: 5.2, durationMinutes: 120, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/wenzel-walk", description: "A circular walk through 1,000 years of Luxembourg City history. UNESCO World Heritage sites, the Bock Casemates, Grund quarter, and panoramic views of the Alzette valley." },
    { name: "Vauban Circular Walk", region: "Luxembourg City", difficulty: "EASY" as const, distanceKm: 4.2, durationMinutes: 90, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/vauban-circular-walk", description: "Explore Luxembourg City's remarkable fortifications. Follow the path of the famous military architect Vauban through parks, ramparts, and hidden corners of the old city." },
    { name: "Escapardenne Lee Trail", region: "Ettelbruck", difficulty: "HARD" as const, distanceKm: 53, durationMinutes: 960, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/escapardenne-lee-trail", description: "A challenging multi-day trail from Ettelbruck to Diekirch through the Ardennes. Dense forests, river valleys, and remote villages. One of Luxembourg's most rewarding long-distance trails." },
    { name: "Sentier des Passeurs", region: "Vianden", difficulty: "MEDIUM" as const, distanceKm: 11, durationMinutes: 240, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/sentier-des-passeurs", description: "Walk in the footsteps of WWII resistance fighters who helped people escape across the Our river. The trail passes Vianden Castle and offers stunning views of the Our valley." },
    { name: "Traumschleife Manternach", region: "Grevenmacher", difficulty: "EASY" as const, distanceKm: 7.5, durationMinutes: 150, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/traumschleife-manternach", description: "A dream loop through the Manternach nature reserve. Ancient oak forests, wildflower meadows, and the beautiful Syre valley. Perfect for families and nature lovers." },
    { name: "Moselle Wine Trail", region: "Moselle", difficulty: "EASY" as const, distanceKm: 8.5, durationMinutes: 180, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/moselle-wine-trail", description: "Meander through terraced vineyards along the Moselle river. Visit wine cellars, taste Luxembourgish crémant and Riesling, and enjoy panoramic views from the hilltops." },
    { name: "Circuit Auto-Pédestre Beaufort", region: "Echternach", difficulty: "MEDIUM" as const, distanceKm: 9.8, durationMinutes: 210, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/auto-pedestre-beaufort", description: "Explore the medieval ruins of Beaufort Castle, then wind through dramatic rock formations and dense forest. The trail passes a Renaissance castle and a charming village." },
    { name: "Éislek Pad - Clervaux", region: "Clervaux", difficulty: "MEDIUM" as const, distanceKm: 12, durationMinutes: 240, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/eislek-pad-clervaux", description: "Discover the northern Ardennes around Clervaux. Visit the famous Family of Man exhibition, walk through deep forests, and enjoy the serene beauty of the Clerve valley." },
    { name: "Minett Trail - Belval", region: "Esch-sur-Alzette", difficulty: "EASY" as const, distanceKm: 6, durationMinutes: 120, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/minett-trail-belval", description: "An urban-nature trail through Luxembourg's industrial heartland. From the striking blast furnaces of Belval to red-earth nature reserves, discover how nature reclaims industry." },
    { name: "Mullerthal Trail - Route 2", region: "Echternach", difficulty: "MEDIUM" as const, distanceKm: 38, durationMinutes: 660, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/mullerthal-trail-route-2", description: "The second route through Luxembourg's Little Switzerland. More rock formations, hidden caves, and the peaceful Ernz Noire valley." },
    { name: "Circuit Pédestre Mondorf", region: "Mondorf-les-Bains", difficulty: "EASY" as const, distanceKm: 5.5, durationMinutes: 100, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/circuit-pedestre-mondorf", description: "A gentle loop around the spa town of Mondorf-les-Bains. Gardens, thermal park, and the beautiful Gander valley." },
    { name: "Nat'Our Route - Wiltz", region: "Wiltz", difficulty: "MEDIUM" as const, distanceKm: 14, durationMinutes: 300, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/natour-route-wiltz", description: "A nature trail through the hills around Wiltz, Luxembourg's 'City of Culture'. Deep valleys, old-growth forest, and views from the castle tower." },
    { name: "Sentier du Barrage - Esch-Sûre", region: "Wiltz", difficulty: "EASY" as const, distanceKm: 4.8, durationMinutes: 90, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/sentier-du-barrage", description: "A family-friendly walk around the Upper Sûre lake. The turquoise water, surrounding forests, and views of the dam make this one of Luxembourg's most photogenic trails." },
    { name: "Skywalk Pétange", region: "Differdange", difficulty: "EASY" as const, distanceKm: 3.5, durationMinutes: 60, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/skywalk-petange", description: "A spectacular elevated walkway through the former iron ore mining region. The Skywalk offers bird's-eye views of the red-earth landscapes and industrial heritage of the Minett." },
    { name: "Circuit des Châteaux - Larochette", region: "Mersch", difficulty: "MEDIUM" as const, distanceKm: 8.2, durationMinutes: 180, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/circuit-des-chateaux-larochette", description: "A castle trail around Larochette. The medieval ruins perched on dramatic cliffs, the Ernz Blanche valley, and charming village streets." },
    { name: "Diekirch Heritage Trail", region: "Diekirch", difficulty: "EASY" as const, distanceKm: 6.5, durationMinutes: 130, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/diekirch-heritage-trail", description: "Explore Diekirch's rich history from Roman times to WWII. The National Museum of Military History, the old church, and the beautiful Sûre promenade." },
    { name: "Rundwanderweg Remich", region: "Remich", difficulty: "EASY" as const, distanceKm: 7, durationMinutes: 150, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/rundwanderweg-remich", description: "A loop through the vineyards above Remich, the 'Pearl of the Moselle'. Panoramic views of the Moselle valley, wine-tasting opportunities, and the charming riverside promenade." },
    { name: "Éislek Pad - Bourscheid", region: "Ettelbruck", difficulty: "HARD" as const, distanceKm: 16, durationMinutes: 360, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/eislek-pad-bourscheid", description: "A challenging trail to one of Luxembourg's largest castle ruins. Steep climbs rewarded with sweeping views of the Sûre valley. Wild, remote, and unforgettable." },
    { name: "Mamer-Eischen Valley Trail", region: "Capellen", difficulty: "EASY" as const, distanceKm: 9, durationMinutes: 180, visitLuxembourgUrl: "https://www.visitluxembourg.com/tour/mamer-valley-trail", description: "A peaceful valley walk between Mamer and Eischen. The Mamer river, old watermills, and gentle hills covered in wildflowers. A hidden gem close to the capital." },
  ];

  for (const route of routes) {
    await prisma.autopedestreRoute.upsert({
      where: { id: route.name.replace(/[^a-z0-9]/gi, "_").toLowerCase() },
      update: route,
      create: { id: route.name.replace(/[^a-z0-9]/gi, "_").toLowerCase(), ...route },
    });
  }
  console.log(`✅ ${routes.length} Autopedestre routes seeded`);

  // ─── Sample clubs ───
  const clubs = [
    {
      name: "Café des Langues Luxembourg",
      description: "A weekly language exchange café where people practice French, Luxembourgish, German, English, Portuguese, and more over coffee. All levels welcome. It's informal, friendly, and the best way to improve your language skills while meeting new people.",
      region: "Luxembourg City",
      activityType: "Language exchange",
      languages: ["French", "Luxembourgish", "English", "German", "Portuguese"],
      meetingFrequency: "Weekly, Thursday evenings",
      contactEmail: "info@cafedeslangues.lu",
      contactUrl: "https://cafedeslangues.lu",
    },
    {
      name: "Luxembourg Hiking Group",
      description: "We organise weekly hikes across Luxembourg — from gentle family walks to challenging Ardennes trails. All fitness levels welcome. We rotate regions so you'll discover the whole country. Equipment advice and carpooling available.",
      region: "Luxembourg City",
      activityType: "Hiking",
      languages: ["English", "French", "German"],
      meetingFrequency: "Weekly, Saturdays",
      contactUrl: "https://meetup.com/luxembourg-hiking",
    },
    {
      name: "Amicale des Italiens",
      description: "The Italian community association in Luxembourg. We organise cultural events, Italian language courses, family gatherings, and celebrate Italian traditions. Open to anyone with a love for Italian culture.",
      region: "Luxembourg City",
      activityType: "Cultural",
      languages: ["Italian", "French", "English"],
      meetingFrequency: "Monthly",
      contactEmail: "info@amicale-italiens.lu",
    },
    {
      name: "Transition Minett",
      description: "An ecological transition initiative in the south of Luxembourg. Community gardens, repair cafés, zero-waste workshops, and local food cooperatives. Join us to build a more sustainable community.",
      region: "Esch-sur-Alzette",
      activityType: "Environmental",
      languages: ["French", "Luxembourgish", "English"],
      meetingFrequency: "Bi-weekly",
      contactUrl: "https://transition-minett.lu",
      benevolatLink: "https://benevolat.public.lu",
    },
    {
      name: "Nordstad International Families",
      description: "A support network for international families in the Nordstad area (Ettelbruck, Diekirch, Colmar-Berg). Playgroups, family outings, school advice, and social gatherings. Because settling in is easier together.",
      region: "Nordstad",
      activityType: "Family",
      languages: ["English", "French", "Portuguese"],
      meetingFrequency: "Weekly, Wednesday mornings",
      contactEmail: "families@nordstad-intl.lu",
    },
  ];

  for (const club of clubs) {
    const exists = await prisma.club.findFirst({ where: { name: club.name } });
    if (!exists) {
      await prisma.club.create({ data: club });
    }
  }
  console.log(`✅ ${clubs.length} sample clubs seeded`);

  // ─── Guidance articles ───
  const articles = [
    { slug: "volunteering", titleKey: "guide.volunteering.title", contentKey: "guide.volunteering.content", category: "community", order: 1 },
    { slug: "joining-clubs", titleKey: "guide.clubs.title", contentKey: "guide.clubs.content", category: "community", order: 2 },
    { slug: "community-events", titleKey: "guide.events.title", contentKey: "guide.events.content", category: "community", order: 3 },
    { slug: "learning-languages", titleKey: "guide.languages.title", contentKey: "guide.languages.content", category: "education", order: 4 },
    { slug: "settling-in-tips", titleKey: "guide.tips.title", contentKey: "guide.tips.content", category: "practical", order: 5 },
  ];

  for (const article of articles) {
    await prisma.guidanceArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log(`✅ ${articles.length} guidance articles seeded`);

  // ─── Announcement ───
  await prisma.announcement.upsert({
    where: { id: "welcome-beta" },
    update: {},
    create: {
      id: "welcome-beta",
      message: "Welcome to the Letzwelcome beta! We're building something special for the Luxembourg community. Your feedback matters — reach out anytime.",
      active: true,
    },
  });
  console.log("✅ Welcome announcement created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
