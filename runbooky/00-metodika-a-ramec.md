# Metodika a rámec tvorby runbooků pro řešení incidentů

> **Účel:** Vysvětlit, *jak* a *podle čeho* jsou runbooky v tomto balíku
> postavené, z jakých metodik vycházejí a jaké sdílené komponenty (role,
> závažnost, eskalace, zacházení s důkazy, právní povinnosti) platí napříč všemi
> runbooky. Tento dokument je „proč a jak"; jednotlivé runbooky jsou „co dělat".

| | |
|---|---|
| **Vlastník** | CISO / vedoucí kybernetické bezpečnosti |
| **Verze** | 1.0 |
| **Datum revize** | 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Revize** | min. 1× ročně + po každém reálném incidentu |

---

## 1. Jak číst tento dokument

1. [Co je runbook a proč ho mít](#2-co-je-runbook-a-čím-se-liší-od-plánu-a-playbooku)
2. [Rešerše metodik](#3-rešerše-metodik--z-čeho-vycházíme) – z čeho čerpáme a jak se to mapuje
3. [Sedm pohledů na incident](#4-sedm-pohledů-na-incident) – proč nestačí jen technika
4. [Principy dobrého runbooku](#5-principy-dobrého-runbooku) – návrhová pravidla
5. [Životní cyklus řešení incidentu](#6-životní-cyklus-řešení-incidentu-páteř-runbooků) – páteř, kterou sdílí všechny runbooky
6. Sdílené komponenty: [role/RACI](#7-role-a-odpovědnosti-raci), [závažnost](#8-klasifikace-závažnosti),
   [eskalace](#9-eskalační-matice), [důkazy](#10-zacházení-s-důkazy), [komunikace](#11-komunikace),
   [právo](#12-právní-a-regulatorní-povinnosti)
7. [Jak runbooky tvořit, testovat a udržovat](#13-jak-runbooky-tvořit-testovat-a-udržovat)
8. [Zdroje](#14-zdroje)

---

## 2. Co je runbook a čím se liší od plánu a playbooku

| Pojem | Co to je | Úroveň | Příklad |
|---|---|---|---|
| **Plán reakce na incidenty (IRP)** | Zastřešující dokument – politika, role, autority, eskalace, právní rámec | Strategická | „Kdo smí vyhlásit incident a aktivovat krizový tým" |
| **Runbook / playbook** | Konkrétní operační postup pro **typ** incidentu | Taktická | „Co dělat při ransomwaru, krok za krokem" |
| **Procedura / skript** | Jednotlivý technický úkon | Operativní | „Jak izolovat host v EDR", „Jak resetovat všechny tokeny" |

> V praxi se „runbook" a „playbook" používají zaměnitelně. V tomto balíku
> používáme **runbook** = ucelený postup pro danou kategorii incidentu, který
> obsahuje rozhodovací logiku i konkrétní kroky.

**Proč runbooky:** během incidentu klesá schopnost lidí jasně uvažovat (stres,
časový tlak, neúplné informace). Runbook přenáší promyšlené rozhodování z klidu
do krize, zrychluje reakci, snižuje chyby, zajišťuje, že se nezapomene na právní
a komunikační povinnosti, a umožňuje, aby incident zvládl i méně zkušený člen týmu.

---

## 3. Rešerše metodik – z čeho vycházíme

Runbooky nejsou postavené na jediném zdroji. Jsou syntézou několika
komplementárních metodik. Níže je přehled, co každá přináší a jak ji používáme.

### 3.1 NIST SP 800‑61 Rev. 3 (2025) + CSF 2.0
Nejnovější revize (duben 2025) **opouští rigidní lineární „lifecycle"** a místo
toho mapuje aktivity reakce na incidenty na šest funkcí rámce **NIST CSF 2.0**:
**Govern, Identify, Protect, Detect, Respond, Recover.** Reakce na incident už
není izolovaná epizoda, ale **trvalá součást řízení rizik**.
- *Co bereme:* dělení na **fázi přípravy** (Govern/Identify/Protect – prevence
  a připravenost) a **fázi reakce** (Detect/Respond/Recover); důraz na neustálé
  zlepšování a propojení s řízením rizik.

### 3.2 SANS – proces PICERL (SP 800‑61r2 lineage)
Klasický, operativně velmi praktický šestifázový model:
**P**reparation → **I**dentification → **C**ontainment → **E**radication →
**R**ecovery → **L**essons Learned.
- *Co bereme:* **páteřní strukturu každého runbooku.** Je intuitivní, snadno se
  podle ní jedná a dobře se mapuje na NIST i ISO (viz [tabulka mapování](#38-mapování-fází)).

### 3.3 ISO/IEC 27035 (řízení incidentů informační bezpečnosti)
Řada norem (27035‑1 zásady, ‑2 plánování a příprava, ‑3 ICT operace, ‑4
koordinace): plánuj a připrav → detekuj a reportuj → posuď a rozhodni → reaguj →
ponauč se.
- *Co bereme:* formalizaci **klasifikace a kategorizace**, požadavky na
  **dokumentaci a měřitelnost**, propojení s ISMS (ISO 27001).

### 3.4 ENISA (EU agentura pro kybernetickou bezpečnost)
Metodiky pro **CSIRT/SOC**, taxonomie incidentů (Reference Incident
Classification Taxonomy), good practices pro reporting a sdílení informací.
- *Co bereme:* **taxonomii kategorií incidentů** (podklad pro výběr runbooků) a
  princip strukturovaného reportingu.

### 3.5 MITRE ATT&CK (technický pohled)
Znalostní báze taktik a technik protivníka (TA0001 Initial Access … TA0040
Impact). Není to lifecycle, ale **slovník chování útočníka**.
- *Co bereme:* v každém runbooku odkazujeme na relevantní **techniky ATT&CK**,
  aby analýza, hledání (threat hunting) a zadržení mířily na konkrétní chování
  (např. ransomware: T1486 Data Encrypted for Impact, T1490 Inhibit System
  Recovery, T1567 Exfiltration over Web Service).

### 3.6 CISA #StopRansomware Guide / IR checklisty (CISA, FBI, NSA, MS‑ISAC)
Velmi praktické **checklisty** pro detekci, reakci a obnovu, zejm. u ransomware
(včetně „Ransomware and Data Extortion Response Checklist").
- *Co bereme:* konkrétní operativní kroky a osvědčená **„do/don't"** (např.
  nevypínat, izolovat, zachovat volatilní důkazy).

### 3.7 Doplňkově
- **Diamond Model / Cyber Kill Chain** – modely pro analýzu a atribuci útoku.
- **VERIS** – slovník pro popis a sdílení dat o incidentech (4 A: Actor, Action,
  Asset, Attribute) – užitečné pro post‑incident záznam a metriky.
- **NÚKIB** – metodické materiály a portál pro hlášení dle zákona 264/2025 Sb.

### 3.8 Mapování fází

| SANS / PICERL (páteř runbooků) | NIST CSF 2.0 (800‑61r3) | ISO/IEC 27035 |
|---|---|---|
| **Preparation** | Govern, Identify, Protect | Plan & Prepare |
| **Identification** | Detect | Detect & Report; Assess & Decide |
| **Containment** | Respond | Respond |
| **Eradication** | Respond | Respond |
| **Recovery** | Recover | Respond (recovery) |
| **Lessons Learned** | Govern (improve) | Lessons Learnt |

> **Závěr rešerše:** Jako sdílenou kostru každého runbooku používáme **PICERL**
> (je nejvíce „akční"), obohacenou o (a) **přípravu a governance** dle NIST CSF
> 2.0, (b) **technický slovník MITRE ATT&CK**, (c) **praktické checklisty CISA**
> a (d) **právní/regulatorní vrstvu** dle českého a EU práva.

---

## 4. Sedm pohledů na incident

Dobrý runbook nesmí být jen „technický návod". Reálný incident je současně
provozní, právní, komunikační i lidská událost. Každý runbook proto vědomě
pokrývá těchto **sedm perspektiv**:

| # | Pohled | Klíčová otázka | Kdo to vlastní | Kde v runbooku |
|---|---|---|---|---|
| 1 | **Procesní** | V jaké fázi jsme a co je další krok? | Incident Manager | Fáze PICERL |
| 2 | **Technický / forenzní** | Co se přesně stalo, jak a kudy? | Tech lead, DFIR | Detekce, Zadržení, Eradikace |
| 3 | **Právní a compliance** | Co musíme komu nahlásit a do kdy? | Právní, DPO | Kap. 12 + sekce „Právní" |
| 4 | **Komunikační** | Kdo se co dozví a jak to řekneme? | PR, IM | Kap. 11 + sekce „Komunikace" |
| 5 | **Byznysový / kontinuita** | Co to stojí provoz a jak ho udržíme? | Management, BCP | Klasifikace dopadu, Obnova |
| 6 | **Governance / riziko** | Kdo rozhoduje a kde je hranice autority? | Vedení, CISO | Role, eskalace, rozhodovací stromy |
| 7 | **Lidský / psychologický** | Jsou lidé v pořádku a nepřetížení? | IM, HR | Pravidla pro střídání, well‑being |

**Proč na tom záležet:** Většina reálných selhání reakce není „nezvládli jsme
techniku", ale „zapomnělo se nahlásit regulátorovi do 24 h", „nikdo neřekl
zákazníkům", „tým po 30 hodinách dělal chyby z únavy" nebo „nebylo jasné, kdo
smí rozhodnout o odstávce". Runbook tyto pohledy **explicitně hlídá**.

> **Lidský pohled – nepodceňovat:** U incidentů trvajících přes ~8–12 h zaveď
> **směny a střídání** (incidenty se „neřeší na jeden zátah"), zajisti jídlo,
> spánek, rotaci role zapisovatele. Unavený tým dělá nevratné chyby (smazané
> důkazy, špatná obnova). IM aktivně sleduje vytížení lidí.

---

## 5. Principy dobrého runbooku

Návrhová pravidla, podle kterých jsou runbooky v tomto balíku psané – a podle
kterých piš i nové (viz [šablona](01-sablona-runbooku.md)):

1. **Použitelný za krize, ne jen u stolu.** Nahoře vždy „🚨 První hodina" – co
   udělat hned, bez čtení celého dokumentu.
2. **Akční, ne popisný.** Slovesa v rozkazu, jeden krok = jedna akce. Místo „je
   vhodné zvážit izolaci" → „**Izoluj** zasažený host v EDR (Network Isolate)".
3. **Každý krok má vlastníka a výstup.** Kdo to dělá a co je hotový výsledek.
4. **Rozhodovací body jsou explicitní.** Místo prózy → rozhodovací strom /
   tabulka „když X, pak Y".
5. **Samonosnost.** Kritické checklisty a kontakty jsou v runbooku přímo, ne jen
   odkazem – v krizi se nepřepíná mezi deseti dokumenty.
6. **Konkrétní, ale ne křehký.** Uváděj příkazy/nástroje jako *příklad*, ale
   neváž runbook na jeden konkrétní produkt natolik, aby přestal platit po jeho výměně.
7. **Hlídá právo a komunikaci.** V každém runbooku je vrstva „co nahlásit a komu".
8. **„Do / Don't" pro nevratné kroky.** Co se nesmí udělat (vypnout, restartovat,
   smazat, zaplatit bez schválení) je zvýrazněno.
9. **Měřitelný.** Eviduje časovou osu a umožní spočítat metriky (MTTD, MTTC, MTTR).
10. **Živý dokument.** Verzovaný, pravidelně testovaný a aktualizovaný po každém použití.

---

## 6. Životní cyklus řešení incidentu (páteř runbooků)

Každý runbook sleduje stejných šest fází. Toto je jejich obecný význam; konkrétní
náplň je v jednotlivých runbocích.

```
 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │ 0 PŘÍPRAVA   │   │ 1 DETEKCE &  │   │ 2 ZADRŽENÍ   │
 │ (předem)     │──▶│   ANALÝZA    │──▶│ (containment)│──┐
 │ připravenost │   │ co/jak/rozsah│   │ zastav šíření│  │
 └──────────────┘   └──────────────┘   └──────────────┘  │
        ▲                                                 ▼
        │           ┌──────────────┐   ┌──────────────┐ ┌──────────────┐
        │           │ 5 POUČENÍ    │◀──│ 4 OBNOVA     │◀│ 3 ERADIKACE  │
        └───────────│ (lessons)    │   │ (recovery)   │ │ odstraň hroz.│
          zlepšení  │ zlepši, uč   │   │ vrať provoz  │ │ uzavři vektor│
                    └──────────────┘   └──────────────┘ └──────────────┘
```

| Fáze | Cíl | Typický výstup |
|---|---|---|
| **0 Příprava** | Být připraven dřív, než incident nastane | Zálohy, kontakty, EDR, logy, retainer, cvičení |
| **1 Detekce a analýza** | Potvrdit, klasifikovat, určit rozsah a vektor | Potvrzený incident, SEV, scope, IoC, časová osa |
| **2 Zadržení** | Zastavit šíření a další škodu (bez ztráty důkazů) | Izolovaná aktiva, zablokovaný útočník, zachované důkazy |
| **3 Eradikace** | Odstranit hrozbu a uzavřít vstupní vektor | Čisté systémy, odstraněná perzistence, záplatovaná zranitelnost |
| **4 Obnova** | Bezpečně obnovit provoz a ověřit „čistotu" | Obnovené služby, monitoring, validace |
| **5 Poučení** | Zhodnotit, zlepšit, naplnit reporting | Post‑incident report, akční položky, aktualizace runbooku |

> **Fáze nejsou striktně lineární.** Často se iteruje (analýza ↔ zadržení),
> nebo běží paralelně (komunikace a právní hlášení běží od fáze 1). Páteř slouží
> k orientaci „kde jsme", ne jako svěrací kazajka.

---

## 7. Role a odpovědnosti (RACI)

Tým reakce na incident (**IRT / CSIRT**). V menší organizaci jedna osoba zastává
více rolí – nutné je **jmenovité přiřazení a zástup** ještě před incidentem.

### 7.1 Role

| Role | Hlavní odpovědnost | Klíčové pravomoci |
|---|---|---|
| **Incident Manager (IM)** | Vede a koordinuje celé řešení; jediný „vlastník" incidentu | Vyhlásit SEV, aktivovat IRT, eskalovat |
| **Zástupce IM** | Přebírá při nedostupnosti / střídání směn | dtto |
| **Technický lead** | Řídí technická opatření (analýza→obnova) | Rozhoduje o technických krocích |
| **Forenzní specialista / DFIR** | Sběr a analýza důkazů, vektor a rozsah | Zajištění důkazů, chain of custody |
| **Specialista IT/infrastruktura** | Provádí zásahy (síť, AD, zálohy, cloud) | Provozní změny po schválení |
| **Právní / DPO** | Posuzuje právní a regulatorní povinnosti | Rozhoduje o hlášení regulátorům |
| **Komunikace / PR** | Interní i externí komunikace, média, zákazníci | Schvaluje externí sdělení |
| **Zástupce managementu / sponzor** | Zásadní rozhodnutí a zdroje | Výkupné, odstávka, peníze, právní kroky |
| **HR** | Personální rozměr (insider, well‑being) | Pracovněprávní kroky |
| **Zapisovatel (scribe)** | Vede chronologický záznam | — |
| **Externí podpora** | DFIR firma, právník, pojišťovna, NÚKIB/CERT | dle smlouvy |

### 7.2 RACI pro typické činnosti

> R = vykonává, A = odpovídá (jediný), C = konzultován, I = informován

| Činnost | IM | Tech lead | DFIR | Právní/DPO | PR | Mgmt |
|---|---|---|---|---|---|---|
| Vyhlášení incidentu a SEV | A/R | C | C | I | I | I |
| Klasifikace a scoping | A | R | R | I | I | I |
| Rozhodnutí o izolaci/odstávce | A | R | C | C | I | C |
| Zajištění důkazů | I | C | A/R | C | I | I |
| Hlášení NÚKIB (24/72 h) | C | I | C | A/R | C | I |
| Hlášení ÚOOÚ (GDPR 72 h) | C | I | C | A/R | C | I |
| Externí komunikace / média | C | I | I | C | A/R | C |
| Rozhodnutí o (ne)placení výkupného | C | C | C | C | I | A/R |
| Schválení obnovy provozu | A | R | C | I | I | C |
| Post‑incident report | A/R | C | C | C | C | I |

---

## 8. Klasifikace závažnosti

Závažnost (SEV) určuje **rychlost a rozsah reakce**. Stanovuje ji IM hned po
potvrzení a **průběžně ji reviduje** (eskalace i deeskalace).

### 8.1 Matice (dopad × rozsah)

| SEV | Dopad na provoz/data | Rozsah | Citlivá / osobní data | Reakce |
|---|---|---|---|---|
| **SEV‑1 Kritický** | Zastaven kritický provoz / ohrožena bezpečnost osob / nevratná ztráta | Rozsáhlé, šíří se, doménová/cloud tenant úroveň | Pravděpodobný únik velkého objemu | IRT 24/7, krizový tým, management, externí DFIR |
| **SEV‑2 Vysoký** | Významné omezení části provozu | Více systémů / jedno oddělení | Možný únik citlivých dat | IRT i mimo pracovní dobu |
| **SEV‑3 Střední** | Omezený, lokalizovaný dopad | Jeden systém / uživatel | Nepravděpodobný únik | IRT v pracovní době |
| **SEV‑4 Nízký** | Bez reálného dopadu, zachyceno/potlačeno | Izolované | Ne | Běžný provoz, záznam |

### 8.2 Faktory zvyšující závažnost (eskaluj o úroveň výš)
- Zasaženy **doménové řadiče / IdP / cloud tenant / zálohy**.
- **Aktivní šíření** (lateral movement) nebo aktivní útočník v síti.
- Potvrzená **exfiltrace dat** nebo **dvojí vydírání**.
- Zasažena **kritická / OT / zdravotnická / bezpečnostní** aktiva.
- Pravděpodobné **regulatorní** plnění (NIS2/NÚKIB, GDPR).
- **Mediální / reputační** expozice.

---

## 9. Eskalační matice

| Čas / stav | Akce |
|---|---|
| Potvrzení SEV‑3/4 | Informuj vlastníka systému + IT, řeš v pracovní době |
| Potvrzení SEV‑1/2 | **Okamžitě** aktivuj IRT (i mimo pracovní dobu), svolej IM |
| SEV‑1 nebo regulatorní dopad | Informuj management/sponzora, aktivuj právní/DPO a PR |
| Nelze zadržet do _X_ h / chybí kompetence | Aktivuj **externí DFIR retainer** a kyberpojišťovnu |
| Podezření na trestný čin (ransomware, vydírání, exfiltrace) | Připrav **trestní oznámení** (Policie ČR / NCOZ) |
| Incident > 30 dní / mediální tlak | Aktivuj krizový štáb, průběžná zpráva NÚKIB |

> **Pravidlo „radši dřív":** Eskalovat a poté deeskalovat je levnější než
> eskalovat pozdě. U pochybnosti volej IM.

---

## 10. Zacházení s důkazy

Cílem je **zachovat důkazy pro forenziku, pojišťovnu, regulátora i soud** a
zároveň zastavit škodu. Tyto cíle si někdy odporují – proto pravidla:

### 10.1 Pořadí těkavosti (order of volatility) – zajišťuj od nejtěkavějšího
1. Operační paměť (RAM), běžící procesy, síťová spojení
2. Dočasné soubory, swap, cache
3. Disk (image), souborový systém
4. Logy (lokální i centrální/SIEM)
5. Konfigurace, archivy, fyzické nosiče

### 10.2 Pravidla
- **Nejdřív zajisti, pak zasahuj** – kde to lze, pořiď **image disku a dump
  RAM** dříve, než systém změníš.
- **Nevypínat / nerestartovat** kompromitovaný systém, dokud nerozhodne DFIR –
  ztratí se paměť i důkazy (u ransomware může restart spustit další škodu).
  Pokud je nutné systém „odstavit", **preferuj izolaci sítě** nebo **hibernaci**
  (uloží RAM na disk) před vypnutím.
- **Pracuj s kopiemi**, originál (image) zapečeti a archivuj.
- **Chain of custody** (řetězec důkazů): u každého důkazu eviduj *co, kdy, kdo,
  kde, jak zajištěno, kde uloženo, kdo měl přístup* (viz [šablona](#103-šablona-chain-of-custody)).
- **Hash** (SHA‑256) každého zajištěného artefaktu pro prokázání integrity.
- Komunikuj a zaznamenávej tak, aby záznam obstál (předpokládej, že ho bude číst
  právník, regulátor nebo soud).

### 10.3 Šablona chain of custody

| Pole | Hodnota |
|---|---|
| ID důkazu | EV‑YYYYMMDD‑NN |
| Popis | (např. image disku WS‑012, dump RAM) |
| Zdroj (hostname/sériové č./IP) | |
| Datum a čas zajištění (s časovým pásmem) | |
| Zajistil (jméno, role) | |
| Metoda zajištění / nástroj | |
| Hash (SHA‑256) | |
| Místo uložení | |
| Předáno komu / kdy | |

---

## 11. Komunikace

Špatná komunikace prohloubí každý incident. Zásady:

- **Předpokládej, že běžné kanály mohou být kompromitované** → měj připravený
  **out‑of‑band kanál** (osobní telefony, signální appka, předem rozdané kontakty).
- **Jeden hlas ven.** Externí komunikaci schvaluje IM + PR (+ právní). Zaměstnanci
  vědí, že na dotazy médií/zákazníků odkazují na tiskové místo.
- **Princip „need to know"** u citlivých detailů, ale včasná a věcná informovanost
  dovnitř (mlčení živí paniku a fámy).
- **Nepřiznávej a neslibuj, co nevíš.** Komunikuj fakta, dopad, co děláme a kdy
  bude další update. Nehádej rozsah ani viníka.
- **Stakeholdeři:** interní (zaměstnanci, vedení, představenstvo), externí
  (zákazníci, partneři, dodavatelé), regulátoři (NÚKIB, ÚOOÚ), orgány činné v
  trestním řízení, pojišťovna, případně média a veřejnost.

### 11.1 Šablona prvotního interního sdělení
```
Předmět: [INTERNÍ] Probíhá řešení bezpečnostního incidentu – pokyny

Tým zaznamenal bezpečnostní incident, který aktivně řešíme.
Co prosím udělejte / nedělejte:
  • [např. NErestartujte počítače, NEodpojujte je svévolně]
  • [hlaste podezřelé jevy na: <kontakt>]
  • Na dotazy zvenčí (zákazníci/média) NEodpovídejte, odkažte na <PR kontakt>.
Další informace poskytneme do <čas>.
Kontakt pro dotazy: <IM / kanál>
```

### 11.2 Kostra externího sdělení (zákazníci/veřejnost)
```
Co se stalo (bez citlivých detailů) → Koho/čeho se to (ne)týká →
Co děláme → Co doporučujeme udělat dotčeným → Kam pro další info / kdy update.
```

---

## 12. Právní a regulatorní povinnosti

> ⚠️ **Nejde o právní radu.** Konkrétní povinnosti závisí na tom, zda je
> organizace **regulovaným subjektem** dle zákona o KB, zda zpracovává osobní
> údaje, na odvětví a smlouvách. Posouzení vždy řídí **právní oddělení / DPO**.
> Runbooky tyto lhůty *připomínají*, aby na ně nikdo nezapomněl.

### 12.1 NÚKIB – zákon č. 264/2025 Sb. o kybernetické bezpečnosti
(účinný od 1. 11. 2025, transpozice NIS2). Pro **poskytovatele regulované služby**:

| Krok | Lhůta | Pozn. |
|---|---|---|
| **Prvotní hlášení** významného incidentu | do **24 h** od zjištění | přes [portál NÚKIB](https://portal.nukib.gov.cz) (povinná platforma) |
| **Doplnění** informací o vývoji | do **72 h** od zjištění | u služeb vytvářejících důvěru **24 h** |
| **Průběžná zpráva** | na vyžádání NÚKIB / u incidentu trvajícího > 30 dní | |
| **Závěrečná zpráva** | po ukončení řešení | |

> Pozn.: Nově regulované subjekty mají přechodné období (povinnost hlásit
> vzniká do 1 roku od registrace; do té doby je hlášení dobrovolné). Ověř svůj stav.

### 12.2 GDPR – porušení ochrany osobních údajů
| Komu | Lhůta | Kdy |
|---|---|---|
| **ÚOOÚ** (čl. 33) | do **72 h** od zjištění | pokud porušení pravděpodobně znamená **riziko** pro práva a svobody osob |
| **Dotčené subjekty údajů** (čl. 34) | **bez zbytečného odkladu** | pokud hrozí **vysoké riziko** |

> I když se nehlásí, **každé** porušení se interně eviduje (čl. 33 odst. 5).

### 12.3 Další možné povinnosti / kontakty
- **Policie ČR / NCOZ** – trestní oznámení (ransomware, vydírání, neoprávněný
  přístup, exfiltrace). Doporučeno; nebrání souběžné obnově, je‑li zachycena stopa.
- **Sektorové regulátory** (ČNB pro finance, ERÚ, SÚKL aj.) dle odvětví.
- **Kyberpojišťovna** – nahlásit dle smlouvy (často 24–72 h), jinak hrozí krácení.
- **Smluvní partneři** – oznamovací doložky ve smlouvách (B2B SLA, zpracovatelské smlouvy).
- ⚠️ **Sankce / OFAC** – platba výkupného sankcionovanému subjektu může být
  protiprávní (viz [runbook ransomware](runbook-01-ransomware.md), rozhodnutí o výkupném).

---

## 13. Jak runbooky tvořit, testovat a udržovat

### 13.1 Postup tvorby nového runbooku
1. **Vyber kategorii** incidentu (dle taxonomie ENISA / vlastní zkušenosti).
2. **Vezmi [šablonu](01-sablona-runbooku.md)** a naplň ji.
3. **Projdi sedm pohledů** (kap. 4) – ke každému doplň, co runbook řeší.
4. **Namapuj relevantní techniky MITRE ATT&CK** pro detekci a zadržení.
5. **Vlož právní a komunikační vrstvu** (odkaz na kap. 11 a 12 + specifika).
6. **Doplň „🚨 První hodinu", rozhodovací stromy a checklisty.**
7. **Recenze** napříč rolemi (tech, právní, PR, management).
8. **Otestuj** tabletop cvičením (kap. 13.3), zapracuj poznatky.
9. **Schval a verzuj** (vlastník, datum, verze).

### 13.2 Údržba
- Revize min. **1× ročně** a **po každém reálném incidentu** (poučení → úprava).
- Při změně nástrojů (EDR, SIEM, cloud), organizace nebo legislativy → aktualizuj.
- Verzuj přes git; v hlavičce drž verzi a datum revize.

### 13.3 Testování (cvičení)
| Typ | Náročnost | Cíl |
|---|---|---|
| **Tabletop** (štábní) | Nízká | Projít scénář „od stolu", ověřit role a rozhodování |
| **Walkthrough** technický | Střední | Ověřit, že konkrétní kroky/nástroje fungují |
| **Live / red‑purple team** | Vysoká | Reálné cvičení reakce na simulovaný útok |

Po každém cvičení: zaznamenej zjištění → aktualizuj runbook → opakuj.

### 13.4 Metriky (měř, ať se dá zlepšovat)
- **MTTD** (mean time to detect) – od kompromitace k detekci
- **MTTC** (mean time to contain) – od detekce k zadržení
- **MTTR** (mean time to recover) – od detekce k obnově provozu
- Počet incidentů dle kategorie a SEV, % zachycených před dopadem, dodržení
  lhůt hlášení, počet akčních položek z poučení a jejich plnění.

---

## 14. Zdroje

- NIST SP 800‑61 Rev. 3 (2025), *Incident Response Recommendations and
  Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile* —
  <https://csrc.nist.gov/pubs/sp/800/61/r3/final> ·
  <https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf>
- NIST Cybersecurity Framework (CSF) 2.0 — <https://www.nist.gov/cyberframework>
- SANS, *Incident Handler's Handbook* (proces PICERL) —
  <https://www.sans.org/white-papers/33901/>
- ISO/IEC 27035 (Information security incident management) —
  <https://www.iso.org/standard/78973.html>
- ENISA — <https://www.enisa.europa.eu/topics/incident-response> ; Reference
  Incident Classification Taxonomy
- MITRE ATT&CK — <https://attack.mitre.org/>
- CISA, *#StopRansomware Guide* (CISA, FBI, NSA, MS‑ISAC) —
  <https://www.cisa.gov/resources-tools/resources/stopransomware-guide> ;
  „I've Been Hit By Ransomware" — <https://www.cisa.gov/stopransomware/ive-been-hit-ransomware>
- NÚKIB — Portál pro hlášení a průvodce novým zákonem —
  <https://portal.nukib.gov.cz/> ; <https://nukib.gov.cz/>
- Zákon č. 264/2025 Sb., o kybernetické bezpečnosti —
  <https://www.zakonyprolidi.cz/cs/2025-264>
- Směrnice NIS2 (EU) 2022/2555, čl. 23 (oznamovací povinnosti) —
  <https://eur-lex.europa.eu/eli/dir/2022/2555/oj>
- Nařízení GDPR (EU) 2016/679, čl. 33 a 34 — <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
- No More Ransom (dešifrátory) — <https://www.nomoreransom.org/>
