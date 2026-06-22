# RB‑03 – Runbook: Kompromitace účtu / identity

> Postup pro **převzetí účtu** (account takeover) – krádež přihlašovacích údajů,
> obejití MFA, zneoprávněné přihlášení, zneužití privilegovaného účtu, kompromitace
> identity v on‑prem AD i v cloudu (M365/Entra ID, Google, IdP).

| | |
|---|---|
| **ID / Název** | RB‑03 Kompromitace účtu / identity |
| **Vlastník** | vedoucí IAM / IRT |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Souvisí s** | [RB‑02 Phishing/BEC](runbook-02-phishing-bec.md) (vstup), [RB‑04 Malware](runbook-04-malware.md) (infostealer), [RB‑01 Ransomware](runbook-01-ransomware.md), [RB‑05 Únik dat](runbook-05-unik-dat.md) |
| **MITRE ATT&CK** | T1078 Valid Accounts · T1110 Brute Force/Password Spraying · T1556 Modify Auth Process/MFA · T1621 MFA Request Generation (fatigue) · T1539 Steal Web Session Cookie · T1528 Steal App Access Token · T1098 Account Manipulation |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas, aktivuj IM.** Urči, zda jde o **běžný** nebo **privilegovaný/admin** účet (privilegovaný = eskalace na SEV‑1/2).
2. **Zadrž účet:** **zneplatni všechny aktivní relace a tokeny** (revoke sessions), **resetuj heslo**, **resetuj/přehodnoť MFA**. (Samotný reset hesla nestačí – útočník drží session cookie/token!)
3. **Zajisti logy** přihlášení a aktivity účtu (IdP/AD/cloud audit) dřív, než je přepíše retence.
4. **Zjisti, co účet dělal:** k čemu přistupoval, co stáhl, koho/co měnil, zda eskaloval oprávnění nebo se šířil dál.
5. **Hledej perzistenci útočníka:** **nově přidané MFA metody**, app hesla, OAuth/enterprise app souhlasy, nová pravidla schránky, **nově vytvořené účty / přiřazené admin role**, registrovaná zařízení.
6. Pokud účet sloužil jako **vstup k malwaru/ransomwaru/exfiltraci** → aktivuj [RB‑04](runbook-04-malware.md)/[RB‑01](runbook-01-ransomware.md)/[RB‑05](runbook-05-unik-dat.md).

### ⛔ NEDĚLEJ
- Nespoléhej **jen na reset hesla** – bez zneplatnění relací a tokenů útočník zůstává přihlášen.
- Neodstraňuj účet/důkazy ukvapeně – nejdřív zajisti logy a zmapuj perzistenci.
- Nevaruj útočníka zbytečně nápadnými kroky, dokud nemáš plán (zvlášť u privilegovaného účtu).

### ☎️ KOHO VOLAT
IM · IAM/IT admin · SOC · Právní/DPO (data) · Management (u admin účtů) · ⟨kontakty⟩

---

## 1. Účel a rozsah
Převzetí identity uživatele nebo služby. **Mimo rozsah / navazuje:** jak se útok
dostal dál (malware [RB‑04](runbook-04-malware.md), ransomware [RB‑01](runbook-01-ransomware.md), únik dat [RB‑05](runbook-05-unik-dat.md)); pokud
vstupem byl phishing → [RB‑02](runbook-02-phishing-bec.md).

## 2. Indikátory a spouštěče
- **Nemožné cestování** (impossible travel), přihlášení z neobvyklé země/IP/zařízení/ASN.
- **MFA fatigue** (záplava push výzev), přihlášení po opakovaných selháních (spraying/brute force).
- **Nová MFA metoda / zařízení** registrované bez vědomí uživatele.
- Hromadné stahování souborů, přístup k neobvyklým datům, **eskalace oprávnění**, vytvoření účtů.
- Vypnuté bezpečnostní výstrahy, nové **OAuth/enterprise app** souhlasy, app hesla, forward pravidla.
- Hlášení uživatele („nemůžu se přihlásit", „chodí mi MFA výzvy").

## 3. Klasifikace závažnosti (specifika)
- **SEV‑1:** kompromitace **Domain Admin / Global Admin / IdP / privilegovaného servisního** účtu; rozsáhlý dopad; přístup ke kritickým datům.
- **SEV‑2:** účet s přístupem k citlivým datům / více systémům.
- **SEV‑3:** běžný účet, omezený přístup, rychle zadrženo.

## 4. Role a aktivace
IM, IAM/identity admin, SOC, u privilegovaných účtů **management + právní**. Viz [metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci).

---

## 5. Postup po fázích

