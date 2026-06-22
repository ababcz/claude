# Šablona runbooku `RB‑XX – <Název kategorie incidentu>`

> Zkopíruj tento soubor a vyplň. Sekce ⟨v lomených závorkách⟩ nahraď obsahem.
> Drž se [principů dobrého runbooku](00-metodika-a-ramec.md#5-principy-dobrého-runbooku)
> a [sedmi pohledů](00-metodika-a-ramec.md#4-sedm-pohledů-na-incident).
> Smaž tyto poznámky a citace metodiky před ostrým nasazením.

| | |
|---|---|
| **ID / Název** | RB‑XX ⟨název⟩ |
| **Vlastník** | ⟨role/jméno⟩ |
| **Verze / Datum revize** | 0.1 / ⟨datum⟩ |
| **Klasifikace** | Interní |
| **Souvisí s** | ⟨jiné runbooky, které se často kombinují⟩ |
| **MITRE ATT&CK** | ⟨relevantní taktiky/techniky⟩ |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

> Nejdůležitější sekce. Musí být použitelná bez čtení zbytku dokumentu.

**✅ UDĚLEJ HNED**
1. ⟨1. okamžitá akce – typicky: zaznamenej čas a aktivuj IM⟩
2. ⟨2. zadržení bez ztráty důkazů – např. izoluj, ne vypínej⟩
3. ⟨3. zahaj časovou osu a zajisti volatilní důkazy⟩
4. ⟨4. přejdi na out‑of‑band komunikaci, pokud hrozí kompromitace kanálů⟩

**⛔ NEDĚLEJ (nevratné chyby)**
- ⟨např. nevypínat/nerestartovat, nemazat, neplatit, nevarovat útočníka⟩

**☎️ KOHO VOLAT**
- IM: ⟨kontakt⟩ · DFIR: ⟨kontakt⟩ · Právní/DPO: ⟨kontakt⟩ · Mgmt: ⟨kontakt⟩

---

## 1. Účel a rozsah
⟨Co runbook pokrývá a co výslovně ne. Kdy ho použít a kdy sáhnout po jiném.⟩

## 2. Indikátory a spouštěče (jak poznám, že jde o tento typ)
⟨Pozorovatelné projevy, alerty, hlášení uživatelů. Co spustí aktivaci.⟩

## 3. Klasifikace závažnosti (specifika pro tuto kategorii)
⟨Doplň obecnou [matici SEV](00-metodika-a-ramec.md#8-klasifikace-závažnosti) o
faktory typické pro tuto kategorii.⟩

## 4. Role a aktivace IRT
⟨Kdo a kdy se aktivuje; odkaz na [RACI](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci) + specifika.⟩

---

## 5. Postup po fázích

### 0 Příprava (co mít hotové předem)
- [ ] ⟨preventivní a připravenostní opatření specifická pro kategorii⟩

### 1 Detekce a analýza
**Cíl:** potvrdit, klasifikovat, určit rozsah a vektor.
- [ ] ⟨potvrzení / vyloučení falešného poplachu⟩
- [ ] ⟨scoping – kolik aktiv, kteří uživatelé, jak hluboko⟩
- [ ] ⟨zajištění důkazů (viz [zacházení s důkazy](00-metodika-a-ramec.md#10-zacházení-s-důkazy))⟩
- [ ] ⟨identifikace vektoru / patient zero / IoC⟩

### 2 Zadržení (containment)
**Cíl:** zastavit šíření a další škodu bez ztráty důkazů.
- [ ] ⟨krátkodobé zadržení (izolace) ⟩
- [ ] ⟨dlouhodobé zadržení (reset přístupů, segmentace, blokace C2)⟩

### 3 Eradikace
**Cíl:** odstranit hrozbu a uzavřít vstupní vektor.
- [ ] ⟨odstranění malwaru / perzistence / účtů útočníka⟩
- [ ] ⟨záplaty, hardening, uzavření zranitelnosti⟩

### 4 Obnova (recovery)
**Cíl:** bezpečně obnovit provoz a ověřit „čistotu".
- [ ] ⟨priorita obnovy, validace, monitoring, definice „clean"⟩

### 5 Poučení (lessons learned)
- [ ] ⟨post‑incident review, root cause, akční položky, aktualizace runbooku, metriky⟩

---

## 6. Rozhodovací stromy
⟨Klíčová rozhodnutí typická pro kategorii, jako strom/tabulka „když X, pak Y".⟩

## 7. Komunikace
⟨Specifika nad rámec [obecné komunikace](00-metodika-a-ramec.md#11-komunikace) –
kdo, co, kdy; vzory sdělení.⟩

## 8. Právní a regulatorní povinnosti
⟨Co a komu nahlásit pro tuto kategorii – odkaz na [kap. 12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti) + specifika.⟩

---

## 9. Checklisty (rychlé, k odškrtání)
⟨Kondenzované checklisty po fázích – to, co se reálně odškrtává během incidentu.⟩

## 10. Přílohy
- Záznam časové osy (timeline log)
- Evidence IoC
- [Chain of custody](00-metodika-a-ramec.md#103-šablona-chain-of-custody)
- Kontakty (interní + externí)
- Komunikační vzory
