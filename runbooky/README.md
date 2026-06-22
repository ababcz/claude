# Runbooky pro řešení bezpečnostních incidentů

> Sada provozních postupů (runbooků) pro zvládání kybernetických bezpečnostních
> incidentů. Cílem je, aby si tým mohl **kterýkoli runbook vzít a reálně podle
> něj řešit probíhající incident** – bez nutnosti dohledávat teorii uprostřed krize.

Tento balík vznikl jako syntéza uznávaných metodik (NIST, SANS, ISO/IEC, ENISA,
MITRE, CISA) zasazená do **českého a evropského právního rámce** (zákon
č. 264/2025 Sb. o kybernetické bezpečnosti + NÚKIB, směrnice NIS2, GDPR).
Podrobné odůvodnění a zdroje viz [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md).

---

## 1. Jak tento balík používat

| Situace | Kam jít |
|---|---|
| **Právě teď řeším incident** | Otevři konkrétní runbook níže → sekce „🚨 První hodina" |
| Nevím, o jaký typ incidentu jde | [Rozhodovací strom triáže](#3-rychlá-triáž--jaký-runbook-použít) |
| Chci pochopit, jak jsou runbooky postavené | [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md) |
| Chci napsat nový runbook | [`01-sablona-runbooku.md`](01-sablona-runbooku.md) |
| Potřebuji role, eskalaci, lhůty, šablony | [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md), kap. 5–9 |

**Zlaté pravidlo:** Runbook je *vodítko, ne náhrada úsudku*. Pokud realita
neodpovídá postupu, řiď se prioritami v tomto pořadí:
**1) bezpečnost osob → 2) zastavení šíření → 3) zachování důkazů →
4) obnova provozu → 5) komunikace a reporting.**

---

## 2. Katalog runbooků

| # | Runbook | Pokrývá | Stav |
|---|---|---|---|
| RB‑01 | [**Ransomware**](runbook-01-ransomware.md) | Šifrování dat, dvojí/trojí vydírání, výkupné | ✅ vlajkový (plně rozpracovaný) |
| RB‑02 | [Phishing a BEC](runbook-02-phishing-bec.md) | Phishing, kompromitace e‑mailu, podvodné platby | ✅ |
| RB‑03 | [Kompromitace účtu / identity](runbook-03-kompromitace-uctu.md) | Převzetí účtu, krádež přihlašovacích údajů, MFA bypass | ✅ |
| RB‑04 | [Malware (mimo ransomware)](runbook-04-malware.md) | Trojské koně, infostealery, RAT, botnety | ✅ |
| RB‑05 | [Únik / exfiltrace dat](runbook-05-unik-dat.md) | Data breach, ztráta dat, neoprávněný přístup k datům | ✅ |
| RB‑06 | [DDoS / útok na dostupnost](runbook-06-ddos.md) | Zahlcení služeb, výpadky dostupnosti | ✅ |
| RB‑07 | [Insider threat / zneužití oprávnění](runbook-07-insider-threat.md) | Vnitřní pachatel, zneužití přístupů, sabotáž | ✅ |

> Každý runbook je **samonosný** – kritické checklisty a rozhodovací body jsou
> v něm vždy uvedeny přímo, abys při incidentu nemusel přepínat mezi dokumenty.

---

## 3. Rychlá triáž – jaký runbook použít?

```
                  ┌─────────────────────────────────────────┐
                  │  Co je primární pozorovaný projev?       │
                  └─────────────────────────────────────────┘
                                    │
   ┌───────────────┬───────────────┼───────────────┬────────────────┐
   ▼               ▼               ▼               ▼                ▼
Šifrované       Podvodný        Přihlášení/      Služba je      Podezřelé
soubory,        e‑mail,         účet se chová    nedostupná,    chování
výkupné         falešná         divně, cizí      zahlcení       zaměstnance/
   │            faktura,        přihlášení          │           odchod dat
   │            převzatá           │                │           zevnitř
   ▼            schránka           ▼                ▼                ▼
 RB‑01            │              RB‑03            RB‑06            RB‑07
                  ▼          (pokud následně                  (pokud zároveň
                RB‑02        malware → RB‑04)                  odešla data →
                                                              i RB‑05)
   ┌──────────────────────────────────────────────────────────┐
   │ Potvrzen únik/zkopírování dat ven?  → vždy přidej RB‑05   │
   │ Nalezen malware bez šifrování?      → RB‑04               │
   └──────────────────────────────────────────────────────────┘
```

Incidenty se **kombinují** (např. phishing → kompromitace účtu → ransomware →
únik dat). Použij více runbooků současně a urči jeden **vedoucí runbook** podle
nejvyššího dopadu.

---

## 4. IRT – kdo řeší incident (zkrácený přehled)

Plné role, zastupitelnost a RACI viz [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md), kap. 5.

