// ===================================================================
// ORBITAE — real member list used by create-users.mjs.
// One entry per person; `email` is the login. Add a new object here
// and re-run the script to provision a new member (existing members
// keep their account; their password is regenerated only with --reset).
// ===================================================================

export const MEMBERS = [
  // --- Admin ---------------------------------------------------------
  { name: "Lorenzo Scisciani", email: "lorenzo.scisciani@orbitae.club", role: "admin", company: "Artefatto design studio, Secolo, Movimento Gallery", bio: "Imprenditore arredamento", joinedAt: "2024-11-23" },
  { name: "Andrea Cecchi", email: "andrea.cecchi@orbitae.club", role: "admin", company: "Molinari", bio: "Avvocato M&A", joinedAt: "2024-12-24" },
  { name: "Alessio Angioni", email: "alessio.angioni@orbitae.club", role: "admin", company: "Locura Studio", bio: "Founder e direttore creativo", joinedAt: "2024-01-25" },
  { name: "Giorgio Zurlo", email: "giorgio.zurlo@orbitae.club", role: "admin", company: "Parnet", bio: "Imprenditore AI", joinedAt: "2024-02-26" },
  { name: "Raffaele Di Vuolo", email: "raffaele.vuolo@orbitae.club", role: "admin", company: "DL-Law", bio: "Avvocato giuslavorista", joinedAt: "2024-03-27" },
  { name: "Paolo Savarese", email: "paolo.savarese@orbitae.club", role: "admin", company: "", bio: "Avvocato fiscalista", joinedAt: "2024-04-01" },
  { name: "Stefania Moschella", email: "stefania.moschella@orbitae.club", role: "admin", company: "Studio Confisa", bio: "Consulente dell'amministrazione del personale", joinedAt: "2024-05-02" },
  { name: "Marco Pasquali", email: "marco.pasquali@orbitae.club", role: "admin", company: "PSQ Consulting", bio: "Commercialista e owner", joinedAt: "2024-06-03" },

  // --- Staff ---------------------------------------------------------
  { name: "Santino Cundari", email: "santino.cundari@orbitae.club", role: "staff", company: "Marketing Automation (Zucchetti) - eda.study", bio: "Product & sales manager - founder - marketing e AI", joinedAt: "2024-03-15" },
  { name: "Paolo Lanciani", email: "paolo.lanciani@orbitae.club", role: "staff", company: "De Micheli Lanciani Motta", bio: "Coach e psicologo del lavoro e owner", joinedAt: "2024-07-04" },
  { name: "Anna Albini", email: "anna.albini@orbitae.club", role: "staff", company: "Wellington Management", bio: "Business Developer", joinedAt: "2024-08-05" },

  // --- Membri --------------------------------------------------------
  { name: "Mario Distasi", email: "mario.distasi@orbitae.club", role: "member", company: "Mercer (gruppo Marsh)", bio: "Associate Principal Compensation & Governance", joinedAt: "2024-01-01" },
  { name: "Paolo Tomasino", email: "paolo.tomasino@orbitae.club", role: "member", company: "Ermenegildo Zegna Group", bio: "Group Global Compensation", joinedAt: "2024-02-02" },
  { name: "Giulia Escurolle", email: "giulia.escurolle@orbitae.club", role: "member", company: "MB Kemp", bio: "DPO e avvocato compliance", joinedAt: "2024-03-03" },
  { name: "José Magnaghi", email: "jose.magnaghi@orbitae.club", role: "member", company: "Locura Studio", bio: "Account Manager", joinedAt: "2024-04-04" },
  { name: "Luciano Pastori", email: "luciano.pastori@orbitae.club", role: "member", company: "Locura Studio", bio: "Art Director", joinedAt: "2024-05-05" },
  { name: "Luca Vitali", email: "luca.vitali@orbitae.club", role: "member", company: "", bio: "", joinedAt: "2024-06-06" },
  { name: "Linda Testa", email: "linda.testa@orbitae.club", role: "member", company: "Libera professionista (lavora con fondi investimento)", bio: "Fractional COO - ex COO Trussardi", joinedAt: "2024-07-07" },
  { name: "Silvano Alberi", email: "silvano.alberi@orbitae.club", role: "member", company: "Gamma Capital Market", bio: "Art Advisor - Consulente finanziario", joinedAt: "2024-08-08" },
  { name: "Nicola Mazzoni", email: "nicola.mazzoni@orbitae.club", role: "member", company: "MP Style - FlabAI", bio: "CEO in 3 aziende - Tecnologo", joinedAt: "2024-09-09" },
  { name: "Alberto Frazzini", email: "alberto.frazzini@orbitae.club", role: "member", company: "BIP", bio: "Consulente", joinedAt: "2024-10-10" },
  { name: "Gian Luigi Giliardi", email: "gian.giliardi@orbitae.club", role: "member", company: "Demetra Advisory", bio: "Advisor Finanziario", joinedAt: "2024-11-11" },
  { name: "Alessandro Cappai", email: "alessandro.cappai@orbitae.club", role: "member", company: "Cocuzza", bio: "Avvocato real estate", joinedAt: "2024-12-12" },
  { name: "Alberto Rolla", email: "alberto.rolla@orbitae.club", role: "member", company: "", bio: "Advisor M&A", joinedAt: "2024-01-13" },
  { name: "Salvatore Morales", email: "salvatore.morales@orbitae.club", role: "member", company: "Artefatto", bio: "Founder", joinedAt: "2024-02-14" },
  { name: "Rocco Lanzavecchia", email: "rocco.lanzavecchia@orbitae.club", role: "member", company: "Martini Manna & Partners", bio: "Avvocato IP", joinedAt: "2024-04-16" },
  { name: "Silvia Pelizzoni", email: "silvia.pelizzoni@orbitae.club", role: "member", company: "Studi Remedy", bio: "CEO - Founder", joinedAt: "2024-05-17" },
  { name: "Giacomo Caprarola", email: "giacomo.caprarola@orbitae.club", role: "member", company: "", bio: "Civilista", joinedAt: "2024-06-18" },
  { name: "Gianmarco Di Paolo", email: "gianmarco.paolo@orbitae.club", role: "member", company: "BIP", bio: "Project Manager", joinedAt: "2024-07-19" },
  { name: "Stefano Gervasoni", email: "stefano.gervasoni@orbitae.club", role: "member", company: "", bio: "Agente Immobiliare", joinedAt: "2024-08-20" },
  { name: "Laura Imovilli", email: "laura.imovilli@orbitae.club", role: "member", company: "PSQ Consulting", bio: "Payroll", joinedAt: "2024-09-21" },
  { name: "Giulia Pagnozzi", email: "giulia.pagnozzi@orbitae.club", role: "member", company: "", bio: "", joinedAt: "2024-10-22" },
];
