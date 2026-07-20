// ===================================================================
// ORBITAE — real member list used by create-users.mjs.
// One entry per person; `email` is the login. Add a new object here
// and re-run the script to provision a new member (existing members
// keep their account; their password is regenerated only with --reset).
//
// Campi:
//   email    l'indirizzo @orbitae.club: è SOLO la credenziale di login
//            (Supabase Auth). Non viene mostrato nei profili.
//   personalEmail  la mail personale/lavorativa presa dai file Contatti:
//            è quella che compare nella scheda del membro (profiles.email).
//            Se manca, il profilo ripiega sull'email di login.
//   role     "admin" | "member" — chi può mettere mano al sito. Sono tre:
//            Lorenzo, Santino e l'accesso tecnico. Non è un'etichetta.
//   tier     "founder" | "ambassador" | "member" — l'etichetta pubblica
//            accanto al nome (colonna "Ruolo2" dei file contatti).
//   events   gli incontri a cui la persona ha davvero presenziato: sono
//            queste le orbite che compaiono nella Home.
//   status   opzionale, default "active".
//   linkedin URL completo del profilo (dal file Excel), "" se assente.
//   password opzionale: la credenziale fissa dal file "Credenziali
//            Orbitae.xlsx" già consegnata al membro. Se presente, gli
//            script la usano invece di generarne una nuova; per chi ne
//            è privo la password viene generata come prima.
// ===================================================================

// Gli id sono fissi e coincidono con supabase/migration-tier-presenze.sql.
export const EVENTS = {
  "talent-war": "a1b2c3d4-0001-4000-8000-000000000001",
  "valore-azienda": "a1b2c3d4-0002-4000-8000-000000000002",
};

const BOTH = ["talent-war", "valore-azienda"];

