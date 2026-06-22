# RB‑02 – Runbook: Phishing a kompromitace e‑mailu (BEC)

> Postup pro **phishing**, **kompromitaci e‑mailové schránky** a **BEC**
> (Business Email Compromise – podvody s platbami/fakturami přes e‑mail).

| | |
|---|---|
| **ID / Název** | RB‑02 Phishing & BEC |
| **Vlastník** | vedoucí SOC / IRT |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Souvisí s** | [RB‑03 Kompromitace účtu](runbook-03-kompromitace-uctu.md), [RB‑04 Malware](runbook-04-malware.md) (příloha), [RB‑01 Ransomware](runbook-01-ransomware.md) (phishing jako vstup), [RB‑05 Únik dat](runbook-05-unik-dat.md) |
| **MITRE ATT&CK** | T1566 Phishing · T1566.001/.002 (příloha/odkaz) · T1534 Internal Spearphishing · T1114 Email Collection · T1098.002 Add Mailbox Rules/Delegation · T1656 Impersonation · T1657 Financial Theft |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas, aktivuj IM.** Urči podtyp: **(a) phishing na heslo** · **(b) phishing s přílohou/malware** · **(c) BEC / podvodná platba**.
2. **Zajisti původní e‑mail** (vč. **plných hlaviček**) – přeposlat jako přílohu / exportovat. **Nemazat.**
3. **Zjisti rozsah:** kdo e‑mail dostal, **kdo klikl / zadal údaje / otevřel přílohu** (gateway/proxy/EDR logy).
4. Pokud někdo **zadal heslo** → přejdi i na [RB‑03](runbook-03-kompromitace-uctu.md): **reset hesla + zneplatnění relací a tokenů**.
5. Pokud **příloha/odkaz spustil malware** → souběžně [RB‑04](runbook-04-malware.md), izoluj endpoint.
6. **BEC / podvodná platba:** **OKAMŽITĚ kontaktuj banku** (zastavení/recall platby) a finanční oddělení; ověř platební pokyny **zpětným voláním** na známé číslo, ne z e‑mailu.
7. **Zkontroluj kompromitovanou schránku** na **pravidla auto‑forward/přesměrování, delegace, OAuth grants** (perzistence útočníka).

### ⛔ NEDĚLEJ
- Nemaž podezřelý e‑mail (je to důkaz) – nejdřív zajisti, pak teprve plošně odstraňuj ze schránek.
- Neklikej na odkazy/přílohy pro „ověření" mimo izolované prostředí (sandbox).
- Neměň platební pokyny ani nepotvrzuj platbu na základě e‑mailu bez **zpětného ověření**.

### ☎️ KOHO VOLAT
IM · SOC · Banka (BEC) · Finanční ředitel (BEC) · Právní/DPO · ⟨kontakty⟩

---

## 1. Účel a rozsah
Phishing (krádež údajů), kompromitace schránky a BEC. **Mimo rozsah:** pokud
phishing vedl k převzetí účtu → [RB‑03](runbook-03-kompromitace-uctu.md); pokud k malwaru → [RB‑04](runbook-04-malware.md);
pokud k šifrování → [RB‑01](runbook-01-ransomware.md). Tyto runbooky často běží **souběžně**.

