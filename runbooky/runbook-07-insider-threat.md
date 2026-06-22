# RB‑07 – Runbook: Insider threat / zneužití oprávnění

> Postup pro **vnitřní hrozbu** – zaměstnanec, dodavatel nebo partner, který
> (úmyslně či z nedbalosti) zneužije své oprávněné přístupy: krádež dat, sabotáž,
> podvod, zneužití privilegií. Specifikum: **citlivost (HR, právní), důkazní
> opatrnost a diskrétnost**.

| | |
|---|---|
| **ID / Název** | RB‑07 Insider threat |
| **Vlastník** | CISO + HR + právní |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní – přísně důvěrné |
| **Souvisí s** | [RB‑05 Únik dat](runbook-05-unik-dat.md), [RB‑03 Kompromitace účtu](runbook-03-kompromitace-uctu.md), [RB‑01 Ransomware](runbook-01-ransomware.md) (zřídka insider‑asistovaný) |
| **MITRE ATT&CK** | T1078 Valid Accounts · T1052/T1567 Exfiltration · T1213 Data from Repositories · T1485 Data Destruction · T1098 Account Manipulation · T1222 abuse of permissions |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas, aktivuj IM a OD ZAČÁTKU zapoj HR a PRÁVNÍ.** Insider je personální i právní záležitost, ne jen technická.
2. **Zachovej diskrétnost a presumpci neviny.** Úzký okruh „need to know". **Nevyslýchej a nekonfrontuj** osobu předčasně – mohla by zničit důkazy nebo způsobit větší škodu.
3. **Tiše zajisti důkazy:** logy přístupů, DLP, e‑mail, USB/tisk, cloud, VPN, kamerové/fyzické přístupy – **podle pokynů právního**, aby byly použitelné.
4. **Posuď bezprostřední riziko** (probíhá exfiltrace/sabotáž/odchod s daty?). Pokud ano → **zadrž přístup** koordinovaně (viz rozhodovací strom).
5. Pokud unikla data → souběžně [RB‑05](runbook-05-unik-dat.md); pokud jde o zneužitý/sdílený účet, zvaž [RB‑03](runbook-03-kompromitace-uctu.md).
6. **Synchronizuj technické a personální kroky** (odebrání přístupů vs. pohovor/výpověď musí proběhnout koordinovaně a ve správný okamžik).

### ⛔ NEDĚLEJ
- Neobviňuj a nekonfrontuj bez důkazů a bez HR/právního – riziko žaloby i zničení důkazů.
- Neodebírej přístupy nápadně předčasně, pokud to ohrozí sběr důkazů – ale **nikdy** na úkor zastavení aktivní škody.
- Nesleduj zaměstnance způsobem, který porušuje pracovněprávní předpisy/GDPR – vždy přes právní.

### ☎️ KOHO VOLAT
IM · **HR** · **Právní/DPO** · CISO · (dle situace) Management, fyzická bezpečnost, Policie · ⟨kontakty⟩

---

## 1. Účel a rozsah
Zneužití oprávněných přístupů insiderem (úmyslné i z nedbalosti). **Navazuje:**
únik dat → [RB‑05](runbook-05-unik-dat.md); kompromitace účtu zvenčí (ne insider) → [RB‑03](runbook-03-kompromitace-uctu.md). Tento
runbook drží **personálně‑právní a důkazní** rozměr.

## 2. Indikátory a spouštěče
- **Hromadné stahování / kopírování** dat, přístup mimo pracovní náplň, aktivita mimo pracovní dobu.
- Kopírování na **USB/osobní cloud/osobní e‑mail**, tisk velkého objemu, přeposílání citlivých dokumentů ven.
- Pokusy o **eskalaci oprávnění**, přístup do oblastí mimo roli, vytváření „zadních" účtů.
- **Souvislost s odchodem** (výpověď, nespokojenost), sabotáž (mazání, změny), podvod.
- Upozornění kolegy / whistleblower; nález při auditu.

## 3. Klasifikace závažnosti (specifika)
- **SEV‑1:** **privilegovaný insider** (admin) s rozsáhlým přístupem; aktivní sabotáž; krádež velkého objemu citlivých dat / obchodního tajemství; bezpečnostní riziko.
- **SEV‑2:** cílená krádež omezeného objemu dat, zneužití přístupu.
- **SEV‑3:** nedbalostní porušení bez zlého úmyslu (omyl, obejití pravidel).

## 4. Role a aktivace
**IM koordinuje; HR a právní jsou rovnocenní vlastníci** (personální/právní kroky);
DFIR/SOC technicky, fyzická bezpečnost dle potřeby. Úzký okruh. Viz [metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci).

---

## 5. Postup po fázích

### 0 Příprava
- [ ] **Least privilege**, segregace povinností, **PAM**, pravidelná recenze oprávnění, **JML proces** (joiner‑mover‑leaver).
- [ ] **Monitoring a DLP** (právně ošetřené, transparentní vůči zaměstnancům dle zákoníku práce/GDPR), logování přístupů a USB/tisku.
- [ ] **Politika přijatelného užívání** a NDA; jasný **proces nahlášení** podezření (i whistleblowing).
- [ ] Předem domluvený **postup koordinace HR–právní–IT** pro citlivé případy.

