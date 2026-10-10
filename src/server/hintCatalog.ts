import type { SupportedLanguage } from "@open-party-lab/game-core";

// Curated associations for every word: German source words; German/English hints.
// No automatic broad category fallback: missing assignments fail validation.
export const hintRows = `
Burger;Imbiss/Fast food
Sushi;Japan/Japan
Nudeln;Italien/Italy
Lasagne;Italien/Italy
Salat;Frischkost/Fresh food
Taco;Mexiko/Mexico
Risotto;Italien/Italy
Donut;Gebäck/Pastry
Pfannkuchen;Teig/Batter
Waffel;Teig/Batter
Croissant;Frühstück/Breakfast
Bratwurst;Grill/Barbecue
Kuerbissuppe;Herbst/Autumn
Kartoffelgratin;Auflauf/Casserole
Muesli;Frühstück/Breakfast
Kaesekuchen;Backen/Baking
Brezel;Gebäck/Pastry
Sandwich;Brot/Bread
Eiscreme;Sommer/Summer
Omelett;Pfanne/Pan
Guacamole;Mexiko/Mexico
Pizza;Italien/Italy
Popcorn;Kino/Cinema
Falafel;Kichererbsen/Chickpeas
Honig;Bienen/Bees
Avocado;Kern/Stone
Gummibärchen;Naschen/Snacking
Ananas;Tropen/Tropics
Schokolade;Kakao/Cocoa
Schluessel;Zugang/Access
Rucksack;Unterwegs/On the go
Wasserflasche;Durst/Thirst
Stuhl;Sitzen/Sitting
Lampe;Licht/Light
Kopfkissen;Schlaf/Sleep
Fernbedienung;Fernsehen/Television
Rasierapparat;Bart/Beard
Koffer;Reise/Travel
Brille;Sehen/Vision
Thermoskanne;Warmhalten/Keeping warm
Notizbuch;Gedanken/Thoughts
Hammer;Werkzeug/Tool
Schraubenzieher;Werkzeug/Tool
Teekanne;Aufguss/Infusion
Besen;Sauberkeit/Cleanliness
Mikrofon;Stimme/Voice
Kamera;Foto/Photo
Schachbrett;Strategie/Strategy
Taschenrechner;Zahlen/Numbers
Regenschirm;Wetter/Weather
Toothbrush;Badezimmer/Bathroom
Kompass;Orientierung/Orientation
Hängematte;Entspannen/Relaxation
Lupe;Vergrößerung/Magnification
Sanduhr;Zeit/Time
Seifenblasen;Schillern/Shimmer
Gießkanne;Garten/Garden
Fernglas;Entfernung/Distance
Springseil;Hüpfen/Jumping
Bibliothek;Lesen/Reading
Krankenhaus;Behandlung/Treatment
Schule;Unterricht/Lessons
Universitaet;Studium/Degree
Bahnhof;Reise/Travel
Supermarkt;Einkauf/Shopping
Baeckerei;Gebäck/Pastry
Museum;Ausstellung/Exhibition
Stadion;Fans/Fans
Campingplatz;Zelt/Tent
Leuchtturm;Küste/Coast
Burg;Mittelalter/Middle Ages
Zoo;Gehege/Enclosure
Aquarium;Unterwasser/Underwater
Kino;Leinwand/Screen
Theater;Bühne/Stage
Schwimmbad;Bahnen/Lanes
Rathaus;Verwaltung/Administration
Marktplatz;Stände/Stalls
Parkhaus;Auto/Car
Flughafen;Reise/Travel
Weltraumstation;Umlaufbahn/Orbit
Baumhaus;Versteck/Hideout
Freizeitpark;Fahrgeschäfte/Rides
Planetarium;Sterne/Stars
Berghütte;Wanderung/Hike
Eisdiele;Sommer/Summer
Spielplatz;Klettern/Climbing
Hafen;Schiffe/Ships
Giraffe;Savanne/Savanna
Krokodil;Reptil/Reptile
Delfin;Meer/Sea
Eule;Nacht/Night
Fuchs;Wald/Forest
Eichhoernchen;Nüsse/Nuts
Kaenguru;Australien/Australia
Faultier;Baumkrone/Treetop
Schmetterling;Insekt/Insect
Biber;Fluss/River
Marder;Raubtier/Predator
Igel;Garten/Garden
Seepferdchen;Meer/Sea
Tintenfisch;Meer/Sea
Krake;Meer/Sea
Walross;Arktis/Arctic
Lama;Anden/Andes
Pfau;Vogel/Bird
Otter;Fluss/River
Chamäleon;Reptil/Reptile
Koala;Australien/Australia
Pinguin;Vogel/Bird
Axolotl;Wassertier/Aquatic animal
Erdmännchen;Wüste/Desert
Flamingo;Vogel/Bird
Waschbär;Nacht/Night
Fledermaus;Nacht/Night
Nashorn;Savanne/Savanna
Libelle;Insekt/Insect
Wecker;Morgen/Morning
Dusche;Wasser/Water
Fruehstueck;Morgen/Morning
Arbeitsweg;Beruf/Work
Pendelzeit;Beruf/Work
Wochenende;Erholung/Rest
Einkaufsliste;Besorgungen/Errands
Haushaltsplan;Organisation/Organisation
Kaffeepause;Erholung/Rest
Wasserkocher;Heißgetränk/Hot drink
Abendessen;Mahlzeit/Meal
Waeschekorb;Kleidung/Clothes
Spuelmaschine;Geschirr/Dishes
Fensterputzen;Glas/Glass
Muellsortierung;Recycling/Recycling
ToDoListe;Aufgaben/Tasks
Terminkalender;Planung/Planning
Notizzettel;Erinnerung/Reminder
Mittagspause;Erholung/Rest
Schlafroutine;Abend/Evening
Geburtstag;Feiern/Celebrating
Taschengeld;Sparen/Saving
Zähneputzen;Hygiene/Hygiene
Picknick;Draußen/Outdoors
Verstecken;Suchspiel/Searching game
Überraschung;Unerwartet/Unexpected
Schneeballschlacht;Winter/Winter
Kissenschlacht;Bett/Bed
Basketball;Korb/Hoop
Tennis;Schläger/Racket
Volleyball;Netz/Net
Handball;Tor/Goal
Radsport;Pedale/Pedals
Schwimmen;Wasser/Water
Klettern;Höhe/Height
Skateboard;Rollen/Wheels
Surfen;Wellen/Waves
Snowboard;Schnee/Snow
Golf;Schläger/Club
Minigolf;Schläger/Club
Judo;Matte/Mat
Boxen;Ring/Ring
Eishockey;Eis/Ice
Badminton;Schläger/Racket
Bogenschiessen;Zielscheibe/Target
Triathlon;Ausdauer/Endurance
Sprint;Tempo/Speed
Yoga;Matte/Mat
Pilates;Matte/Mat
Fussball;Tor/Goal
Trampolin;Springen/Jumping
Fechten;Duell/Duel
Rudern;Boot/Boat
Hula-Hoop;Hüfte/Hips
Staffellauf;Übergabe/Handover
Tischtennis;Schläger/Paddle
Wasserski;Zugseil/Tow rope
Lehrkraft;Unterricht/Lessons
Pilot;Cockpit/Cockpit
Arzt;Diagnose/Diagnosis
Architekt;Bauplan/Blueprint
Anwaeltin;Recht/Law
Journalist;Nachrichten/News
Programmierer;Software/Software
Designer;Gestaltung/Design
Koch;Küche/Kitchen
Polizist;Gesetz/Law
Sanitaeter;Notfall/Emergency
Mechaniker;Werkstatt/Workshop
Elektriker;Strom/Electricity
Friseur;Haare/Hair
Fotograf;Bildgestaltung/Composition
Landwirt;Feld/Field
Psychologe;Gespräch/Conversation
Apotheker;Medikamente/Medicine
Buchhalter;Finanzen/Finances
Uebersetzer;Sprachen/Languages
Feuerwehr;Notfall/Emergency
Astronaut;Raumfahrt/Space travel
Tierpfleger;Gehege/Enclosure
Detektiv;Spuren/Traces
Dirigent;Orchester/Orchestra
Bäcker;Teig/Dough
Gärtner;Pflanzen/Plants
Schauspieler;Rolle/Role
Busfahrer;Haltestelle/Stop
Laptop;Computer/Computer
Tablet;Touchscreen/Touchscreen
Router;Netzwerk/Network
Drohne;Fernsteuerung/Remote control
BluetoothBox;Musik/Music
Smartwatch;Handgelenk/Wrist
3DDrucker;Modell/Model
Konsole;Gaming/Gaming
Videospiel;Gaming/Gaming
Joystick;Gaming/Gaming
Kopfhörer;Musik/Music
Projektor;Leinwand/Screen
USBStick;Dateien/Files
Powerbank;Akku/Battery
EReader;Lesen/Reading
Scanner;Dokument/Document
Maus;Computer/Computer
Tastatur;Eingabe/Input
Mikrochips;Elektronik/Electronics
Solarpanel;Sonne/Sun
VRBrille;Virtuell/Virtual
Smartphone;Apps/Apps
Roboter;Automatik/Automation
Satellit;Umlaufbahn/Orbit
Rolltreppe;Etagen/Floors
Teleskop;Sterne/Stars
Stoppuhr;Zeit/Time
Walkie-Talkie;Funk/Radio
Staubsaugerroboter;Boden/Floor
Wasserfall;Fluss/River
Vulkan;Berg/Mountain
Gletscher;Eis/Ice
Eisberg;Eis/Ice
Regenbogen;Wetter/Weather
Gewitter;Wetter/Weather
Wuestenduene;Sand/Sand
Korallenriff;Meer/Sea
Baumkrone;Wald/Forest
Moos;Wald/Forest
Lavendel;Duft/Scent
Sonnenaufgang;Horizont/Horizon
Nordlicht;Himmel/Sky
Tropfsteinhoehle;Unterirdisch/Underground
Klippe;Küste/Coast
Gezeiten;Meer/Sea
Sandstrand;Küste/Coast
Birkenwald;Bäume/Trees
Seegras;Unterwasser/Underwater
Steinbock;Gebirge/Mountains
Ahornblatt;Herbst/Autumn
Sternschnuppe;Sterne/Stars
Sonnenblume;Pflanze/Plant
Fossil;Urzeit/Prehistory
Kaktus;Wüste/Desert
Tornado;Wetter/Weather
Nebel;Wetter/Weather
Muschel;Meer/Sea
Oper;Gesang/Singing
Ballett;Tanz/Dance
Roman;Literatur/Literature
Poesie;Literatur/Literature
Graffiti;Sprühdose/Spray can
Skulptur;Kunst/Art
Jazz;Musik/Music
HipHop;Musik/Music
Folklore;Tradition/Tradition
Festival;Liveauftritt/Live performance
Kostuem;Verkleidung/Dress-up
Kulisse;Bühne/Stage
Kinofilm;Leinwand/Screen
Fotografie;Bildgestaltung/Composition
Keramik;Ton/Clay
Aquarell;Malen/Painting
Mosaik;Kunst/Art
Symphonie;Orchester/Orchestra
Mythologie;Götter/Gods
Mittelaltermarkt;Handwerk/Craft
Zaubertrick;Illusion/Illusion
Zirkus;Manege/Ring
Comic;Zeichnungen/Drawings
Marionette;Puppe/Puppet
Origami;Papier/Paper
Schattentheater;Licht/Light
Karaoke;Mitsingen/Singing along
Schatzkarte;Abenteuer/Adventure
Cocktail;Mixgetränk/Mixed beverage
Longdrink;Mixgetränk/Mixed beverage
Kater;Morgen/Morning
Tequila;Mexiko/Mexico
Happy Hour;Bar/Bar
Türsteher;Einlass/Entry
Junggesellenabschied;Hochzeit/Wedding
Stripclub;Nachtlokal/Night venue
Bierpong;Becher/Cups
Shot;Bar/Bar
Weinprobe;Verkostung/Tasting
Afterparty;Nacht/Night
Diskothek;Tanzfläche/Dance floor
Trinkspiel;Party/Party
Sekt;Anstoßen/Toast
Zapfhahn;Theke/Counter
Kneipentour;Nachtleben/Nightlife
Ladies Night;Clubabend/Club night
Sperrstunde;Nachtleben/Nightlife
Whisky;Fass/Barrel
Blind Date;Kennenlernen/Getting acquainted
One-Night-Stand;Sex/Sex
Seitensprung;Geheimnis/Secret
Dating-App;Partnersuche/Seeking a partner
Flirt;Anziehung/Attraction
Liebeskummer;Gefühle/Feelings
Ghosting;Dating/Dating
Kondom;Sex/Sex
Hochzeitsnacht;Hochzeit/Wedding
Freundschaft Plus;Nähe/Intimacy
Eifersucht;Misstrauen/Distrust
Speed Dating;Kennenlernen/Getting acquainted
Trennung;Beziehung/Relationship
Heiratsantrag;Ring/Ring
Knutschfleck;Haut/Skin
Ex-Partner;Vergangenheit/Past
Fernbeziehung;Entfernung/Distance
Offene Beziehung;Vereinbarung/Agreement
Verführung;Anziehung/Attraction
Sexting;Intimität/Intimacy
Steuererklärung;Finanzamt/Tax office
Mietvertrag;Wohnen/Housing
Gehaltsverhandlung;Beruf/Work
Midlife-Crisis;Lebensphase/Life stage
Scheidung;Ehe/Marriage
Schwiegereltern;Familie/Family
Überstunden;Beruf/Work
Kredit;Geld/Money
Burnout;Erschöpfung/Exhaustion
Versicherung;Absicherung/Protection
Elternabend;Schule/School
Rentenbescheid;Alter/Age
Kündigung;Vertrag/Contract
Wohnungssuche;Besichtigung/Viewing
Nachbarschaftsstreit;Wohnen/Housing
Geschäftsreise;Beruf/Work
Ehevertrag;Partnerschaft/Partnership
Dispo;Konto/Account
Inkasso;Forderung/Demand
Erbschaft;Nachlass/Estate
Orgasmus;Lust/Pleasure
Erektion;Erregung/Arousal
Masturbation;Lust/Pleasure
Vibrator;Sexspielzeug/Sex toy
Dildo;Sexspielzeug/Sex toy
Gleitgel;Sex/Sex
Analverkehr;Sex/Sex
Oralverkehr;Sex/Sex
Blowjob;Mund/Mouth
Cunnilingus;Lust/Pleasure
Dreier;Sex/Sex
Gruppensex;Sex/Sex
Swingerclub;Partnertausch/Partner swapping
Fetisch;Reiz/Stimulus
BDSM;Macht/Power
Bondage;Fesseln/Restraints
Handschellen;Fesseln/Restraints
Peitsche;Leder/Leather
Lack und Leder;Fetisch/Fetish
Reizwäsche;Verführung/Seduction
Dessous;Spitze/Lace
Strap-on;Sexspielzeug/Sex toy
Plug;Sexspielzeug/Sex toy
Sexschaukel;Sexspielzeug/Sex toy
Liebeskugel;Intimität/Intimacy
Penis;Sex/Sex
Vulva;Sex/Sex
Klitoris;Lust/Pleasure
Hoden;Fortpflanzung/Reproduction
Brustwarze;Berührung/Touch
Nippelpiercing;Körperschmuck/Body jewellery
Intimpiercing;Körperschmuck/Body jewellery
Schamhaar;Intimbereich/Intimate area
Intimrasur;Körperpflege/Grooming
Sperma;Fortpflanzung/Reproduction
Ejakulation;Erregung/Arousal
Lusttropfen;Erregung/Arousal
Libido;Sex/Sex
Viagra;Potenz/Potency
Potenz;Sex/Sex
Sexstellung;Position/Position
Missionarsstellung;Sex/Sex
Doggy Style;Sex/Sex
Reiterstellung;Sex/Sex
Quickie;Spontanität/Spontaneity
Vorspiel;Zärtlichkeit/Tenderness
Nachspiel;Zweisamkeit/Intimacy
Dirty Talk;Sprache/Language
Rollenspiel;Fantasie/Fantasy
Striptease;Bühne/Stage
Pornofilm;Erwachsenenmedien/Adult media
Pornokino;Erwachsenenmedien/Adult media
Erotikmesse;Ausstellung/Exhibition
Sexshop;Erotik/Erotica
Bordell;Rotlicht/Red-light district
Escort;Begleitung/Companionship
Prostitution;Rotlicht/Red-light district
Telefonsex;Stimme/Voice
Cybersex;Online/Online
Nacktbild;Privatsphäre/Privacy
Fummeln;Nähe/Intimacy
Petting;Zärtlichkeit/Tenderness
Zungenkuss;Nähe/Intimacy
Sexfantasie;Vorstellung/Imagination
Voyeurismus;Beobachten/Observing
Exhibitionismus;Nacktheit/Nudity
Sexsucht;Verlangen/Desire
Keuschheitsgürtel;Enthaltsamkeit/Abstinence
Pille danach;Verhütung/Contraception
Verhütungspille;Hormone/Hormones
Arschloch;Egoismus/Selfishness
Wichser;Verachtung/Contempt
Hurensohn;Familie/Family
Schlampe;Abwertung/Disparagement
Mistkerl;Ärger/Anger
Drecksack;Gemeinheit/Meanness
Vollidiot;Dummheit/Stupidity
Trottel;Missgeschick/Mishap
Depp;Dummheit/Stupidity
Blödmann;Ärger/Anger
Kotzbrocken;Unsympathisch/Unlikeable
Schwein;Unanständig/Indecent
Sackgesicht;Spott/Mockery
Arschgeige;Spott/Mockery
Pissnelke;Verachtung/Contempt
Scheiße;Fluchen/Cursing
Verdammt;Frust/Frustration
Verfickt;Fluchen/Cursing
Leck mich;Abweisung/Rejection
Fick dich;Wut/Anger
Halt die Fresse;Ruhe/Silence
Verpiss dich;Abweisung/Rejection
Bullshit;Unsinn/Nonsense
Klugscheißer;Besserwisserei/Pedantry
Labertasche;Redseligkeit/Talkativeness
Schleimscheißer;Anbiedern/Fawning
Arschkriecher;Unterwürfigkeit/Subservience
Dummschwätzer;Unsinn/Nonsense
Maulheld;Prahlerei/Boasting
Flachwichser;Verachtung/Contempt
`;
const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
export const hintCatalog = new Map<string, Array<[string, string]>>();
for (const row of hintRows.trim().split(/\r?\n/)) {
  const [words, ...pairs] = row.split(";");
  const hints = pairs.map((pair) => pair.split("/") as [string, string]);
  if (hints.length !== 1 || hints[0].length !== 2 || hints[0].some((label) => !label.trim())) {
    throw new Error(`Invalid Imposter hint row: ${row}`);
  }
  for (const word of words.split("|")) {
    const id = normalize(word);
    if (hintCatalog.has(id)) throw new Error(`Duplicate Imposter hints: ${word}`);
    hintCatalog.set(id, hints);
  }
}
export function getWordHints(id: string, language: SupportedLanguage) {
  const hints = hintCatalog.get(id);
  if (!hints?.length) throw new Error(`Missing Imposter hints: ${id}`);
  return hints.map(([de, en]) => ({ id: `association:${normalize(de)}`, label: language === "en" ? en : de }));
}
