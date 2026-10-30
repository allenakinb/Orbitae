import { test } from "node:test";
import assert from "node:assert/strict";
import { planMembers } from "../scripts/lib/member-plan.mjs";

test("new members use a personal email, with no password in the provisioning plan", () => {
  const [row] = planMembers([{name:"QA New", email:" NEW@example.com "}], [], []);
  assert.equal(row.action,"create"); assert.equal(row.email,"new@example.com"); assert.equal(row.password,undefined);
  assert.throws(() => planMembers([{name:"QA",email:"qa@orbitae.club"}],[],[]), /personale/);
});
test("both old and migrated accounts resolve to the original ID without overwriting profiles", () => {
  const member = {name:"QA Member", email:"old@orbitae.club", personalEmail:"member@example.com"};
  for (const email of [member.email, member.personalEmail, "changed@example.com"]) {
    const [row] = planMembers([member],[{id:"original",email}],[{id:"original",email:member.personalEmail,status:"active"}]);
    assert.equal(row.id,"original"); assert.equal(row.action,"existing"); assert.equal(row.profileExists,true);
    assert.equal(row.migrationRequired,email!==member.personalEmail);
  }
});
test("duplicate emails, conflicting accounts and suspended members stop the entire plan", () => {
  const member = {name:"QA",email:"member@example.com",legacyEmail:"old@orbitae.club"};
  assert.throws(() => planMembers([member,member],[],[]), /duplicata/);
  assert.throws(() => planMembers([member],[{id:"one",email:member.email},{id:"two",email:member.legacyEmail}],[]), /conflitto/);
  assert.throws(() => planMembers([member],[{id:"one",email:member.email}],[{id:"one",email:member.email,status:"suspended"}]), /non attivo/);
});
test("a stale address cannot create a second account for a migrated member", () => {
  const users=[{id:"original",email:"new@example.com"}];
  const profiles=[{id:"original",name:"QA Member",email:"new@example.com",status:"active"}];
  const input={name:"QA Member",email:"stale@example.com"};
  assert.throws(()=>planMembers([input],users,profiles),/Nome già presente/);
  assert.equal(planMembers([{...input,profileId:"original"}],users,profiles)[0].id,"original");
});
