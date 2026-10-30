const normalize = value => typeof value === "string" ? value.trim().toLowerCase() : "";
const isEmail = value => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Resolve by both Auth and profile email. A migrated member keeps their ID.
export function planMembers(members, users, profiles) {
  if (!Array.isArray(members) || !members.length) throw new Error("L’elenco membri è vuoto o non valido.");
  const seen = new Set();
  const seenIds = new Set();
  return members.map(member => {
    const name = typeof member.name === "string" ? member.name.trim() : "";
    const email = normalize(member.personalEmail || member.email);
    const legacyEmail = normalize(member.legacyEmail || (member.personalEmail ? member.email : ""));
    if (!name || name.length > 150 || !isEmail(email) || email.endsWith("@orbitae.club")) throw new Error("Ogni nuovo membro richiede nome ed email personale validi.");
    if (seen.has(email)) throw new Error(`Email duplicata nell’elenco: ${email}`);
    seen.add(email);
    if (member.profileId && (typeof member.profileId !== "string" || !users.some(u => u.id === member.profileId))) throw new Error(`ID account non valido per ${email}.`);
    const matches = new Set([
      ...(member.profileId ? [member.profileId] : []),
      ...users.filter(u => normalize(u.email) === email || (legacyEmail && normalize(u.email) === legacyEmail)).map(u => u.id),
      ...profiles.filter(p => normalize(p.email) === email).map(p => p.id),
    ]);
    if (matches.size > 1) throw new Error(`Account in conflitto per ${email}: verifica manuale necessaria.`);
    const id = [...matches][0];
    if (!id && profiles.some(p => typeof p.name === "string" && p.name.trim().toLowerCase() === name.toLowerCase())) throw new Error(`Nome già presente con un’altra email: ${name}. Specifica profileId dopo la verifica, senza creare duplicati.`);
    if (id && seenIds.has(id)) throw new Error(`Lo stesso account compare con email differenti: ${email}.`);
    if (id) seenIds.add(id);
    const user = users.find(u => u.id === id);
    const profile = profiles.find(p => p.id === id);
    if (id && !user) throw new Error(`Profilo privo di account per ${email}.`);
    if (profile && ["suspended", "expired"].includes(profile.status)) throw new Error(`Membro non attivo: ${email}. Verifica prima lo stato.`);
    const migrationRequired = !!user && normalize(user.email) !== email;
    return { id, name, email, member, profileExists: !!profile, action: id ? "existing" : "create", migrationRequired };
  });
}
