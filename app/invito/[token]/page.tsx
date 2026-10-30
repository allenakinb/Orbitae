"use client";
import { use, useEffect, useState } from "react";
import { OrbitMark } from "@/components/brand/OrbitMark";
import { Button } from "@/components/ui/Button";
type Invitation = { name: string; status: string; event: { title: string; subtitle?: string; date: string; time?: string; location: string; description?: string } };
export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
 const { token } = use(params);
 const [invitation,setInvitation]=useState<Invitation|null>(null);
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [saved,setSaved]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  void fetch(`/api/invitations/${encodeURIComponent(token)}`,{signal:controller.signal,cache:"no-store"}).then(async r=>{
   const data=await r.json();if(!r.ok)throw new Error(data.error); if(!controller.signal.aborted)setInvitation(data);
  }).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Invito non disponibile.");});
  return ()=>controller.abort();
 },[token]);
 async function respond(status:string){
  if(busy)return;setBusy(true);setError("");setSaved(false);
  try{const r=await fetch(`/api/invitations/${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});const data=await r.json();if(!r.ok)throw new Error(data.error);setInvitation(i=>i?{...i,status}:i);setSaved(true);}
  catch(e){setError(e instanceof Error?e.message:"Risposta non salvata. Riprova.");}finally{setBusy(false);}
 }
 return <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-12">
  <OrbitMark size={60}/><p className="mt-5 font-display text-xl">ORBITAE</p>
  {error&&<p role="alert" className="mt-6 text-accent-hover">{error}</p>}
  {!invitation&&!error&&<p role="status" className="mt-6">Caricamento invito…</p>}
  {invitation&&<><p className="mt-10 text-ink-muted">Ciao {invitation.name}, sei invitato a</p><h1 className="mt-3 font-display text-3xl sm:text-4xl">{invitation.event.title}</h1>
  {invitation.event.subtitle&&<p className="mt-3 text-lg">{invitation.event.subtitle}</p>}
  <p className="mt-6 text-ink-muted">{new Date(`${invitation.event.date}T12:00:00`).toLocaleDateString("it-IT",{day:"numeric",month:"long",year:"numeric"})}{invitation.event.time&&` · ${invitation.event.time}`} · {invitation.event.location}</p>
  {invitation.event.description&&<p className="mt-6 leading-relaxed">{invitation.event.description}</p>}
  <p className="mt-8" role="status">{saved?"Risposta salvata. ":""}{invitation.status==="accepted"?"La tua partecipazione è confermata.":invitation.status==="declined"?"Hai declinato l’invito.":"Conferma la tua partecipazione."}</p>
  <div className="mt-5 flex flex-wrap gap-3"><Button disabled={busy} onClick={()=>void respond("accepted")}>Partecipo</Button><Button disabled={busy} onClick={()=>void respond("declined")}>Non partecipo</Button></div>
  <p className="mt-8 text-sm text-ink-muted">Questo invito è personale. Conserva il link per aggiornare la tua risposta.</p></>}
 </main>;
}