| Role | Odpovědnost (zkráceně) |
|---|---|
| **Incident Manager (IM)** | Vede řešení, rozhoduje, eskaluje, drží časovou osu |
| **Technický lead** | Analýza, zadržení, eradikace, obnova |
| **Forenzní / DFIR** | Sběr a zajištění důkazů, analýza vektoru |
| **Komunikace / PR** | Interní i externí komunikace, média |
| **Právní / DPO** | Regulatorní a smluvní povinnosti, GDPR |
| **Management / sponzor** | Zásadní rozhodnutí (výkupné, odstávka, peníze) |
| **Zapisovatel** | Vede chronologický záznam (kdo, co, kdy) |

> V malé organizaci může jedna osoba zastávat víc rolí – důležité je, aby
> **každá role měla jmenovitě přiřazeného člověka a zástupce** ještě před incidentem.

---

## 5. Závažnost na první pohled (SEV)

| Úroveň | Kdy | Reakce |
|---|---|---|
| **SEV‑1 Kritický** | Ohrožen chod organizace / kritická data / bezpečnost osob; rozsáhlé šíření | Okamžitá aktivace IRT 24/7, krizový tým, management |
| **SEV‑2 Vysoký** | Významný dopad na část provozu nebo citlivá data | Aktivace IRT v pracovní i mimo pracovní dobu |
| **SEV‑3 Střední** | Omezený/lokalizovaný dopad | Standardní reakce IRT v pracovní době |
| **SEV‑4 Nízký** | Bez reálného dopadu, potlačeno | Záznam a vyřízení v rámci běžného provozu |

Klasifikační kritéria a postup změny závažnosti viz [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md), kap. 6.

---

## 6. Zákonné lhůty hlášení – na první pohled ⏱️

> **Lhůty běží od okamžiku ZJIŠTĚNÍ (detekce), ne od vzniku incidentu.**
> Při pochybnostech raď se s právním oddělením / DPO. Toto není právní rada;
> konkrétní povinnosti závisí na tom, zda je organizace regulovaným subjektem.

| Komu | Co | Lhůta | Pozn. |
|---|---|---|---|
| **NÚKIB** (zákon 264/2025 Sb.) | Prvotní hlášení významného incidentu | **24 h** od zjištění | Přes [portál NÚKIB](https://portal.nukib.gov.cz) |
| **NÚKIB** | Doplnění informací o vývoji | **72 h** (24 h u služeb vytvářejících důvěru) | |
| **NÚKIB** | Průběžná zpráva u incidentu > 30 dní; závěrečná zpráva | na vyžádání / po ukončení | |
| **ÚOOÚ** (GDPR čl. 33) | Ohlášení porušení ochrany osobních údajů | **72 h** od zjištění | Pokud hrozí riziko pro práva osob |
| **Subjekty údajů** (GDPR čl. 34) | Oznámení dotčeným osobám | **bez zbytečného odkladu** | Pokud hrozí *vysoké* riziko |
| **Policie ČR / NCOZ** | Trestní oznámení | bez zbytečného odkladu | Doporučeno u ransomware, vydírání, exfiltrace |
| **Pojišťovna (kyberpojištění)** | Nahlášení škodní události | dle smlouvy (často 24–72 h) | Jinak hrozí krácení plnění |

---

## 7. Údržba balíku

- **Revize:** každý runbook se reviduje min. 1× ročně a po každém reálném použití.
- **Testování:** min. 1× ročně tabletop cvičení (table‑top exercise) na vybraný scénář.
- **Vlastník:** každý runbook má jmenovitého vlastníka (viz hlavička dokumentu).
- **Verzování:** změny veď přes git; v hlavičce udržuj číslo verze a datum revize.

---

## 8. Předpoklady (co mít připraveno *před* incidentem)

Runbooky předpokládají, že existuje alespoň základní připravenost. Minimum:

- [ ] Aktuální **kontaktní seznam** IRT + externí podpora (DFIR, právník, pojišťovna, NÚKIB) – i v **offline/tištěné** podobě
- [ ] **Out‑of‑band komunikační kanál** (mimo firemní e‑mail/Teams – pro případ, že je síť kompromitována)
- [ ] **Offline / neměnné (immutable) zálohy** a otestovaný postup obnovy
- [ ] **Inventář aktiv** a dat (co je kritické, kde to běží, kdo je vlastník)
- [ ] **Logování a EDR** s dostatečnou retencí pro forenzní analýzu
- [ ] **Předjednaný DFIR retainer** / smlouva o pohotovosti s reakční dobou
- [ ] Tato sada runbooků dostupná **i mimo zasaženou infrastrukturu**

Detail viz fáze „Příprava" v každém runbooku a [`00-metodika-a-ramec.md`](00-metodika-a-ramec.md), kap. 4.