### 0 Příprava
- [ ] **MFA** všude (ideálně phishing‑resistant), blokace legacy auth, **conditional access** (geo/zařízení/riziko).
- [ ] **Detekce identity** (rizikové přihlášení, impossible travel, anomálie) + alerty na **nové MFA metody a admin role**.
- [ ] **PAM / tiering** privilegovaných účtů, JIT/JEA, oddělené admin identity, minimalizace stálých oprávnění.
- [ ] Auditní logy IdP/AD/cloud s retencí; připravené postupy **hromadného resetu** a zneplatnění relací.

### 1 Detekce a analýza
- [ ] Potvrď kompromitaci (vyluč legitimní cestu uživatele). Ověř s uživatelem **out‑of‑band**.
- [ ] **Časová osa přihlášení**: kdy, odkud, jaké zařízení, úspěšná/neúspěšná, jakou metodou (MFA obejito?).
- [ ] **Co účet udělal:** přístupy k datům/aplikacím, stažené soubory, změny konfigurace, e‑maily, vytvořené/změněné účty a oprávnění.
- [ ] **Rozsah:** jde o jeden účet, nebo kampaň (spraying na víc účtů)? Šíření na další identity?
- [ ] **Posouzení dat:** byly dotčeny osobní/citlivé údaje? → vstup pro GDPR a [RB‑05](runbook-05-unik-dat.md).

### 2 Zadržení
- [ ] **Zneplatni všechny relace a tokeny** (revoke sign‑in sessions, refresh tokens, OAuth tokeny).
- [ ] **Reset hesla** + **reset/přehodnocení MFA** (odeber neznámé metody/zařízení).
- [ ] **Zakázat účet**, je‑li to možné bez ztráty důkazů a provozu; u privilegovaného účtu koordinovaně.
- [ ] **Odeber perzistenci:** neznámé MFA metody, app hesla, OAuth/enterprise app grants, forward pravidla, delegace, registrovaná zařízení, nově přidané admin role/účty.
- [ ] Blokuj útočníkovy IP/ASN (conditional access / firewall) a IoC.

### 3 Eradikace
- [ ] Ověř, že útočník nemá žádný další přístup (jiný kompromitovaný účet, klíče, tokeny, zadní vrátka).
- [ ] U kompromitace **AD/Tier‑0** zvaž reset privilegovaných údajů a (po analýze) **dvojí reset `krbtgt`**.
- [ ] Uzavři vstupní vektor (phishing, infostealer, slabé/heslo bez MFA, legacy auth).

### 4 Obnova
- [ ] Obnov uživateli přístup s novými údaji a ověřenou MFA; ověř integritu jeho dat a nastavení.
- [ ] Posílený monitoring účtu a souvisejících systémů.

### 5 Poučení
- [ ] Root cause (jak získal údaje / obešel MFA), úprava politik (conditional access, phishing‑resistant MFA).
- [ ] Metriky: počet zasažených identit, MTTC, zda byla obejita MFA.

---

## 6. Rozhodovací strom
```
Privilegovaný/admin účet (DA/GA/IdP/servisní)?
 ├─ ANO → SEV‑1/2, management + právní, koordinovaný reset, zvaž reset Tier‑0 / krbtgt,
 │         hledej lateral movement a perzistenci napříč doménou/tenantem.
 └─ NE  → SEV‑2/3, reset + relace + MFA + perzistence, ověř dopad na data.

Přistoupil účet k osobním/citlivým datům nebo je exfiltroval?
 └─ ANO → souběžně RB‑05 (únik dat) + posouzení GDPR (ÚOOÚ 72 h).

Posloužil účet ke spuštění malwaru/ransomwaru?
 └─ ANO → souběžně RB‑04 / RB‑01.
```

## 7. Komunikace
- Ověření a pokyny uživateli **out‑of‑band**. U admin účtu informuj management.
- Pokud dotčeni zákazníci/partneři (data, jejich účty) → koordinace s PR a právním.

## 8. Právní a regulatorní
- **GDPR:** přístup k osobním údajům přes kompromitovaný účet může být porušení → **ÚOOÚ 72 h**.
- **NÚKIB 24/72 h** u významného incidentu.
- **Policie ČR/NCOZ** u neoprávněného přístupu. Viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

## 9. Checklist (rychlý)
- [ ] Relace a tokeny **zneplatněny** (ne jen heslo)
- [ ] Heslo + MFA resetovány; neznámé MFA metody/zařízení odebrány
- [ ] Logy zajištěny; sestavena časová osa a seznam dotčených dat/systémů
- [ ] Perzistence odstraněna (OAuth/app hesla/forward/delegace/admin role/nové účty)
- [ ] Privilegovaný účet → eskalace, Tier‑0 / krbtgt zvážen
- [ ] Vstupní vektor uzavřen; navazující runbooky aktivovány
- [ ] Posouzení GDPR/NÚKIB; monitoring; poučení

## 10. Přílohy
Timeline přihlášení · Evidence IoC (IP/ASN/zařízení) · Seznam dotčených dat/systémů · [Chain of custody](00-metodika-a-ramec.md#103-šablona-chain-of-custody) · Kontakty
