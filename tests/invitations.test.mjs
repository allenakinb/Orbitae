import { test } from "node:test";
import assert from "node:assert/strict";
import { hashInvitationToken, newInvitationToken, validInvitationToken, escapeHtml, publicOrigin } from "../lib/server/invitations.ts";

test("invitation links are unguessable and database identifiers cannot substitute for them", () => {
  const tokens = Array.from({length:100}, newInvitationToken);
  assert.equal(new Set(tokens).size, 100);
  assert.ok(tokens.every(validInvitationToken));
  assert.equal(validInvitationToken("a1b2c3d4-0001-4000-8000-000000000001"), false);
  assert.equal(validInvitationToken("../admin"), false);
  assert.notEqual(hashInvitationToken(tokens[0]), tokens[0]);
});
test("guest and event text cannot insert links or executable HTML into emails", () => {
  const payload = `<a href="https://attacker.test">O'Brien & Co</a>`;
  assert.equal(escapeHtml(payload), "&lt;a href=&quot;https://attacker.test&quot;&gt;O&#39;Brien &amp; Co&lt;/a&gt;");
});
test("production invitation links never trust the request hostname", () => {
  const oldMode = process.env.NODE_ENV;
  const oldSite = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.throws(() => publicOrigin(new Request("https://attacker.test/api/invitations")), /Configure/);
    process.env.NEXT_PUBLIC_SITE_URL = "https://orbitae.club";
    assert.equal(publicOrigin(new Request("https://attacker.test/api/invitations")), "https://orbitae.club");
  } finally {
    if(oldMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldMode;
    if(oldSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL; else process.env.NEXT_PUBLIC_SITE_URL = oldSite;
  }
});

test("invitation payloads reject malformed recipients before any database mutation", async () => {
  const { invitationInput } = await import("../lib/server/invitations.ts");
  const id = "a1b2c3d4-0001-4000-8000-000000000001";
  for (const body of [null, [], {eventId:id}, {eventId:"-".repeat(36),name:"QA",email:"qa@example.com"}, {eventId:id,name:"QA",email:"invalid"}, {eventId:id,profileId:id,sendEmail:"true"}]) assert.equal(invitationInput(body),null);
  assert.deepEqual(invitationInput({eventId:id,name:" QA ",email:" QA@example.com "}), {eventId:id,name:"QA",email:"qa@example.com",sendEmail:false});
  assert.deepEqual(invitationInput({eventId:id,profileId:id,sendEmail:true}), {eventId:id,profileId:id,sendEmail:true});
});
test("production rejects non-HTTPS invitation origins", () => {
  const oldMode=process.env.NODE_ENV, oldSite=process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NODE_ENV="production";
    for(const value of ["javascript:alert(1)","http://orbitae.club"]){
      process.env.NEXT_PUBLIC_SITE_URL=value;
      assert.throws(()=>publicOrigin(new Request("https://orbitae.club")),/HTTPS/);
    }
  } finally {
    if(oldMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldMode;
    if(oldSite===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=oldSite;
  }
});

test("reissuing a member invite follows the current profile email after migration", async () => {
  const { currentInvitationRecipient } = await import("../lib/server/invitations.ts");
  const invite = {profile_id:"member-id",guest_name:"QA Member",email:"old@orbitae.club"};
  const recipient = await currentInvitationRecipient(invite, id => {
    assert.equal(id,"member-id");
    return Promise.resolve({data:{name:"QA Member",email:"confirmed@example.com",status:"active"},error:null});
  });
  assert.deepEqual(recipient,{name:"QA Member",email:"confirmed@example.com"});
  for(const status of ["suspended","expired"]) assert.equal(await currentInvitationRecipient(invite,()=>Promise.resolve({data:{name:"QA",email:"confirmed@example.com",status},error:null})),null);
  assert.equal(await currentInvitationRecipient(invite,()=>Promise.resolve({data:null,error:new Error("Unavailable")})),null);
  const guest = {profile_id:null,guest_name:"QA Guest",email:"guest@example.com"};
  assert.deepEqual(await currentInvitationRecipient(guest,()=>{throw Error("Guests must not look up member data");}),{name:"QA Guest",email:"guest@example.com"});
});
