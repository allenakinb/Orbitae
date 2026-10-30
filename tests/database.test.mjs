import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const admin = "a0000000-0000-4000-8000-000000000001";
const alice = "a0000000-0000-4000-8000-000000000002";
const bob = "a0000000-0000-4000-8000-000000000003";
const event = "e0000000-0000-4000-8000-000000000001";
const invite = "b0000000-0000-4000-8000-000000000001";

test("actual invitation migration and access policies", async t => {
  const db = new PGlite();
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create table auth.users(id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
    await db.exec(readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8"));
    await db.exec(readFileSync(new URL("../supabase/policies.sql", import.meta.url), "utf8"));
    await db.exec("grant select, insert, update on all tables in schema public to authenticated");
    const migration = readFileSync(new URL("../supabase/migration-inviti.sql", import.meta.url), "utf8");
    await db.exec(migration);
    await db.exec(migration);
    for (const [id, name, role] of [[admin, "QA Admin", "admin"], [alice, "QA Alice", "member"], [bob, "QA Bob", "member"]]) {
      await db.query("insert into auth.users values ($1,$2)", [id, `${name.replaceAll(" ", "")}@example.com`]);
      await db.query("insert into profiles(id,name,email,role,status) values ($1,$2,$3,$4,'active')", [id, name, `${name.replaceAll(" ", "")}@example.com`, role]);
    }
    await db.query("insert into events(id,title,date) values ($1,'QA CONSEGNA','2026-12-10')", [event]);
    await db.query("insert into event_attendees values ($1,$2)", [event, alice]);
    await db.query("insert into event_invitations(id,event_id,profile_id) values ($1,$2,$3)", [invite, event, alice]);
    async function asUser(id, callback) {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
      await db.exec("set role authenticated");
      try { return await callback(); }
      finally { await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)"); }
    }
    await t.test("members see only their invitations and cannot forge other responses", async () => {
      await asUser(bob, async () => {
        assert.equal((await db.query("select * from event_invitations")).rows.length, 0);
        await assert.rejects(db.query("select respond_invitation($1,'accepted')", [invite]), /unavailable/);
        await assert.rejects(db.query("insert into event_invitations(event_id,profile_id) values ($1,$2)", [event,bob]), /row-level security/);
      });
      await asUser(alice, async () => {
        assert.equal((await db.query("select * from event_invitations")).rows.length, 1);
        assert.equal((await db.query("update event_invitations set status='revoked' returning id")).rows.length, 0);
        await db.query("select respond_invitation($1,'accepted')", [invite]);
      });
      assert.equal((await db.query("select status from event_invitations where id=$1",[invite])).rows[0].status,"accepted");
    });
    await t.test("revoked and expired invitations cannot accept responses", async () => {
      await asUser(admin, () => db.query("update event_invitations set status='revoked' where id=$1",[invite]));
      await asUser(alice, () => assert.rejects(db.query("select respond_invitation($1,'accepted')",[invite]), /unavailable/));
      await db.query("update event_invitations set status='pending', expires_at=now()-interval '1 day' where id=$1",[invite]);
      await asUser(alice, () => assert.rejects(db.query("select respond_invitation($1,'declined')",[invite]), /unavailable/));
    });
    await t.test("suspended admins lose invitation management permissions", async () => {
      for (const status of ["suspended", "expired"]) {
        await db.query("update profiles set status=$1 where id=$2",[status,admin]);
        await asUser(admin, async () => {
          assert.equal((await db.query("select * from event_invitations")).rows.length, 0);
          await assert.rejects(db.query("update profiles set status='active' where id=$1",[admin]), /managed by administrators/);
          await assert.rejects(db.query("insert into event_invitations(event_id,profile_id) values ($1,$2)",[event,bob]), /row-level security/);
        });
      }
    });
    await t.test("self-service cannot change role or unconfirmed email", async () => {
      await asUser(alice, async () => {
        for (const patch of ["role='admin'","status='suspended'","tier='founder'","email='unconfirmed@example.com'"]) await assert.rejects(db.exec(`update profiles set ${patch} where id='${alice}'`), /managed by administrators|Confirm the new/);
        await db.query("update profiles set company='QA Company' where id=$1",[alice]);
      });
    });
    await t.test("confirmed Auth email keeps profile ID, role and attendance", async () => {
      await db.query("update auth.users set email='confirmed@example.com' where id=$1",[alice]);
      const profile = (await db.query("select id,email,role from profiles where id=$1",[alice])).rows[0];
      assert.deepEqual(profile, {id:alice,email:"confirmed@example.com",role:"member"});
      assert.equal((await db.query("select * from event_attendees where profile_id=$1",[alice])).rows.length,1);
    });
    await t.test("guest recipients and duplicate member invites are constrained", async () => {
      await assert.rejects(db.query("insert into event_invitations(event_id) values ($1)",[event]), /invitation_recipient/);
      await assert.rejects(db.query("insert into event_invitations(event_id,guest_name,email) values ($1,'QA Guest','guest@example.com')",[event]), /invitation_recipient/);
      await assert.rejects(db.query("insert into event_invitations(event_id,profile_id) values ($1,$2)",[event,alice]), /unique constraint/);
    });
  } finally { await db.close(); }
});
