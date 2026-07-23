import { categoryGroups } from "@/data/categories";

export type CompanySearchTaxonomyEntry = {
  label: string;
  keywords: string[];
};

const manualKeywordsByLabel: Record<string, string[]> = {
  "Bau, Garten & Material": [
    "bau", "bauen", "baustoffe", "baumaterial", "material", "garten", "umbau", "renovation", "sanierung", "baustelle",
  ],
  "Kieswerk": ["kieswerk", "kies", "wandkies", "rundkies", "splitt", "split", "sand", "schotter", "humus", "erde", "aushubmaterial", "material liefern"],
  "Sand & Splitt": ["sand", "splitt", "split", "kies", "schotter", "bausand", "spielsand", "streusplitt", "gartenkies"],
  "Baustoffhandel": ["baustoffhandel", "baustoffe", "baumarkt", "baumaterial", "bauzubehör", "bauzubehoer", "zement", "beton", "platten"],
  "Bauunternehmen": ["bauunternehmen", "baufirma", "baumeister", "hochbau", "tiefbau", "umbau", "neubau", "sanierung", "bauarbeiten"],
  "Aushub & Erdarbeiten": ["aushub", "erdarbeiten", "bagger", "baggerarbeiten", "baugrube", "terrain", "planieren", "gelände", "gelaende"],
  "Baggerarbeiten": ["baggerarbeiten", "bagger", "minibagger", "aushub", "erdarbeiten", "graben", "baugrube", "planieren", "abbruch"],
  "Beton & Zement": ["beton", "zement", "betonarbeiten", "fundament", "mörtel", "moertel", "bodenplatte", "mauerwerk"],
  "Gartenbau": ["gartenbau", "gärtner", "gaertner", "garten gestalten", "gartengestaltung", "gartenanlage", "rasen", "pflanzen", "hecken", "naturstein", "sitzplatz", "aussenanlage"],
  "Gartenpflege": ["gartenpflege", "rasen mähen", "rasen maehen", "hecke schneiden", "bäume schneiden", "baeume schneiden", "unkraut", "gartenunterhalt", "winterdienst", "laub"],
  "Gärtnerei": ["gärtnerei", "gaertnerei", "pflanzen", "blumen", "garten", "setzlinge", "topfpflanzen", "stauden"],
  "Baumschule": ["baumschule", "bäume", "baeume", "sträucher", "straeucher", "pflanzen", "hecken", "obstbaum"],
  "Forstbetrieb": ["forstbetrieb", "forst", "wald", "holz", "baum fällen", "baum faellen", "holzerei", "forstarbeiten"],
  "Brennholz": ["brennholz", "holz", "cheminéeholz", "chemineeholz", "ofenholz", "feuerholz", "ster", "holz liefern"],
  "Gerüstbau": ["gerüstbau", "geruestbau", "gerüst", "geruest", "fassadengerüst", "baugerüst", "arbeitsgerüst"],
  "Plattenleger": ["plattenleger", "platten", "fliesen", "keramikplatten", "bodenplatten", "wandplatten", "naturstein", "badplatten", "terrasse"],
  "Bodenleger": ["bodenleger", "boden", "parkett", "laminat", "vinyl", "teppich", "bodenbelag", "linoleum"],
  "Fenster & Türen": ["fenster", "türen", "tueren", "haustür", "haustuer", "fensterbau", "türmontage", "tuermontage", "glas"],
  "Storen & Beschattung": ["storen", "beschattung", "sonnenschutz", "rollladen", "lamellenstoren", "markise", "sonnenstore", "storen reparatur"],

  "Handwerk & Reparaturen": ["handwerk", "handwerker", "reparatur", "montage", "unterhalt", "service", "notfalldienst", "renovation", "allrounder", "haustechnik"],
  "Elektriker": ["elektriker", "elektro", "elektroinstallateur", "strom", "steckdose", "lampen", "beleuchtung", "sicherung", "elektroinstallation", "smart home"],
  "Sanitär": ["sanitär", "sanitaer", "sanitärinstallateur", "wasser", "bad", "wc", "lavabo", "dusche", "boiler", "rohrbruch", "abfluss", "verstopft"],
  "Heizung": ["heizung", "heizungsinstallateur", "wärmepumpe", "waermepumpe", "ölheizung", "oelheizung", "gasheizung", "bodenheizung", "radiator", "heizungsservice", "heizung kaputt"],
  "Lüftung & Klima": ["lüftung", "lueftung", "klima", "klimaanlage", "lüftungsanlage", "lueftungsanlage", "ventilation", "kühlung", "kuehlung"],
  "Solar & Photovoltaik": ["solar", "photovoltaik", "pv anlage", "solaranlage", "stromspeicher", "eigenverbrauch", "solarstrom", "dach solar"],
  "Maler & Gipser": ["maler", "gipser", "malerarbeiten", "streichen", "farbe", "fassade", "verputz", "abrieb", "tapezieren"],
  "Schreiner": ["schreiner", "schreinerei", "möbel", "moebel", "holz", "einbauschrank", "küche", "kueche", "massanfertigung", "tischler"],
  "Zimmermann": ["zimmermann", "zimmerei", "holzbau", "dachstock", "carport", "pergola", "fassade holz", "holzarbeiten"],
  "Dachdecker": ["dachdecker", "dach", "dachsanierung", "ziegel", "flachdach", "steildach", "dachfenster", "dachreparatur", "abdichtung"],
  "Spengler": ["spengler", "spenglerei", "blech", "dachrinne", "regenrinne", "ablaufrohr", "metallfassade", "dachblech"],
  "Schlosser": ["schlosser", "schlosserei", "metallbau", "geländer", "gelaender", "tor", "stahl", "metall", "treppe", "zaun"],
  "Glaser": ["glaser", "glaserei", "glas", "fensterglas", "glasbruch", "spiegel", "duschwand", "verglasung"],
  "Haushaltgeräte Reparatur": ["haushaltgeräte reparatur", "haushaltgeraete reparatur", "geräte reparatur", "waschmaschine", "tumbler", "geschirrspüler", "geschirrspueler", "kühlschrank", "kuehlschrank", "backofen"],
  "Allrounder": ["allrounder", "handwerker allrounder", "kleinreparaturen", "montage", "möbel montieren", "moebel montieren", "unterhalt", "reparaturservice"],
  "Notfalldienst": ["notfalldienst", "notdienst", "24h", "sofort hilfe", "dringend", "pikettdienst", "störung", "stoerung", "reparatur notfall"],
  "Kaminfeger": ["kaminfeger", "kamin", "cheminée", "cheminee", "rauchfang", "feuerungskontrolle", "ofen", "heizungskontrolle"],

  "Auto, Garage & Fahrzeuge": ["auto", "garage", "fahrzeug", "autowerkstatt", "reparatur", "service", "reifen", "carrosserie", "occasion", "neuwagen"],
  "Autohaus": ["autohaus", "autohändler", "autohaendler", "auto kaufen", "neuwagen", "occasionen", "fahrzeuge", "probefahrt", "verkauf"],
  "Garage": ["garage", "autogarage", "autoservice", "autowerkstatt", "service", "reparatur", "fahrzeugcheck", "mfk", "diagnose", "mechaniker"],
  "Occasionen": ["occasionen", "occasion", "gebrauchtwagen", "gebrauchtes auto", "auto kaufen", "fahrzeug kaufen", "verkauf"],
  "Neuwagen": ["neuwagen", "neues auto", "auto kaufen", "fahrzeug kaufen", "autohändler", "probefahrt", "leasing"],
  "Autowerkstatt": ["autowerkstatt", "auto reparatur", "autoservice", "fahrzeugservice", "ölwechsel", "oelwechsel", "bremsen", "mfk", "diagnose", "service", "auto macht geräusche", "auto macht geraeusche"],
  "Reifenservice": ["reifenservice", "reifen", "pneu", "pneuwechsel", "winterreifen", "sommerreifen", "reifen montieren", "auswuchten", "reifenhotel"],
  "Carrosserie": ["carrosserie", "karosserie", "unfallreparatur", "beulen", "dellen", "lackschaden", "fahrzeugschaden", "spenglerei auto"],
  "Autolackiererei": ["autolackiererei", "lackiererei", "auto lackieren", "lackschaden", "kratzer", "fahrzeuglack", "spot repair"],
  "Fahrzeugaufbereitung": ["fahrzeugaufbereitung", "auto aufbereitung", "autopflege", "innenreinigung", "polieren", "lackpflege", "detailing"],
  "Autovermietung": ["autovermietung", "auto mieten", "mietwagen", "fahrzeug mieten", "transporter mieten", "bus mieten"],
  "Leasing": ["leasing", "auto leasing", "fahrzeug leasing", "finanzierung", "rate", "neuwagen leasing", "occasion leasing"],
  "Motorrad": ["motorrad", "töff", "toeff", "motorradwerkstatt", "motorrad kaufen", "roller", "scooter", "motorradservice"],
  "Nutzfahrzeuge": ["nutzfahrzeuge", "lieferwagen", "transporter", "camion", "lastwagen", "flotte", "gewerbefahrzeuge"],
  "Landmaschinen": ["landmaschinen", "traktor", "traktoren", "landtechnik", "maschinenservice", "landwirtschaft maschinen", "mähmaschine", "maehmaschine"],

  "Beauty, Gesundheit & Wohlbefinden": ["beauty", "gesundheit", "wohlbefinden", "pflege", "kosmetik", "therapie", "fitness", "massage", "praxis", "wellness"],
  "Coiffeur": ["coiffeur", "friseur", "haarschnitt", "haare", "färben", "faerben", "styling", "damenhaarschnitt", "herrenhaarschnitt", "balayage"],
  "Barbershop": ["barbershop", "barber", "bart", "herrenfriseur", "rasur", "haarschnitt männer", "haarschnitt maenner"],
  "Kosmetikstudio": ["kosmetikstudio", "kosmetik", "gesichtsbehandlung", "beauty", "make up", "hautpflege", "wimpern", "augenbrauen"],
  "Nagelstudio": ["nagelstudio", "nägel", "naegel", "manicure", "pedicure", "gelnägel", "gelnaegel", "naildesign", "fusspflege"],
  "Massage": ["massage", "massagetherapie", "rückenmassage", "rueckenmassage", "sportmassage", "entspannung", "wellness", "therapie"],
  "Physiotherapie": ["physiotherapie", "physio", "rehabilitation", "rückenschmerzen", "rueckenschmerzen", "therapie", "bewegung", "training"],
  "Osteopathie": ["osteopathie", "osteopath", "körpertherapie", "koerpertherapie", "schmerzen", "beweglichkeit", "manuelle therapie"],
  "Podologie": ["podologie", "fusspflege", "medizinische fusspflege", "fussbehandlung", "nägel", "naegel", "hornhaut"],
  "Zahnarzt": ["zahnarzt", "zahnarztpraxis", "zähne", "zaehne", "zahnreinigung", "kontrolle", "dentalhygiene", "notfall zahnarzt"],
  "Arztpraxis": ["arztpraxis", "arzt", "hausarzt", "medizin", "sprechstunde", "praxis", "untersuchung", "gesundheit"],
  "Apotheke": ["apotheke", "medikamente", "rezept", "beratung", "gesundheit", "notfallapotheke", "drogerie"],
  "Drogerie": ["drogerie", "pflege", "kosmetik", "gesundheit", "naturheilmittel", "haushalt", "apotheke"],
  "Fitnesscenter": ["fitnesscenter", "fitness", "gym", "training", "krafttraining", "cardio", "kurse", "studio"],
  "Personal Training": ["personal training", "personal trainer", "fitness coach", "training", "coaching", "krafttraining", "abnehmen"],
  "Ernährungsberatung": ["ernährungsberatung", "ernaehrungsberatung", "ernährung", "ernaehrung", "abnehmen", "diät", "diaet", "gesund essen"],
  "Spitex & Pflege": ["spitex", "pflege", "ambulante pflege", "betreuung", "seniorenbetreuung", "pflege zuhause", "haushaltshilfe"],

  "Gastro, Lebensmittel & Genuss": ["gastro", "gastronomie", "lebensmittel", "genuss", "essen", "trinken", "restaurant", "café", "cafe", "bäckerei", "take away", "catering"],
  "Restaurant": ["restaurant", "essen", "mittagessen", "abendessen", "küche", "kueche", "menü", "menue", "gastronomie", "beiz", "lokal"],
  "Pizzeria": ["pizzeria", "pizza", "italienisch", "pasta", "take away pizza", "pizza bestellen", "restaurant"],
  "Take-away": ["take-away", "take away", "takeaway", "essen mitnehmen", "imbiss", "snack", "lieferdienst essen", "food"],
  "Café": ["café", "cafe", "kaffee", "espresso", "tee", "kuchen", "brunch", "frühstück", "fruehstueck", "bistro"],
  "Bäckerei": ["bäckerei", "baeckerei", "brot", "brötchen", "broetchen", "gipfeli", "gebäck", "gebaeck", "sandwich", "confiserie"],
  "Konditorei": ["konditorei", "torten", "kuchen", "patisserie", "dessert", "süsses", "suesses", "confiserie", "gebäck"],
  "Metzgerei": ["metzgerei", "metzger", "fleisch", "wurst", "charcuterie", "grillfleisch", "regional fleisch"],
  "Käserei": ["käserei", "kaeserei", "käse", "kaese", "milchprodukte", "fondue", "raclette", "regionaler käse"],
  "Hofladen": ["hofladen", "bauernhofladen", "regional", "lokal", "frisch", "gemüse", "gemuese", "früchte", "fruechte", "eier", "direkt vom hof"],
  "Lebensmittelgeschäft": ["lebensmittelgeschäft", "lebensmittelgeschaeft", "lebensmittel", "laden", "supermarkt", "mini market", "einkaufen", "food", "getränke", "getraenke"],
  "Getränkemarkt": ["getränkemarkt", "getraenkemarkt", "getränke", "getraenke", "wasser", "mineral", "softdrinks"],
  "Catering": ["catering", "partyservice", "apéro", "apero", "buffet", "event catering", "essen liefern", "fingerfood", "bankett"],
  "Foodtruck": ["foodtruck", "food truck", "streetfood", "mobiles essen", "imbisswagen", "event food", "burger", "tacos"],
  "Bar & Lounge": ["bar", "lounge", "cocktail", "drinks", "ausgang", "nachtleben", "apéro", "apero", "bier", "wein"],

  "Immobilien, Wohnen & Reinigung": ["immobilien", "wohnen", "reinigung", "haus", "wohnung", "umzug", "verwaltung", "hauswartung", "innenausbau", "schlüssel"],
  "Immobilienmakler": ["immobilienmakler", "makler", "immobilien verkaufen", "haus verkaufen", "wohnung verkaufen", "immobilien kaufen", "bewertung"],
  "Immobilienverwaltung": ["immobilienverwaltung", "verwaltung", "liegenschaftsverwaltung", "mietverwaltung", "stockwerkeigentum", "bewirtschaftung"],
  "Hauswartung": ["hauswartung", "hauswart", "hausdienst", "liegenschaftsunterhalt", "gebäudeunterhalt", "gebaeudeunterhalt", "reinigung", "winterdienst"],
  "Umzugsfirma": ["umzugsfirma", "umzug", "zügeln", "zuegeln", "möbeltransport", "moebeltransport", "umzugshilfe", "transport"],
  "Reinigungsfirma": ["reinigungsfirma", "reinigung", "putzen", "wohnungsreinigung", "büroreinigung", "bueroreinigung", "unterhaltsreinigung", "cleaning"],
  "Endreinigung": ["endreinigung", "umzugsreinigung", "abgabereinigung", "wohnungsabgabe", "abnahmegarantie"],
  "Gebäudereinigung": ["gebäudereinigung", "gebaeudereinigung", "fassadenreinigung", "treppenhausreinigung", "büroreinigung", "unterhaltsreinigung"],
  "Teppichreinigung": ["teppichreinigung", "teppich reinigen", "polsterreinigung", "sofareinigung", "textilreinigung", "flecken entfernen"],
  "Möbelhaus": ["möbelhaus", "moebelhaus", "möbel", "moebel", "einrichtung", "sofa", "bett", "tisch", "wohnzimmer", "schrank"],
  "Innenausbau": ["innenausbau", "ausbau", "umbau innen", "trockenbau", "renovation", "schreiner", "wände", "waende", "decken"],
  "Küchenbau": ["küchenbau", "kuechenbau", "küche", "kueche", "einbauküche", "einbaukueche", "küchenumbau", "arbeitsplatte"],
  "Badumbau": ["badumbau", "bad", "badsanierung", "dusche", "wc", "lavabo", "plattenleger", "sanitär", "sanitaer"],
  "Sicherheitstechnik": ["sicherheitstechnik", "alarm", "alarmanlage", "videoüberwachung", "videoueberwachung", "zutritt", "einbruchschutz", "kamera"],
  "Schlüsseldienst": ["schlüsseldienst", "schluesseldienst", "schlüssel", "schluessel", "türöffnung", "tueroeffnung", "ausgesperrt", "zylinder", "notöffnung"],

  "Transport, Logistik & Entsorgung": ["transport", "logistik", "entsorgung", "lieferung", "kurier", "taxi", "räumung", "recycling", "lager", "umzug"],
  "Transportfirma": ["transportfirma", "transport", "warentransport", "möbeltransport", "moebeltransport", "lieferung", "logistik", "lastwagen"],
  "Kurierdienst": ["kurierdienst", "kurier", "express", "same day", "lieferung", "paket", "dokumente", "schnelltransport"],
  "Lieferdienst": ["lieferdienst", "lieferung", "bringdienst", "zustellung", "heimlieferung", "essen liefern", "waren liefern"],
  "Taxi": ["taxi", "taxidienst", "fahrdienst", "transfer", "flughafen transfer", "personentransport", "shuttle"],
  "Carreisen": ["carreisen", "busreisen", "reisecar", "carfahrt", "gruppenreise", "ausflug", "vereinsreise"],
  "Umzugstransport": ["umzugstransport", "umzug", "zügeltransport", "zuegeltransport", "möbeltransport", "transport"],
  "Lagerraum": ["lagerraum", "lager", "self storage", "einlagerung", "lagerbox", "möbel einlagern"],
  "Entsorgung": ["entsorgung", "abfall", "sperrgut", "bauschutt", "grüngut", "gruengut", "räumung", "recycling"],
  "Recycling": ["recycling", "wiederverwertung", "entsorgung", "altmetall", "papier", "karton", "elektroschrott", "wertstoffe"],
  "Räumung": ["räumung", "raeumung", "hausräumung", "wohnungsräumung", "entrümpelung", "entruempelung", "entsorgung"],
  "Muldenvermietung": ["muldenvermietung", "mulde mieten", "muldenservice", "container", "entsorgung", "bauschutt", "abfallmulde"],
  "Baumaschinen Transport": ["baumaschinen transport", "baumaschinen", "maschinentransport", "bagger transport", "schwertransport", "tieflader"],
  "Paketdienst": ["paketdienst", "paket", "pakete", "versand", "zustellung", "kurier", "lieferung"],

  "Dienstleistungen & Beratung": ["dienstleistungen", "beratung", "büro", "buero", "administration", "business", "agentur", "marketing", "treuhand", "webdesign", "it support"],
  "Treuhand": ["treuhand", "buchhaltung", "abschluss", "lohnbuchhaltung", "steuererklärung", "steuererklaerung", "fiduciary", "finanzen"],
  "Steuerberatung": ["steuerberatung", "steuern", "steuererklärung", "steuererklaerung", "steuerberater", "steueroptimierung", "beratung"],
  "Versicherung": ["versicherung", "versicherungsberatung", "krankenkasse", "haftpflicht", "hausrat", "fahrzeugversicherung", "vorsorge"],
  "Anwalt": ["anwalt", "rechtsanwalt", "rechtsberatung", "recht", "vertrag", "arbeitsrecht", "familienrecht", "jurist"],
  "Notar": ["notar", "notariat", "beglaubigung", "urkunde", "erbrecht", "vertrag", "grundstück", "grundstueck"],
  "Unternehmensberatung": ["unternehmensberatung", "business consulting", "strategie", "prozessberatung", "gründung", "gruendung", "firma gründen"],
  "Marketingagentur": ["marketingagentur", "marketing", "werbung", "online marketing", "social media", "seo", "kampagne", "branding"],
  "Webdesign": ["webdesign", "web design", "website", "webseite", "homepage", "wordpress", "internetauftritt", "ux design"],
  "IT Support": ["it support", "it", "informatik", "computerhilfe", "pc support", "netzwerk", "server", "software", "hardware", "helpdesk"],
  "Cybersecurity": ["cybersecurity", "cyber security", "it sicherheit", "datenschutz", "firewall", "security", "netzwerksicherheit", "backup"],
  "Druckerei": ["druckerei", "druck", "flyer", "visitenkarten", "broschüren", "broschueren", "plakate", "print", "kopieren"],
  "Fotograf": ["fotograf", "fotografie", "fotoshooting", "portrait", "hochzeitsfotograf", "produktfotografie", "eventfotografie"],
  "Videoproduktion": ["videoproduktion", "video", "filmproduktion", "imagefilm", "werbevideo", "eventvideo", "schnitt", "kamera"],
  "Übersetzungen": ["übersetzungen", "uebersetzungen", "übersetzer", "uebersetzer", "dolmetscher", "sprache", "text übersetzen"],

  "Detailhandel & Fachgeschäfte": ["detailhandel", "fachgeschäft", "fachgeschaeft", "laden", "shop", "geschäft", "geschaeft", "einkaufen", "retail", "verkauf"],
  "Modegeschäft": ["modegeschäft", "modegeschaeft", "mode", "kleider", "bekleidung", "fashion", "boutique", "damenmode", "herrenmode"],
  "Schuhgeschäft": ["schuhgeschäft", "schuhgeschaeft", "schuhe", "sneaker", "wanderschuhe", "kinderschuhe", "schuhladen"],
  "Sportgeschäft": ["sportgeschäft", "sportgeschaeft", "sportladen", "sportartikel", "fitnessartikel", "outdoor", "ausrüstung"],
  "Velogeschäft": ["velogeschäft", "velogeschaeft", "velo", "bike", "fahrrad", "e bike", "veloreparatur", "bike shop"],
  "Elektronikgeschäft": ["elektronikgeschäft", "elektronikgeschaeft", "elektronik", "computer", "tv", "audio", "handy", "smartphone", "geräte", "geraete"],
  "Haushaltswaren": ["haushaltswaren", "haushalt", "küche", "kueche", "geschirr", "pfannen", "geräte", "geraete", "wohnen"],
  "Blumenladen": ["blumenladen", "blumen", "floristik", "strauss", "blumenstrauss", "pflanzen", "geschenk", "trauerfloristik"],
  "Tierbedarf": ["tierbedarf", "haustierbedarf", "hundefutter", "katzenfutter", "tierfutter", "zubehör tiere", "zubehoer tiere"],
  "Optiker": ["optiker", "brille", "brillen", "kontaktlinsen", "sehtest", "sonnenbrille", "optik"],
  "Uhren & Schmuck": ["uhren", "schmuck", "juwelier", "ringe", "kette", "armband", "uhr reparatur", "gold", "silber"],
  "Spielwaren": ["spielwaren", "spielzeug", "spiele", "kinder", "lego", "puppen", "gesellschaftsspiele", "geschenk"],
  "Buchhandlung": ["buchhandlung", "bücher", "buecher", "buchladen", "romane", "fachbücher", "fachbuecher", "lesen"],
  "Geschenkladen": ["geschenkladen", "geschenke", "geschenkartikel", "deko", "souvenir", "karten", "ideen"],
  "Fisch & Aquaristik": ["fisch", "fische", "fischladen", "aquarium", "aquaristik", "zierfische", "teich", "aquarienbedarf", "futter"],

  "Freizeit, Events & Vereine": ["freizeit", "events", "veranstaltung", "vereine", "verein", "kultur", "sport", "musik", "reise", "hotel", "kinder", "tiere"],
  "Eventlocation": ["eventlocation", "event location", "veranstaltungsort", "saal", "halle", "raum mieten", "location", "hochzeit", "seminar"],
  "Eventtechnik": ["eventtechnik", "lichttechnik", "tontechnik", "sound", "bühne", "buehne", "mikrofon", "anlage", "technik"],
  "DJ": ["dj", "deejay", "musik", "party", "hochzeit dj", "event dj", "sound", "tanzen"],
  "Musikschule": ["musikschule", "musikunterricht", "instrument", "klavier", "gitarre", "gesang", "unterricht"],
  "Tanzschule": ["tanzschule", "tanzen", "tanzkurs", "salsa", "hip hop", "standardtanz", "paartanz"],
  "Sportverein": ["sportverein", "verein", "sport", "training", "fussball", "turnen", "tennis", "volleyball"],
  "Freizeitangebot": ["freizeitangebot", "freizeit", "aktivität", "aktivitaet", "ausflug", "erlebnis", "familie", "indoor", "outdoor"],
  "Reisebüro": ["reisebüro", "reisebuero", "reisen", "ferien", "urlaub", "flug", "hotel buchen", "pauschalreise"],
  "Hotel": ["hotel", "übernachten", "uebernachten", "zimmer", "unterkunft", "booking", "restaurant hotel", "seminarhotel"],
  "Ferienwohnung": ["ferienwohnung", "ferienhaus", "apartment", "unterkunft", "übernachtung", "uebernachtung", "airbnb"],
  "Camping": ["camping", "campingplatz", "zeltplatz", "wohnmobil", "camper", "stellplatz", "outdoor"],
  "Kinderbetreuung": ["kinderbetreuung", "kita", "krippe", "tagesmutter", "hort", "babysitter", "betreuung kinder"],
  "Hundeschule": ["hundeschule", "hundetraining", "hund", "welpenkurs", "erziehung", "training hund"],
  "Tierpension": ["tierpension", "hundepension", "katzenpension", "tierbetreuung", "ferienbetreuung tiere", "haustiere"],

  "Landwirtschaft & Regionales": ["landwirtschaft", "regional", "bauernhof", "hofladen", "landmaschinen", "forst", "holz", "mosterei", "winzer", "imkerei", "direktvermarktung"],
  "Bauernhof": ["bauernhof", "landwirtschaft", "hof", "tiere", "regional", "produkte vom hof", "milch", "eier", "gemüse", "gemuese"],
  "Mosterei": ["mosterei", "most", "apfelsaft", "saft", "obst", "äpfel", "aepfel", "pressen"],
  "Winzer": ["winzer", "wein", "weingut", "rebberg", "degustation", "weinkeller", "regionaler wein"],
  "Imkerei": ["imkerei", "imker", "honig", "bienen", "bienenprodukte", "regionaler honig"],
  "Direktvermarktung": ["direktvermarktung", "direkt vom hof", "regional", "lokal", "hofprodukte", "bauernmarkt", "frisch"],
  "Tierarzt": ["tierarzt", "tierarztpraxis", "veterinär", "veterinaer", "haustiere", "notfall tierarzt", "tiermedizin"],
  "Pferdebetrieb": ["pferdebetrieb", "pferde", "reiten", "reitstall", "pensionstall", "pferdepension", "reitunterricht"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function getNormalizedWords(value: string) {
  return normalize(value)
    .replace(/&/g, " und ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function getComparableValue(value: string) {
  return getNormalizedWords(value).join(" ");
}

function unique(values: string[]) {
  const seenValues = new Set<string>();
  const uniqueItems: string[] = [];

  values.forEach((value) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return;
    }

    const normalizedValue = getComparableValue(cleanValue);

    if (!normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueItems.push(cleanValue);
  });

  return uniqueItems;
}

function hasSameWords(label: string, taxonomyText: string) {
  const labelWords = getNormalizedWords(label);
  const taxonomyWords = getNormalizedWords(taxonomyText);

  if (labelWords.length === 0 || taxonomyWords.length === 0) {
    return false;
  }

  if (labelWords.length === 1) {
    return taxonomyWords.includes(labelWords[0]);
  }

  if (taxonomyWords.length === 1) {
    return false;
  }

  const labelWordSet = new Set(labelWords);
  const taxonomyWordSet = new Set(taxonomyWords);

  return (
    taxonomyWords.every((word) => labelWordSet.has(word)) ||
    labelWords.every((word) => taxonomyWordSet.has(word))
  );
}

function labelMatchesTaxonomyText(label: string, taxonomyText: string) {
  const normalizedLabel = getComparableValue(label);
  const normalizedTaxonomyText = getComparableValue(taxonomyText);

  if (!normalizedLabel || !normalizedTaxonomyText) {
    return false;
  }

  if (normalizedLabel === normalizedTaxonomyText) {
    return true;
  }

  return hasSameWords(label, taxonomyText);
}

function getEntryKeywords(label: string, inheritedKeywords: string[] = []) {
  return unique([label, ...inheritedKeywords, ...(manualKeywordsByLabel[label] ?? [])]);
}

const generatedTaxonomyEntries: CompanySearchTaxonomyEntry[] = categoryGroups.flatMap(
  (group) => [
    {
      label: group.name,
      keywords: getEntryKeywords(group.name, [...group.keywords, ...group.subcategories]),
    },
    ...group.subcategories.map((subCategory) => ({
      label: subCategory,
      keywords: getEntryKeywords(subCategory, [group.name, ...group.keywords]),
    })),
  ]
);

export const companySearchTaxonomy: CompanySearchTaxonomyEntry[] = generatedTaxonomyEntries;

function findMatchingEntries(labels: string[]) {
  const cleanLabels = labels.map((label) => label.trim()).filter(Boolean);

  return companySearchTaxonomy.filter((entry) => {
    const searchableTexts = [entry.label, ...entry.keywords];

    return cleanLabels.some((label) =>
      searchableTexts.some((text) => labelMatchesTaxonomyText(label, text))
    );
  });
}

export function getAutomaticCompanySearchTerms({
  mainCategory,
  subCategories,
  tags = [],
}: {
  mainCategory: string;
  subCategories: string[];
  tags?: string[];
}) {
  const labels = [mainCategory, ...subCategories, ...tags];
  const matchingEntries = findMatchingEntries(labels);

  return unique([
    mainCategory,
    ...subCategories,
    ...tags,
    ...matchingEntries.flatMap((entry) => entry.keywords),
  ]).map((term) => term.toLowerCase());
}

export function getCompanySearchSuggestions({
  mainCategory,
  subCategories,
  tags = [],
}: {
  mainCategory: string;
  subCategories: string[];
  tags?: string[];
}) {
  return getAutomaticCompanySearchTerms({
    mainCategory,
    subCategories,
    tags,
  }).slice(0, 90);
}
