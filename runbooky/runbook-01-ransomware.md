# RB‑01 – Runbook: Ransomware

> Postup pro zvládnutí incidentu typu **ransomware** (šifrování dat a vydírání,
> včetně dvojího/trojího vydírání s exfiltrací dat). Navržen tak, aby ho šlo
> **vzít a reálně podle něj řešit probíhající incident**.

| | |
|---|---|
| **ID / Název** | RB‑01 Ransomware |
| **Vlastník** | CISO / vedoucí IRT |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Souvisí s** | [RB‑05 Únik dat](runbook-05-unik-dat.md) (dvojí vydírání), [RB‑03 Kompromitace účtu](runbook-03-kompromitace-uctu.md), [RB‑04 Malware](runbook-04-malware.md), [RB‑02 Phishing/BEC](runbook-02-phishing-bec.md) (vstupní vektor) |
| **MITRE ATT&CK** | T1486 Data Encrypted for Impact · T1490 Inhibit System Recovery · T1489 Service Stop · T1078 Valid Accounts · T1021 Remote Services (RDP/SMB) · T1570 Lateral Tool Transfer · T1567/T1048 Exfiltration · T1562 Impair Defenses · T1484 Domain Policy Modification |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas** a **aktivuj Incident Managera** (IM). IM vyhlásí incident a SEV (ransomware = výchozí **SEV‑1/2**).
2. **Izoluj zasažené systémy ze sítě – ale NEVYPÍNEJ je.**
   - V EDR: *Network Isolate / Contain*. Bez EDR: **vytáhni ethernet / odpoj Wi‑Fi**.
   - Cíl: zastavit šíření, **zachovat paměť a důkazy**.