## 2. Indikátory a spouštěče
- Hlášení uživatele (tlačítko „report phish"), detekce e‑mail gateway.
- Přihlašovací stránka napodobující firemní/M365/Google login.
- **Neočekávané pravidlo schránky** (auto‑forward ven, mazání do koše), nová delegace, nový OAuth souhlas.
- **Náhlá změna platebních údajů** dodavatele, urgentní žádost o platbu/dárkové karty, „CEO fraud".
- Odchozí spam/phishing z interní schránky (interní spearphishing).

## 3. Klasifikace závažnosti (specifika)
- **SEV‑1/2:** kompromitace **privilegované** schránky (vedení, finance, IT admin); aktivní BEC s **vysokou částkou**; rozsáhlá kampaň s mnoha oběťmi; exfiltrace dat ze schránky (osobní údaje).
- **SEV‑3:** ojedinělý klik bez zadání údajů, zachyceno gatewayem.

## 4. Role a aktivace
IM, SOC/analytik, e‑mail admin, u BEC **finance + banka + právní**. RACI viz [metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci).

---

## 5. Postup po fázích

### 0 Příprava
- [ ] **SPF, DKIM, DMARC** (reject), anti‑spoofing, e‑mail gateway/sandbox příloh a URL.
- [ ] **MFA** všude (odolné vůči phishingu – FIDO2/passkey, kde lze), blokace legacy auth.
- [ ] **Tlačítko hlášení phishingu** + pravidelný **security awareness** trénink a phishing simulace.
- [ ] **Procedura ověřování plateb** (dual control + zpětné volání na ověřené číslo při změně účtu).
- [ ] **Auditní logy** e‑mailu (M365/Google) zapnuté s retencí; alerty na nová forward pravidla a rizikové přihlášení.

### 1 Detekce a analýza
- [ ] **Zajisti vzorek e‑mailu** s plnými hlavičkami; extrahuj **IoC** (odesílatel, URL, domény, hash příloh, IP).
- [ ] **Scoping:** komu doručeno, kdo otevřel/klikl/zadal údaje/otevřel přílohu (gateway, proxy, EDR, auth logy).
- [ ] Analyzuj URL/přílohu v **sandboxu** (zda krade hesla nebo spouští malware).
- [ ] U kompromitované schránky prověř: **přihlášení (geo/IP/zařízení), odeslané položky, pravidla schránky, delegace, OAuth grants, app hesla**.
- [ ] **BEC:** identifikuj podvodnou transakci (částka, příjemce, kdy), rozsah komunikace, zda došlo k platbě.

### 2 Zadržení
- [ ] **Blokuj** odesílatele/URL/domény/IP na gatewayi, proxy, DNS.
- [ ] **Odstraň phishingový e‑mail ze všech schránek** (purge) – až po zajištění vzorku.
- [ ] Kompromitovaná schránka → **reset hesla, zneplatnění relací a tokenů, reset MFA** (viz [RB‑03](runbook-03-kompromitace-uctu.md)).
- [ ] **Odstraň perzistenci v schránce:** škodlivá forward/inbox pravidla, delegace, **OAuth souhlasy**, app hesla.
- [ ] **BEC:** banka – **stop/recall platby, zmrazení**; nahlas podvod; varuj dotčené (dodavatel, finance).

### 3 Eradikace
- [ ] Ověř, že v žádné zasažené schránce nezůstala perzistence (pravidla, granty, delegace).
- [ ] Pokud klik spustil malware → dokonči eradikaci dle [RB‑04](runbook-04-malware.md).
- [ ] Uzavři vektor: dolaď filtry/DMARC, zablokuj podobné domény (lookalike), cílené doškolení obětí.

### 4 Obnova
- [ ] Obnov přístup uživatelům (nové údaje, ověřené MFA).
- [ ] Posílený monitoring zasažených schránek a plateb.
- [ ] BEC: sleduj, zda nedošlo k dalším pokusům; ověř integritu dodavatelských kontaktů.

### 5 Poučení
- [ ] Vyhodnoť, proč filtr/uživatel selhal; uprav detekci, trénink, platební proces.
- [ ] Metriky: počet zasažených, čas do purge, čas do blokace, (BEC) recoverovaná částka.

---

## 6. Rozhodovací strom
```
Co uživatel udělal?
 ├─ Jen obdržel / nahlásil           → blokuj IoC, purge, doškol.  (SEV‑3)
 ├─ Klikl, ZADAL přihlašovací údaje  → + RB‑03 (reset, relace, MFA, perzistence).
 ├─ Otevřel PŘÍLOHU / spustil obsah  → + RB‑04 (izolace endpointu, malware).
 └─ Šlo o BEC / platbu               → BANKA ihned + finance + právní + policie.
                                        Ověř platby zpětným voláním.
```

## 7. Komunikace
- Varuj **ostatní zaměstnance** o probíhající kampani (bez šíření živých odkazů).
- BEC: koordinace s **bankou, dodavatelem, právním**; zvaž oznámení dotčeným.
- Jeden hlas ven (PR + IM). Viz [metodika §11](00-metodika-a-ramec.md#11-komunikace).

## 8. Právní a regulatorní
- **BEC = trestný čin** (podvod) → **Policie ČR/NCOZ**, banka.
- **GDPR:** byly‑li ve schránce/exfiltrovány osobní údaje → posouzení **ÚOOÚ 72 h**.
- **NÚKIB 24/72 h**, pokud jde o významný incident u regulovaného subjektu.
- Detaily viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

## 9. Checklist (rychlý)
- [ ] Vzorek e‑mailu + hlavičky zajištěn, IoC extrahovány
- [ ] Scope: doručeno / kliklo / zadalo údaje / otevřelo přílohu
- [ ] IoC blokovány, e‑mail purgnut ze schránek
- [ ] Kompromitované účty: reset + relace/tokeny + MFA + perzistence (pravidla/OAuth/delegace)
- [ ] BEC: banka kontaktována, platba zastavena/recall, policie, ověření zpětným voláním
- [ ] Navazující RB‑03/RB‑04 aktivovány dle potřeby
- [ ] Právní/DPO posoudili GDPR/NÚKIB; doškolení; poučení

## 10. Přílohy
Timeline log · Evidence IoC · [Chain of custody](00-metodika-a-ramec.md#103-šablona-chain-of-custody) · Kontakty (vč. banky) · Vzor varování zaměstnancům