### 1 Detekce a analýza (diskrétně)
- [ ] Potvrď podezření **na základě důkazů**, ne dojmu; veď **přesnou časovou osu**.
- [ ] **Tiše zajisti důkazy** (logy, DLP, e‑mail, USB, cloud, VPN, fyzické přístupy) – **podle pokynů právního**, aby byly procesně použitelné a v souladu s GDPR.
- [ ] Urči **rozsah**: jaká data/systémy, kolik, kam směřovala, zda už opustila organizaci.
- [ ] Posuď **úmysl vs. nedbalost** (rozhoduje o dalším postupu – HR vs. trestní).

### 2 Zadržení
- [ ] **Synchronizuj** odebrání přístupů s personálním krokem (pohovor/výpověď/suspendace) – načasování řídí HR + právní + IM.
- [ ] **Zruš přístupy** (účty, VPN, cloud, fyzický vstup, mobilní zařízení), zneplatni relace/tokeny/klíče, které osoba znala.
- [ ] Zajisti **firemní zařízení** a nosiče (forenzně, chain of custody).
- [ ] Zastav probíhající exfiltraci/sabotáž (priorita, pokud běží – i za cenu časnější konfrontace).

### 3 Eradikace
- [ ] Odeber veškerá zbytková oprávnění a **„zadní vrátka"** (sdílené účty, klíče, automatizace, plánované úlohy vytvořené insiderem).
- [ ] Rotace tajemství, ke kterým měl přístup; revize jím provedených změn.

### 4 Obnova
- [ ] Obnov integritu dotčených dat/systémů (z čistých záloh, pokud byla sabotáž), ověř změny.
- [ ] Zhodnoť a doplň kontrolní mechanismy, které selhaly.

### 5 Poučení
- [ ] Blameless po technické stránce, ale s personálně‑právními závěry; uprav oprávnění, monitoring, JML, kulturu.
- [ ] Metriky: čas do detekce, objem dotčených dat, zda fungoval least privilege a DLP.

---

## 6. Rozhodovací strom
```
Probíhá AKTIVNÍ škoda (exfiltrace/sabotáž/mazání) PRÁVĚ TEĎ?
 ├─ ANO → ZASTAV ji ihned (odeber přístup / izoluj), i za cenu časnější konfrontace.
 │         Souběžně zajisti důkazy a zapoj HR+právní.
 └─ NE  → Postupuj DISKRÉTNĚ: zajisti důkazy, naplánuj koordinovaný krok HR+právní+IT.

Úmysl, nebo nedbalost?
 ├─ Nedbalost → primárně HR + doškolení + náprava kontrol.  (často SEV‑3)
 └─ Úmysl     → právní + zvážit trestní oznámení (Policie/NCOZ) + pracovněprávní kroky.

Unikla data ven?
 └─ ANO → souběžně RB‑05 (únik dat) + posouzení GDPR.
```

## 7. Komunikace
- **Maximální diskrétnost**, úzký okruh „need to know" (ochrana vyšetřování i osoby).
- Externí/personální komunikaci řídí **HR + právní + PR**; nic nepředjímej.
- Dotčení zákazníci/partneři jen po potvrzení a přes právní. Viz [metodika §11](00-metodika-a-ramec.md#11-komunikace).

## 8. Právní a regulatorní
- **Pracovní právo:** monitoring a důkazy musí být v souladu se zákoníkem práce a GDPR – **vždy přes právní** (jinak nepoužitelné a riziko žaloby).
- **GDPR:** únik osobních údajů → [RB‑05](runbook-05-unik-dat.md) + **ÚOOÚ 72 h**.
- **Trestní:** krádež dat / obchodního tajemství / sabotáž → **Policie ČR/NCOZ** (řídí právní).
- **NÚKIB 24/72 h** u významného incidentu. Viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

## 9. Checklist (rychlý)
- [ ] HR + právní zapojeni od začátku; úzký okruh, diskrétnost, presumpce neviny
- [ ] Důkazy zajištěny dle pokynů právního (procesně použitelné, GDPR‑compliant)
- [ ] Určen rozsah dat/systémů, úmysl vs. nedbalost
- [ ] Odebrání přístupů **synchronizováno** s personálním krokem; zařízení zajištěna
- [ ] Aktivní škoda zastavena; zbytková oprávnění a tajemství odstraněna/rotována
- [ ] Únik dat → RB‑05 + GDPR; zváženo trestní oznámení; poučení a náprava kontrol

## 10. Přílohy
Timeline log (přísně důvěrné) · Soupis dotčených dat/systémů · [Chain of custody](00-metodika-a-ramec.md#103-šablona-chain-of-custody) · Kontakty (HR, právní, fyzická bezpečnost, policie) · Záznam koordinace HR–právní–IT
