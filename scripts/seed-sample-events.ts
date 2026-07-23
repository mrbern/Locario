import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

type PrismaType = typeof import("../src/lib/prisma").prisma;

let prisma: PrismaType;

function nextDate(dayOffset: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const sampleEvents = [
  {
    title: "Sommerabend Konzert Interlaken",
    organizerName: "Kulturverein Interlaken",
    category: "Konzert",
    plan: "highlight",
    city: "Interlaken",
    locationName: "Höhematte Interlaken",
    address: "Höheweg",
    latitude: 46.6863,
    longitude: 7.8632,
    description:
      "Live-Musik, regionale Bands und gemütliche Sommerstimmung im Berner Oberland. Ideal für Musik, Ausgang und Wochenende.",
    tags: ["Konzert", "Live Musik", "Wochenende", "Berner Oberland"],
    searchTerms: [
      "events berner oberland",
      "konzert interlaken",
      "live musik",
      "wochenende",
      "musik event",
      "veranstaltung interlaken",
    ],
    startsAt: nextDate(5, 19, 30),
    endsAt: nextDate(5, 23, 0),
    website: "https://www.example.ch",
    ticketUrl: "https://www.example.ch/tickets",
    isActive: true,
  },
  {
    title: "Familientag am Thunersee",
    organizerName: "Region Thun Tourismus",
    category: "Familie",
    plan: "highlight",
    city: "Thun",
    locationName: "Strandbad Thun",
    address: "Strandbadweg 10",
    latitude: 46.757,
    longitude: 7.627,
    description:
      "Familienevent mit Kinderprogramm, Spiel, Essen, Musik und Aktivitäten am Thunersee.",
    tags: ["Familie", "Kinder", "Thun", "Wochenende"],
    searchTerms: [
      "kinderprogramm thun",
      "familienevent",
      "event thunersee",
      "events berner oberland",
      "wochenende mit kindern",
      "familie thun",
    ],
    startsAt: nextDate(6, 11, 0),
    endsAt: nextDate(6, 17, 0),
    website: "https://www.example.ch",
    ticketUrl: "",
    isActive: true,
  },
  {
    title: "Spiezer Märit & Regionalmarkt",
    organizerName: "Gewerbe Spiez",
    category: "Markt",
    plan: "basic",
    city: "Spiez",
    locationName: "Dorfzentrum Spiez",
    address: "Bahnhofstrasse",
    latitude: 46.6885,
    longitude: 7.6792,
    description:
      "Regionaler Markt mit lokalen Produkten, Essen, Handwerk, Musik und Angeboten aus der Region.",
    tags: ["Markt", "Märit", "Regional", "Spiez"],
    searchTerms: [
      "markt spiez",
      "märit spiez",
      "maerit spiez",
      "regionalmarkt",
      "events berner oberland",
      "veranstaltung spiez",
    ],
    startsAt: nextDate(7, 9, 0),
    endsAt: nextDate(7, 16, 0),
    website: "https://www.example.ch",
    ticketUrl: "",
    isActive: true,
  },
  {
    title: "Grindelwald Outdoor Weekend",
    organizerName: "Outdoor Club Grindelwald",
    category: "Sport",
    plan: "highlight",
    city: "Grindelwald",
    locationName: "Sportzentrum Grindelwald",
    address: "Dorfstrasse 110",
    latitude: 46.6242,
    longitude: 8.0414,
    description:
      "Outdoor-Wochenende mit Sport, Wandern, Bike, Aktivitäten und Erlebnissen in Grindelwald.",
    tags: ["Sport", "Outdoor", "Grindelwald", "Wochenende"],
    searchTerms: [
      "outdoor event grindelwald",
      "sport berner oberland",
      "events berner oberland",
      "wochenende grindelwald",
      "wandern",
      "bike",
    ],
    startsAt: nextDate(8, 10, 0),
    endsAt: nextDate(8, 18, 0),
    website: "https://www.example.ch",
    ticketUrl: "https://www.example.ch/tickets",
    isActive: true,
  },
  {
    title: "Foodtruck Abend Frutigen",
    organizerName: "Frutigen Events",
    category: "Gastro",
    plan: "basic",
    city: "Frutigen",
    locationName: "Dorfplatz Frutigen",
    address: "Dorfstrasse",
    latitude: 46.5872,
    longitude: 7.6472,
    description:
      "Foodtrucks, regionale Spezialitäten, Getränke, Musik und gemütlicher Abend im Berner Oberland.",
    tags: ["Foodtruck", "Gastro", "Essen", "Frutigen"],
    searchTerms: [
      "foodtruck frutigen",
      "essen event",
      "gastro event",
      "events berner oberland",
      "abend event",
    ],
    startsAt: nextDate(4, 18, 0),
    endsAt: nextDate(4, 22, 30),
    website: "https://www.example.ch",
    ticketUrl: "",
    isActive: true,
  },
  {
    title: "Theaterabend Meiringen",
    organizerName: "Kultur Meiringen",
    category: "Theater",
    plan: "basic",
    city: "Meiringen",
    locationName: "Kulturhaus Meiringen",
    address: "Bahnhofplatz 3",
    latitude: 46.7271,
    longitude: 8.1872,
    description:
      "Theater, Kultur und Unterhaltung in Meiringen. Ein Abend für Kulturinteressierte im Berner Oberland.",
    tags: ["Theater", "Kultur", "Meiringen", "Abend"],
    searchTerms: [
      "theater meiringen",
      "kultur berner oberland",
      "events berner oberland",
      "veranstaltung meiringen",
      "theaterabend",
    ],
    startsAt: nextDate(9, 20, 0),
    endsAt: nextDate(9, 22, 0),
    website: "https://www.example.ch",
    ticketUrl: "https://www.example.ch/tickets",
    isActive: true,
  },
];

async function main() {
  ({ prisma } = await import("../src/lib/prisma"));

  let created = 0;
  let skipped = 0;

  for (const event of sampleEvents) {
    const existingEvent = await prisma.event.findFirst({
      where: {
        title: event.title,
        city: event.city,
      },
      select: {
        id: true,
      },
    });

    if (existingEvent) {
      skipped += 1;
      continue;
    }

    await prisma.event.create({
      data: {
        title: event.title,
        imageUrl: null,
        organizerName: event.organizerName,
        category: event.category,
        plan: event.plan,
        city: event.city,
        locationName: event.locationName,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
        description: event.description,
        tags: JSON.stringify(event.tags),
        searchTerms: JSON.stringify(event.searchTerms),
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        website: event.website,
        ticketUrl: event.ticketUrl || null,
        isActive: event.isActive,
        highlightUntil:
          event.plan === "highlight"
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
            : null,
      },
    });

    created += 1;
  }

  console.log(`Fertig. ${created} Muster-Events erstellt, ${skipped} vorhandene übersprungen.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