export const MEMBERS = [
  // --- Founder -------------------------------------------------------
  { name: "Lorenzo Scisciani", email: "lorenzo.scisciani@orbitae.club", password: "Nova-Loggia-68", personalEmail: "lorenzoscisciani@gmail.com", role: "admin", tier: "founder", events: BOTH, company: "Artefatto design studio, Secolo, Movimento Gallery", bio: "Imprenditore arredamento", linkedin: "https://www.linkedin.com/in/lorenzo-scisciani-15193549", joinedAt: "2024-11-23" },
  { name: "Andrea Cecchi", email: "andrea.cecchi@orbitae.club", password: "Polare-Molo-40", personalEmail: "ilal.cecchi@gmail.com", role: "member", tier: "founder", events: BOTH, company: "Molinari", bio: "Avvocato M&A", linkedin: "https://www.linkedin.com/in/avvocatoandreacecchi/", joinedAt: "2024-12-24" },
  { name: "Alessio Angioni", email: "alessio.angioni@orbitae.club", password: "Eclisse-Onda-20", personalEmail: "alessioangioni.pro@gmail.com", role: "member", tier: "founder", events: BOTH, company: "Locura Studio", bio: "Founder e direttore creativo", linkedin: "https://www.linkedin.com/in/alessio-angioni-606309ba/", joinedAt: "2024-01-25" },
  { name: "Giorgio Zurlo", email: "giorgio.zurlo@orbitae.club", password: "Zenit-Lago-20", personalEmail: "giorgio.zurlo@parnet.it", role: "member", tier: "founder", events: BOTH, company: "Parnet", bio: "Imprenditore AI", linkedin: "https://www.linkedin.com/in/giorgio-zurlo-987538155/", joinedAt: "2024-02-26" },
  { name: "Raffaele Di Vuolo", email: "raffaele.vuolo@orbitae.club", password: "Luna-Duomo-53", personalEmail: "raffaeledivuolo@me.com", role: "member", tier: "founder", events: BOTH, company: "DL-Law", bio: "Avvocato giuslavorista", linkedin: "https://www.linkedin.com/in/raffaele-di-vuolo-2b5349102/", joinedAt: "2024-03-27" },
  { name: "Paolo Savarese", email: "paolo.savarese@orbitae.club", password: "Astro-Vela-68", personalEmail: "savaresepaolo1@gmail.com", role: "member", tier: "founder", events: BOTH, company: "", bio: "Avvocato fiscalista", linkedin: "https://www.linkedin.com/in/paolosavarese/", joinedAt: "2024-04-01" },
  { name: "Stefania Moschella", email: "stefania.moschella@orbitae.club", password: "Saturno-Molo-24", personalEmail: "stefania.moschella@confisa.it", role: "member", tier: "founder", events: BOTH, company: "Studio Confisa", bio: "Consulente dell'amministrazione del personale", linkedin: "https://www.linkedin.com/in/stefania-moschella-a9508a20/", joinedAt: "2024-05-02" },
  { name: "Marco Pasquali", email: "marco.pasquali@orbitae.club", password: "Luna-Ponte-32", personalEmail: "marco.pasquali@psqprofessionisti.com", role: "member", tier: "founder", events: BOTH, company: "PSQ Consulting", bio: "Commercialista e owner", linkedin: "https://www.linkedin.com/in/marco-pasquali-809454137/", joinedAt: "2024-06-03" },

  // --- Ambassador ----------------------------------------------------
  { name: "Santino Cundari", email: "santino.cundari@orbitae.club", password: "Orbita-Corte-18", personalEmail: "cundari.santino@gmail.com", role: "admin", tier: "ambassador", events: ["talent-war"], company: "Marketing Automation (Zucchetti) - eda.study", bio: "Product & sales manager - founder - marketing e AI", linkedin: "https://www.linkedin.com/in/santino-cundari-020585/", joinedAt: "2024-03-15" },
  { name: "Paolo Lanciani", email: "paolo.lanciani@orbitae.club", password: "Orbita-Fonte-25", personalEmail: "paolo.lanciani@dlm-partners.eu", role: "member", tier: "ambassador", events: BOTH, company: "De Micheli Lanciani Motta", bio: "Coach e psicologo del lavoro e owner", linkedin: "https://www.linkedin.com/in/paololanciani/", joinedAt: "2024-07-04" },
  { name: "Anna Albini", email: "anna.albini@orbitae.club", password: "Cometa-Rocca-33", personalEmail: "annaalbini@hotmail.it", role: "member", tier: "ambassador", events: BOTH, company: "Wellington Management", bio: "Business Developer", linkedin: "https://www.linkedin.com/in/anna-albini-786b1a26/", joinedAt: "2024-08-05" },
  { name: "Serena Sarno", email: "serena.sarno@orbitae.club", password: "Astro-Vetta-11", personalEmail: "Serenasarnoph@gmail.com", role: "member", tier: "ambassador", events: ["valore-azienda"], company: "", bio: "Fotografa ritrattista", linkedin: "https://www.linkedin.com/in/serenasarno", joinedAt: "2026-07-08" },

  // --- Member · Talent war (12/05/2026) ------------------------------
  { name: "Mario Distasi", email: "mario.distasi@orbitae.club", password: "Sirio-Rocca-65", personalEmail: "mario.distasi@mercer.com", role: "member", tier: "member", events: ["talent-war"], company: "Mercer (gruppo Marsh)", bio: "Associate Principal Compensation & Governance", linkedin: "https://www.linkedin.com/in/mario-distasi/", joinedAt: "2024-01-01" },
  { name: "Paolo Tomasino", email: "paolo.tomasino@orbitae.club", password: "Luna-Golfo-44", personalEmail: "pg.tomasino@gmail.com", role: "member", tier: "member", events: ["talent-war"], company: "Ermenegildo Zegna Group", bio: "Group Global Compensation", linkedin: "https://www.linkedin.com/in/paolotomasino/", joinedAt: "2024-02-02" },
  { name: "Giulia Escurolle", email: "giulia.escurolle@orbitae.club", password: "Cometa-Vetta-47", personalEmail: "g.escurolle@gmail.com", role: "member", tier: "member", events: ["talent-war"], company: "MB Kemp", bio: "DPO e avvocato compliance", linkedin: "https://www.linkedin.com/in/giulia-escurolle-599065a5/", joinedAt: "2024-03-03" },
  { name: "José Magnaghi", email: "jose.magnaghi@orbitae.club", password: "Nettuno-Vela-81", personalEmail: "jose@locurastudio.it", role: "member", tier: "member", events: ["talent-war"], company: "Locura Studio", bio: "Account Manager", linkedin: "", joinedAt: "2024-04-04" },
  { name: "Luciano Pastori", email: "luciano.pastori@orbitae.club", password: "Zenit-Corte-52", personalEmail: "luciano@locurastudio.it", role: "member", tier: "member", events: ["talent-war"], company: "Locura Studio", bio: "Art Director", linkedin: "", joinedAt: "2024-05-05" },
  { name: "Luca Vitali", email: "luca.vitali@orbitae.club", password: "Perseo-Faro-76", role: "member", tier: "member", events: ["talent-war"], company: "", bio: "", linkedin: "", joinedAt: "2024-06-06" },
  { name: "Linda Testa", email: "linda.testa@orbitae.club", password: "Aurora-Fiume-38", role: "member", tier: "member", events: ["talent-war"], company: "Libera professionista (lavora con fondi investimento)", bio: "Fractional COO - ex COO Trussardi", linkedin: "https://www.linkedin.com/in/linda-testa-a3410218/", joinedAt: "2024-07-07" },
  { name: "Silvano Alberi", email: "silvano.alberi@orbitae.club", password: "Luna-Ponte-72", role: "member", tier: "member", events: ["talent-war"], company: "Gamma Capital Market", bio: "Art Advisor - Consulente finanziario", linkedin: "https://www.linkedin.com/in/silvano-alberi-b78912155/", joinedAt: "2024-08-08" },
  { name: "Nicola Mazzoni", email: "nicola.mazzoni@orbitae.club", password: "Saturno-Faro-42", role: "member", tier: "member", events: ["talent-war"], company: "MP Style - FlabAI", bio: "CEO in 3 aziende - Tecnologo", linkedin: "https://www.linkedin.com/in/nicola-mazzoni-77a166156/", joinedAt: "2024-09-09" },
  { name: "Alberto Frazzini", email: "alberto.frazzini@orbitae.club", password: "Atlante-Vetta-44", role: "member", tier: "member", events: ["talent-war"], company: "BIP", bio: "Consulente", linkedin: "", joinedAt: "2024-10-10" },
  // Nei contatti del secondo incontro compare come "Gianluigi Gilardi":
  // stessa persona, stesso profilo LinkedIn — un solo account, due orbite.
  { name: "Gian Luigi Giliardi", email: "gian.giliardi@orbitae.club", password: "Lira-Arco-86", personalEmail: "gianluigi.gilardi@demetra-advisory.it", role: "member", tier: "member", events: BOTH, company: "Demetra Advisory", bio: "Advisor Finanziario", linkedin: "https://www.linkedin.com/in/gian-luigi-gilardi-476991a/", joinedAt: "2024-11-11" },
  { name: "Alessandro Cappai", email: "alessandro.cappai@orbitae.club", password: "Luna-Corte-85", personalEmail: "acappai@cocuzza.it", role: "member", tier: "member", events: ["talent-war"], company: "Cocuzza", bio: "Avvocato real estate", linkedin: "https://www.linkedin.com/in/alessandro-cappai/", joinedAt: "2024-12-12" },
  { name: "Alberto Rolla", email: "alberto.rolla@orbitae.club", password: "Luna-Monte-32", personalEmail: "arolla@translinkcf.com", role: "member", tier: "member", events: ["talent-war"], company: "", bio: "Advisor M&A", linkedin: "", joinedAt: "2024-01-13" },
  { name: "Salvatore Morales", email: "salvatore.morales@orbitae.club", password: "Sole-Molo-24", personalEmail: "sm@artefatto.co.uk", role: "member", tier: "member", events: ["talent-war"], company: "Artefatto", bio: "Founder", linkedin: "https://www.linkedin.com/in/salvatore-morales-2888903b/", joinedAt: "2024-02-14" },
  { name: "Rocco Lanzavecchia", email: "rocco.lanzavecchia@orbitae.club", password: "Luna-Lago-33", personalEmail: "rocco.lanzavecchia@martinimanna.com", role: "member", tier: "member", events: ["talent-war"], company: "Martini Manna & Partners", bio: "Avvocato IP", linkedin: "https://www.linkedin.com/in/rocco-lanzavecchia-133552a/", joinedAt: "2024-04-16" },
  { name: "Silvia Pelizzoni", email: "silvia.pelizzoni@orbitae.club", password: "Orione-Rocca-90", personalEmail: "s.pelizzoni@studiremedy.com", role: "member", tier: "member", events: ["talent-war"], company: "Studi Remedy", bio: "CEO - Founder", linkedin: "", joinedAt: "2024-05-17" },
  { name: "Giacomo Caprarola", email: "giacomo.caprarola@orbitae.club", password: "Orbita-Vela-59", personalEmail: "giacomo.caprarola@gmail.com", role: "member", tier: "member", events: ["talent-war"], company: "", bio: "Civilista", linkedin: "", joinedAt: "2024-06-18" },
  { name: "Gianmarco Di Paolo", email: "gianmarco.paolo@orbitae.club", password: "Nova-Terrazza-94", personalEmail: "gianmarco.dipaolo@bip-group.com", role: "member", tier: "member", events: ["talent-war"], company: "BIP", bio: "Project Manager", linkedin: "", joinedAt: "2024-07-19" },
  { name: "Stefano Gervasoni", email: "stefano.gervasoni@orbitae.club", password: "Polare-Terrazza-13", personalEmail: "st.gervasoni@gmail.com", role: "member", tier: "member", events: ["talent-war"], company: "", bio: "Agente Immobiliare", linkedin: "", joinedAt: "2024-08-20" },
  { name: "Laura Imovilli", email: "laura.imovilli@orbitae.club", password: "Marte-Molo-96", personalEmail: "laura.imovilli@psqprofessionisti.com", role: "member", tier: "member", events: ["talent-war"], company: "PSQ Consulting", bio: "Payroll", linkedin: "", joinedAt: "2024-09-21" },
  { name: "Giulia Pagnozzi", email: "giulia.pagnozzi@orbitae.club", password: "Luna-Rocca-83", role: "member", tier: "member", events: ["talent-war"], company: "", bio: "", linkedin: "", joinedAt: "2024-10-22" },

  // --- Member · Come si costruisce il valore di un'azienda (08/07/2026)
  { name: "Alberto Fiasconaro", email: "alberto.fiasconaro@orbitae.club", password: "Eclisse-Lago-51", personalEmail: "alberto.fiasconaro@gmail.com", role: "member", tier: "member", events: ["valore-azienda"], company: "Cisalfa", bio: "Marketing director", linkedin: "https://www.linkedin.com/in/alberto-fiasconaro-29453616/", joinedAt: "2026-07-08" },
  { name: "Marco Ianni", email: "marco.ianni@orbitae.club", password: "Vega-Molo-79", personalEmail: "marco.ianni7@gmail.com", role: "member", tier: "member", events: ["valore-azienda"], company: "NP Digital", bio: "Senior vice president", linkedin: "https://www.linkedin.com/in/marco-ianni7/", joinedAt: "2026-07-08" },
  { name: "Maria Chiara De Cicco", email: "mariachiara.decicco@orbitae.club", password: "Orbita-Scoglio-69", personalEmail: "decicco.mariachiara@gmail.com", role: "member", tier: "member", events: ["valore-azienda"], company: "Unicredit", bio: "Consumer & Retail EMEA Director", linkedin: "https://www.linkedin.com/in/maria-chiara-de-cicco-9496b532/", joinedAt: "2026-07-08" },
  { name: "Andrea Guida", email: "andrea.guida@orbitae.club", password: "Eclisse-Terrazza-98", personalEmail: "andrea.guida@spobe.com", role: "member", tier: "member", events: ["valore-azienda"], company: "CO - Collaboration in Organization", bio: "Independent Advisor", linkedin: "https://www.linkedin.com/in/guidaandrea/", joinedAt: "2026-07-08" },
  { name: "Cinzia Barra", email: "cinzia.barra@orbitae.club", password: "Orione-Arco-81", personalEmail: "cinzia87.barra@gmail.com", role: "member", tier: "member", events: ["valore-azienda"], company: "", bio: "Temporary CFO", linkedin: "https://www.linkedin.com/in/cinzia-barra-0b28982b/", joinedAt: "2026-07-08" },
  { name: "Bernardo Calini", email: "bernardo.calini@orbitae.club", password: "Nettuno-Molo-37", personalEmail: "bernardo.calini@gammamarkets.it", role: "member", tier: "member", events: ["valore-azienda"], company: "Gamma Capital Market", bio: "Consulente finanziario", linkedin: "https://www.linkedin.com/in/bernardocaliniconsulenteesg/", joinedAt: "2026-07-08" },
  { name: "Simone Hong", email: "simone.hong@orbitae.club", password: "Vega-Fiume-12", personalEmail: "simone.hong@lexsa.ai", role: "member", tier: "member", events: ["valore-azienda"], company: "LexSA", bio: "Owner/CEO", linkedin: "https://www.linkedin.com/in/rhshong/", joinedAt: "2026-07-08" },
  { name: "Marcello Codazzi", email: "marcello.codazzi@orbitae.club", password: "Stella-Vetta-92", personalEmail: "m.codazzi@gruppo-grimaldi.it", role: "member", tier: "member", events: ["valore-azienda"], company: "Gruppo Grimaldi", bio: "Owner/CEO", linkedin: "https://www.linkedin.com/in/marcello-codazzi/", joinedAt: "2026-07-08" },
  { name: "Simona Amore", email: "simona.amore@orbitae.club", password: "Astro-Onda-78", personalEmail: "simona.amore@allianzbankfa.it", role: "member", tier: "member", events: ["valore-azienda"], company: "CucinaconAmore", bio: "Imprenditrice", linkedin: "https://www.linkedin.com/in/simona-amore-6a6789b3/", joinedAt: "2026-07-08" },
  { name: "Antonio Urselli", email: "antonio.urselli@orbitae.club", password: "Fenice-Borgo-94", personalEmail: "antonio.urselli@antcapital.it", role: "member", tier: "member", events: ["valore-azienda"], company: "Ant Capital", bio: "Managing Director", linkedin: "https://www.linkedin.com/in/antonio-urselli/", joinedAt: "2026-07-08" },
  { name: "Alessandro Tartaglia", email: "alessandro.tartaglia@orbitae.club", password: "Orbita-Borgo-66", personalEmail: "alessandro.tartaglia@alexandermcqueen.com", role: "member", tier: "member", events: ["valore-azienda"], company: "Alexander McQueen", bio: "Dirigente responsabile di Controllo e Qualità", linkedin: "https://www.linkedin.com/in/alessandro-tartaglia-18a9271b5/", joinedAt: "2026-07-08" },
  { name: "Lorenzo Guarnerio", email: "lorenzo.guarnerio@orbitae.club", password: "Giove-Golfo-80", personalEmail: "l.guarnerio@fippi.com", role: "member", tier: "member", events: ["valore-azienda"], company: "Fippi spa", bio: "Managing Director", linkedin: "https://www.linkedin.com/in/lorenzo-guarnerio-933b2b341/", joinedAt: "2026-07-08" },
  { name: "Simone Panfilo", email: "simone.panfilo@orbitae.club", password: "Stella-Scoglio-72", personalEmail: "simonepanfilo@gmail.com", role: "member", tier: "member", events: ["valore-azienda"], company: "Qeebo", bio: "CEO", linkedin: "https://www.linkedin.com/in/simonepanfilo/", joinedAt: "2026-07-08" },
  { name: "Fabrizio Pedrazzani", email: "fabrizio.pedrazzani@orbitae.club", password: "Astro-Faro-20", personalEmail: "fabrizio.pedrazzani@elam.it", role: "member", tier: "member", events: ["valore-azienda"], company: "Tisettanta / Elam", bio: "Owner/CCO", linkedin: "https://www.linkedin.com/in/fabrizio-p-9480b177/", joinedAt: "2026-07-08" },

  // --- Accesso tecnico ------------------------------------------------
  // Non è un membro del club: `pending` lo tiene fuori dalla directory e
  // dalle orbite, ma l'accesso resta (il login blocca solo gli account
  // sospesi o scaduti).
  { name: "Allen Akinbuli", email: "allen@orbitae.club", role: "admin", tier: "member", status: "pending", events: [], company: "", bio: "", linkedin: "", joinedAt: "2026-07-15" },
];