3. **Ochraň „korunní klenoty":** okamžitě ověř a izoluj **zálohy**, **doménové řadiče (DC) / IdP**, **virtualizační a cloud správu**. Útočník je cílí jako první.
4. **Přejdi na out‑of‑band komunikaci** (telefony, předem domluvená appka). **Předpokládej, že firemní e‑mail/Teams útočník čte.**
5. **Zajisti volatilní důkazy** u vzorku zasažených strojů (dump RAM, image disku) dřív, než cokoli měníš. Ulož **vzorek ransom note** a **zašifrovaný soubor**.
6. **Zahaj časovou osu** (kdo, co, kdy) – jeden zapisovatel.
7. **Spusť právní a oznamovací hodiny:** uvědom **právní/DPO** a **management**; nastav timery **NÚKIB 24 h** a **GDPR/ÚOOÚ 72 h** (viz [§8](#8-právní-a-regulatorní-povinnosti)).
8. **Aktivuj externí podporu:** DFIR retainer a **kyberpojišťovnu** (často nutné hlásit do 24–72 h, jinak krácení plnění).

### ⛔ NEDĚLEJ (nevratné chyby)
- **Nevypínej a nerestartuj** zasažené stroje (ztráta paměti/důkazů; restart může spustit další šifrování). Když je nutné „odstavit", **izoluj síť** nebo **hibernuj**.
- **Nemaž** zašifrované soubory ani ransom note (mohou jít dešifrovat, jsou důkaz).
- **Neobnovuj ze zálohy „rychle"** dřív, než víš, jak se útočník dostal dovnitř a že záloha je čistá – jinak se reinfikuješ.
- **Neplať a nekomunikuj s útočníkem** bez rozhodnutí managementu + právního + (typicky) DFIR/pojišťovny. Pozor na **sankce/OFAC**.
- **Nevaruj útočníka** předčasně (neměň hesla viditelně, dokud nemáš plán) – jinak může urychlit škodu/exfiltraci.
- **Nekomunikuj ven** (zákazníci, média) bez schválení IM + PR + právní.

### ☎️ KOHO VOLAT
IM: ⟨kontakt⟩ · DFIR retainer: ⟨kontakt⟩ · Kyberpojišťovna: ⟨č. smlouvy + linka⟩ ·
Právní/DPO: ⟨kontakt⟩ · Management/sponzor: ⟨kontakt⟩ · NÚKIB: portal.nukib.gov.cz ·
Policie ČR / NCOZ: ⟨kontakt⟩

---

## 1. Účel a rozsah

Pokrývá incidenty, kde dojde k **šifrování dat za účelem vydírání** a/nebo
**vyhrožování zveřejněním exfiltrovaných dat** (dvojí vydírání) či dalšímu nátlaku
(trojí vydírání – DDoS, kontaktování zákazníků). Zahrnuje fáze od detekce po
obnovu a poučení, rozhodnutí o výkupném a regulatorní hlášení.

**Mimo rozsah / použij jiný runbook:** malware bez šifrování → [RB‑04](runbook-04-malware.md);
samostatná exfiltrace bez šifrování → [RB‑05](runbook-05-unik-dat.md). U
ransomware s exfiltrací běží **RB‑01 jako vedoucí** a [RB‑05](runbook-05-unik-dat.md) souběžně.

---

## 2. Indikátory a spouštěče

| Kategorie | Příklady |
|---|---|
| **Přímé** | Ransom note (`README.txt`, `HOW_TO_DECRYPT.html`…), hromadně přejmenované soubory s novou příponou, zašifrované sdílené disky, změněná tapeta / zamykací obrazovka |
| **EDR/AV** | Detekce známých rodin, hromadné mazání **Volume Shadow Copies** (`vssadmin delete shadows`), `bcdedit` úpravy, zákaz obnovy, masivní zápisy/přejmenování souborů |
| **Síť/log** | Špičky odchozího provozu (exfiltrace), nové RDP/SMB spojení, neznámé nástroje (PsExec, Cobalt Strike, Rclone, MEGAcmd), zakázané AV/EDR |
| **Provozní** | Nedostupné aplikace/DB, hlášení uživatelů „nejdou otevřít soubory", chybové stavy záloh |
| **Externí** | E‑mail/telefon od útočníka, příspěvek na **leak site**, upozornění od NÚKIB/partnera |

> **Spouštěč aktivace:** Jakýkoli **potvrzený** indikátor šifrování nebo ransom
> note = okamžitá aktivace tohoto runbooku a IM.

---

## 3. Klasifikace závažnosti (specifika pro ransomware)

Výchozí závažnost ransomware je **vysoká**. Urči SEV podle dopadu a rozsahu:

| SEV | Typická situace |
|---|---|
| **SEV‑1 Kritický** | Zasaženy DC/IdP/zálohy/virtualizace nebo kritické systémy; aktivní šíření; potvrzená exfiltrace; ohrožen chod organizace nebo bezpečnost (OT, zdravotnictví) |
| **SEV‑2 Vysoký** | Více strojů / oddělení, ale jádro (DC, zálohy) drží; bez potvrzené exfiltrace; provoz částečně omezen |
| **SEV‑3 Střední** | Jeden/několik izolovaných strojů, zachyceno EDR, šíření zastaveno, zálohy čisté |

**Faktory pro eskalaci na SEV‑1:** zasažené zálohy nebo DC/IdP · aktivní útočník
v síti · potvrzená exfiltrace / leak site · OT/kritická infrastruktura ·
regulatorní a mediální expozice. (Viz [obecná klasifikace](00-metodika-a-ramec.md#8-klasifikace-závažnosti).)

---

## 4. Role a aktivace IRT

Ransomware (SEV‑1/2) = **plná aktivace IRT** vč. managementu, právní/DPO a PR;
u SEV‑1 svolat **krizový štáb**. Role a RACI viz
[metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci). Specificky:

- **IM** vede a drží časovou osu, rozhoduje o eskalaci a aktivaci externích.
- **Tech lead + DFIR** – zadržení, scoping, exfiltrace, eradikace, validace záloh.
- **Právní/DPO** – NÚKIB, GDPR, policie, sankce/OFAC, smluvní oznámení.
- **Management/sponzor** – rozhodnutí o výkupném, odstávce, penězích, externích.
- **PR** – interní i externí komunikace.

---

## 5. Postup po fázích

### Fáze 0 — Příprava (co mít hotové *před* incidentem)

> Připravenost je to, co rozhoduje mezi „obnoveno za 2 dny" a „kolaps na 3 týdny".

- [ ] **Offline / immutable / air‑gapped zálohy** podle pravidla **3‑2‑1‑1‑0**
      (3 kopie, 2 média, 1 mimo lokalitu, 1 offline/immutable, 0 chyb při testu obnovy).
- [ ] **Pravidelně testovaná obnova** (víš, *jak dlouho* a *v jakém pořadí* obnovíš).
- [ ] **EDR/XDR** na endpointech i serverech s funkcí izolace; **centralizované logy/SIEM** s retencí ≥ 90 dní (ideálně 180+).
- [ ] **Segmentace sítě**, omezený RDP/SMB, **MFA** všude (zejm. VPN, e‑mail, privilegované účty), **tiering** privilegovaných účtů.
- [ ] **Inventář aktiv a dat** (co je kritické, kde běží, RTO/RPO, vlastník).
- [ ] **Předjednaný DFIR retainer** a **kyberpojištění** (znát čísla a lhůty).
- [ ] **Out‑of‑band komunikace** + tištěný kontaktní list + **tištěná/offline kopie těchto runbooků**.
- [ ] **Plán kontinuity (BCP/DRP)** a „čistá" náhradní infrastruktura / postup re‑buildu AD.
- [ ] **Hardening proti destrukci obnovy:** chráněné stínové kopie, oddělené účty pro zálohy, neměnnost úložiště záloh.

### Fáze 1 — Detekce a analýza

**Cíl:** potvrdit, určit rozsah a vektor, zjistit exfiltraci, zajistit důkazy.

1. **Potvrď incident** (vyluč falešný poplach). Ověř ransom note, šifrované soubory, EDR detekce.
2. **Zajisti volatilní důkazy** (před zásahy) – viz [zacházení s důkazy](00-metodika-a-ramec.md#10-zacházení-s-důkazy):
   - [ ] **Dump RAM** a **image disku** u vzorku zasažených strojů (workstation i server).
   - [ ] Ulož **ransom note**, **vzorek zašifrovaného souboru** a (je‑li) **vzorek malware binárky** (do izolovaného úložiště, zahashuj SHA‑256).
   - [ ] Sesbírej **logy** (EDR, AD/Security, VPN, firewall, proxy, e‑mail, zálohy) do bezpečného místa, dokud nepřepíše retence.
3. **Identifikuj variantu ransomware:**
   - [ ] Podle ransom note / přípony / vzorku přes [ID Ransomware](https://id-ransomware.malwarehunterteam.com/) a [No More Ransom](https://www.nomoreransom.org/) (zda existuje **dešifrátor**).
   - [ ] Dohledej rodinu a její TTP (známé vektory, zda exfiltruje, zda má dešifrátor) – využij threat intel a DFIR.
4. **Scoping (rozsah):**
   - [ ] Které hosty/servery/sdílení/cloud jsou zasažené × izolované × čisté.
   - [ ] Je zasažen **DC/IdP**, **zálohy**, **virtualizace**, **cloud tenant**? (rozhoduje o SEV‑1)
   - [ ] **Patient zero** a **časová osa** kompromitace (kdy se útočník dostal dovnitř – často dny/týdny před šifrováním).
5. **Vstupní vektor (initial access):** phishing, zneužitá VPN/RDP, zranitelnost na perimetru, kompromitované přístupy, dodavatel. (Často [RB‑02](runbook-02-phishing-bec.md)/[RB‑03](runbook-03-kompromitace-uctu.md).)
6. **Posouzení exfiltrace dat (klíčové pro GDPR a vydírání):**
   - [ ] Hledej odchozí přenosy (proxy/firewall/netflow), nástroje **Rclone/MEGAcmd/WinSCP/FTP**, velké archivy, přístup k datovým úložištím.
   - [ ] Zkontroluj **leak site** útočníka, zda už data zveřejnil/hrozí.
   - [ ] Závěr „exfiltrace: ano/ne/nelze vyloučit" zásadně ovlivní právní hlášení a rozhodnutí o výkupném.
7. **Sestav obraz incidentu:** varianta, vektor, rozsah, exfiltrace, dotčená data (osobní údaje?), časová osa. Aktualizuj SEV.

> **Výstup fáze 1:** Potvrzený incident, SEV, scope, vektor, stav exfiltrace,
> seznam IoC, zajištěné důkazy, časová osa. → spouští právní hlášení (§8).

### Fáze 2 — Zadržení (containment)

**Cíl:** zastavit šíření a další škodu **bez ničení důkazů**. Postupuj
**koordinovaně a tiše** (out‑of‑band), ať nevaruješ útočníka předčasně.

**Krátkodobé (okamžité):**
- [ ] **Izoluj** všechny zasažené i podezřelé hosty (EDR contain / odpojení sítě). **Nevypínej.**
- [ ] **Ochraň zálohy** – odpoj/izoluj záložní infrastrukturu, ověř integritu, zamezí jejich smazání/šifrování. (Útočník je cílí.)
- [ ] **Izoluj/ochraň DC, IdP, virtualizaci, cloud správu.**
- [ ] **Zablokuj C2 a exfiltrační kanály** (IP/domény na firewallu/proxy/DNS), zablokuj známé IoC.
- [ ] Zvaž **dočasné omezení rizikových služeb** (vypnout RDP zvenčí, pozastavit VPN, omezit SMB mezi segmenty).

**Dlouhodobé (po zajištění důkazů a pochopení útočníka):**
- [ ] **Reset přístupových údajů** – privilegované účty, servisní účty, poté plošně; **MFA** reset/enforcement.
   - U podezření na kompromitaci AD zvaž **dvojí reset `krbtgt`** (po analýze, koordinovaně).
- [ ] **Zruš/zakáž** účty a relace ovládané útočníkem; zneplatni tokeny a relace v IdP/cloudu.
- [ ] **Odstraň perzistenci** (naplánované úlohy, služby, GPO, nové účty, runkeys) – až po forenzním zmapování.
- [ ] **Posiluj segmentaci**, izoluj „čisté" zóny od „špinavých", postav **clean‑room** pro obnovu.

> ⚠️ **Pořadí:** nejdřív zajisti důkazy a pochop perzistenci, pak teprve plošně
> „uklízej". Plošná akce naslepo vyžene útočníka k destrukci nebo k urychlení exfiltrace.

### Fáze 3 — Eradikace

**Cíl:** odstranit hrozbu a **uzavřít vstupní vektor**, ať se to nezopakuje.

- [ ] **Odstraň malware a nástroje útočníka** ze všech zasažených systémů; preferuj **kompletní re‑image / rebuild** před „vyčištěním" (u ransomware je důvěra ke stroji nulová).
- [ ] **Odstraň veškerou perzistenci a zadní vrátka** napříč prostředím (ne jen na patient zero).
- [ ] **Uzavři vstupní vektor:** záplatuj zneužitou zranitelnost, oprav konfiguraci (RDP, VPN, expozici), vynuť MFA, odeber nadbytečná oprávnění.
- [ ] **Obnov důvěru k identitám:** dokončené resety hesel/klíčů/tokenů, revize privilegovaných skupin a servisních účtů, kontrola nově vytvořených účtů.
- [ ] **Ověř, že je útočník skutečně venku** (threat hunting na zbytkové IoC, nové C2, anomálie) – až pak povol obnovu.

### Fáze 4 — Obnova (recovery)

**Cíl:** bezpečně obnovit provoz a **ověřit „čistotu"** – nikoli jen „rychle nahodit".

1. **Priorita obnovy** dle BCP (kritické služby, závislosti, RTO/RPO). Sestav pořadí: identita (AD/IdP) → infrastruktura → kritické aplikace → ostatní.
2. **Obnova jen do prokazatelně čistého prostředí:**
   - [ ] Obnovuj **rebuildnuté/čisté** systémy, ne ty kompromitované.
   - [ ] Použij **ověřeně čisté zálohy** (zkontroluj, že záloha je *před* kompromitací a *neobsahuje* perzistenci útočníka). Před nasazením zálohu **proskenuj a otestuj v izolaci**.
3. **Dešifrování (alternativa/doplněk obnovy):**
   - [ ] Existuje‑li legitimní **dešifrátor** ([No More Ransom](https://www.nomoreransom.org/)), použij ho na kopiích (ne na originálu).
   - [ ] Pokud ne a zálohy chybí, jde o vstup do [rozhodování o výkupném](#6-rozhodovací-strom-výkupné).
4. **Postupné a monitorované připojování:** vracej systémy do provozu po vlnách, s **posíleným monitoringem** (EDR/SIEM) pro zachycení reinfekce.
5. **Definuj „clean / hotovo":** žádné aktivní IoC, obnovené a ověřené služby, resetované identity, uzavřený vektor, funkční zálohy. Teprve pak deklaruj konec incidentu.

> **Pozn.:** Obnova velkého ransomware zpravidla trvá **dny až týdny**.
> Komunikuj realistická očekávání a nasazuj síly ve směnách.

### Fáze 5 — Poučení (lessons learned)

- [ ] **Post‑incident review** do ~2 týdnů po uzavření (bez hledání viníka – „blameless").
- [ ] **Root cause** a celá časová osa (jak a kdy se útočník dostal dovnitř).
- [ ] **Akční položky** s vlastníky a termíny (záplaty, MFA, segmentace, zálohy, detekce, runbook).
- [ ] **Aktualizuj tento runbook** podle toho, co fungovalo/nefungovalo.
- [ ] **Metriky:** MTTD, MTTC, MTTR, rozsah, náklady (viz [metodika §13.4](00-metodika-a-ramec.md#134-metriky-měř-ať-se-dá-zlepšovat)).
- [ ] **Naplň reporting:** závěrečná zpráva NÚKIB, podklady pojišťovně, případně doplnění pro ÚOOÚ.

---

## 6. Rozhodovací stromy

### 6.1 Zadržení – izolovat, hibernovat, nebo vypnout?
```
Šíří se šifrování aktivně a NELZE izolovat síťově (EDR/odpojení)?
   ├─ NE  → IZOLUJ síťově, NEVYPÍNEJ (zachová paměť i důkazy).      ✅ preferováno
   └─ ANO → Nelze ani odpojit kabel/Wi‑Fi a hrozí další škoda?
              ├─ NE  → Odpoj fyzicky ze sítě.
              └─ ANO → HIBERNUJ (uloží RAM na disk) – až pokud nutné.
                       Vypnutí (power‑off) jen jako KRAJNÍ možnost
                       (ničí volatilní důkazy).
```

### 6.2 Obnova – ze zálohy, dešifrátorem, nebo rebuild?
```
Mám ověřeně ČISTOU zálohu z doby PŘED kompromitací?
   ├─ ANO → Obnov z ní do REBUILDNUTÉHO/čistého prostředí (+ test v izolaci).  ✅
   └─ NE  → Existuje legitimní DEŠIFRÁTOR (No More Ransom)?
              ├─ ANO → Dešifruj na KOPIÍCH, ověř integritu.
              └─ NE  → Lze data znovu pořídit / rekonstruovat jinak?
                         ├─ ANO → Rekonstruuj.
                         └─ NE  → → přejdi na rozhodnutí o VÝKUPNÉM (6.3)
```

### 6.3 Výkupné

> **Rozhodnutí o výkupném je rozhodnutím MANAGEMENTU**, vždy s **právním
> oddělením**, zpravidla s **DFIR a pojišťovnou**, a po informování **NÚKIB/policie**.
> Obecné doporučení bezpečnostní komunity i orgánů: **platbu nepreferovat.**

**Než vůbec uvažovat o platbě, zvaž:**
```
1. Mám čisté zálohy nebo dešifrátor?           → pokud ANO, NEPLATIT.
2. Je příjemce na SANKČNÍM seznamu (OFAC/EU)?  → pokud ANO/nejisté, platba může být
                                                  PROTIPRÁVNÍ. Konzultuj právní/pojišťovnu.
3. Co reálně koupím?                            → dešifrátor nemusí fungovat / být úplný;
                                                  exfiltrovaná data útočník stejně může
                                                  zveřejnit i po platbě (žádná záruka).
4. Etika a precedens                            → platba financuje další útoky.
5. Smlouva s pojišťovnou                         → kryje? za jakých podmínek?
```

**Pokud management i přesto zvažuje platbu:**
- [ ] Veškerou komunikaci s útočníkem **deleguj na specializovaný tým (DFIR/negociátor)** – nikdy ad hoc.
- [ ] Ověř **sankční** rizika (OFAC/EU) – písemné stanovisko právního.
- [ ] Informuj **NÚKIB a Policii ČR/NCOZ**.
- [ ] **Platba nenahrazuje** obnovu, eradikaci ani regulatorní hlášení.

---

## 7. Komunikace

Řiď se [obecnými zásadami](00-metodika-a-ramec.md#11-komunikace). Specifika pro ransomware:

- **Vše přes out‑of‑band**, dokud není jisté, že firemní kanály nejsou kompromitované.
- **Interně:** včas a věcně (viz vzor v metodice) – pokyny „nevypínat, nerestartovat, hlásit, neodpovídat médiím".
- **Zákazníci/partneři:** koordinovaně, dle smluvních oznamovacích doložek; připrav stanovisko dřív, než to udělá útočník (leak site, kontaktování vašich zákazníků = trojí vydírání).
- **Útočník:** žádná ad hoc komunikace; pouze přes pověřený tým a po rozhodnutí (§6.3).
- **Média:** jeden hlas (PR + IM + právní); fakta, dopad, opatření, další update.

---

## 8. Právní a regulatorní povinnosti

> ⚠️ Není právní rada – řídí **právní/DPO**. Lhůty běží od **zjištění**. Detaily a
> kontakty viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

| Komu | Co | Lhůta | Pozn. |
|---|---|---|---|
| **NÚKIB** | Prvotní hlášení významného incidentu | **24 h** | [portal.nukib.gov.cz](https://portal.nukib.gov.cz); doplnění do **72 h** |
| **ÚOOÚ** (GDPR čl. 33) | Porušení ochrany osobních údajů | **72 h** | Pokud byly dotčeny/exfiltrovány osobní údaje a hrozí riziko |
| **Subjekty údajů** (čl. 34) | Oznámení dotčeným osobám | bez zbytečného odkladu | Při vysokém riziku |
| **Policie ČR / NCOZ** | Trestní oznámení | bez zbytečného odkladu | Vydírání + neoprávněný přístup; nebrání obnově |
| **Kyberpojišťovna** | Škodní událost | dle smlouvy (24–72 h) | Jinak krácení plnění; často určuje DFIR |
| **Smluvní partneři** | Dle oznamovacích doložek | dle smluv | B2B, zpracovatelské smlouvy |

- ⚠️ **Sankce/OFAC** u případné platby – viz [§6.3](#63-výkupné).
- **Eviduj i incidenty, které se nehlásí** (GDPR čl. 33/5; interní evidence).

---

## 9. Checklisty (rychlé, k odškrtání)

**Prvních 60 minut**
- [ ] Zaznamenán čas, aktivován IM, vyhlášen SEV
- [ ] Zasažené stroje **izolovány** (NE vypnuty)
- [ ] Ochráněny **zálohy / DC / IdP / virtualizace / cloud**
- [ ] **Out‑of‑band** komunikace aktivní
- [ ] Zajištěny volatilní důkazy (RAM, image, ransom note, vzorek)
- [ ] Spuštěna časová osa
- [ ] Uvědoměni **právní/DPO, management**, nastaveny timery 24 h / 72 h
- [ ] Aktivován **DFIR retainer** a **pojišťovna**

**Detekce a analýza**
- [ ] Potvrzena varianta (ID Ransomware / No More Ransom), zjištěn dešifrátor: ano/ne
- [ ] Scope: zasažené × izolované × čisté; zasaženy DC/zálohy? ano/ne
- [ ] Patient zero + vstupní vektor + časová osa
- [ ] **Exfiltrace: ano / ne / nelze vyloučit**; dotčeny osobní údaje? ano/ne
- [ ] Seznam IoC sestaven a sdílen pro blokaci

**Zadržení**
- [ ] Izolace dokončena; C2/exfiltrace blokovány
- [ ] Reset privilegovaných a servisních účtů; (krbtgt dle analýzy)
- [ ] Odstraněna perzistence (po forenzním zmapování)

**Eradikace a obnova**
- [ ] Vstupní vektor uzavřen (patch/konfig/MFA)
- [ ] Systémy **rebuildnuty**, ne jen „vyčištěny"
- [ ] Obnova z **ověřeně čisté** zálohy do čistého prostředí
- [ ] Posílený monitoring, postupné připojování
- [ ] Definováno a ověřeno „clean", deklarován konec

**Po incidentu**
- [ ] Post‑incident review (blameless), root cause
- [ ] Akční položky s vlastníky a termíny
- [ ] Závěrečná zpráva NÚKIB / podklady pojišťovně / doplnění ÚOOÚ
- [ ] Aktualizován runbook, spočítány metriky

---

## 10. Přílohy

### 10.1 Záznam časové osy (timeline log)
| Čas (s pásmem) | Kdo | Akce / zjištění | Důkaz / odkaz |
|---|---|---|---|
| | | | |

### 10.2 Evidence IoC
| Typ (IP/doména/hash/účet/soubor) | Hodnota | Kde pozorováno | Akce (blok/sledování) |
|---|---|---|---|
| | | | |

### 10.3 Klíčové artefakty k zajištění
- [ ] Dump RAM (vzorek strojů) · [ ] Image disku · [ ] Ransom note · [ ] Vzorek zašifrovaného souboru
- [ ] Vzorek malware binárky · [ ] Logy: EDR, AD/Security, VPN, FW, proxy, DNS, e‑mail, zálohy
- [ ] Chain of custody pro každý artefakt ([šablona](00-metodika-a-ramec.md#103-šablona-chain-of-custody))

### 10.4 Kontakty (vyplň předem!)
| Role / subjekt | Jméno | Telefon (out‑of‑band) | Pozn. |
|---|---|---|---|
| Incident Manager | | | |
| Zástupce IM | | | |
| Tech lead / DFIR interní | | | |
| **DFIR retainer (externí)** | | | č. smlouvy / reakční doba |
| **Kyberpojišťovna** | | | č. pojistky / linka |
| Právní / DPO | | | |
| Management / sponzor | | | |
| PR / komunikace | | | |
| NÚKIB | — | portal.nukib.gov.cz | |
| Policie ČR / NCOZ | | | |

### 10.5 Užitečné odkazy
- No More Ransom (dešifrátory) — <https://www.nomoreransom.org/>
- ID Ransomware — <https://id-ransomware.malwarehunterteam.com/>
- CISA „I've Been Hit By Ransomware" — <https://www.cisa.gov/stopransomware/ive-been-hit-ransomware>
- CISA #StopRansomware Guide — <https://www.cisa.gov/resources-tools/resources/stopransomware-guide>
- Portál NÚKIB — <https://portal.nukib.gov.cz/>
