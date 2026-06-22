# RB‑05 – Runbook: Únik / exfiltrace dat (data breach)

> Postup pro **únik, exfiltraci nebo neoprávněné zpřístupnění dat** – ať už při
> útoku (exfiltrace útočníkem, dvojí vydírání), chybou (špatně nastavené úložiště,
> omylem odeslaná data), nebo zevnitř. Silný **právní a GDPR rozměr**.

| | |
|---|---|
| **ID / Název** | RB‑05 Únik / exfiltrace dat |
| **Vlastník** | DPO / CISO |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Souvisí s** | [RB‑01 Ransomware](runbook-01-ransomware.md) (dvojí vydírání), [RB‑03 Kompromitace účtu](runbook-03-kompromitace-uctu.md), [RB‑04 Malware](runbook-04-malware.md), [RB‑07 Insider](runbook-07-insider-threat.md) |
| **MITRE ATT&CK** | T1567 Exfiltration over Web Service · T1048 Exfil over Alternative Protocol · T1041 Exfil over C2 · T1530 Data from Cloud Storage · T1213 Data from Information Repositories · T1020 Automated Exfiltration |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas, aktivuj IM a zapoj PRÁVNÍ/DPO od první minuty** (běží lhůty GDPR).
2. **Zastav probíhající únik:** zablokuj exfiltrační kanál (C2/účet/zařízení/sdílení), odeber veřejné zpřístupnění (public bucket/odkaz), zruš přístup pachateli.
3. **Zajisti důkazy** o tom, **co, kolik, kam a kdy** odešlo (proxy/firewall/netflow/DLP/cloud audit, e‑mail, USB logy). Nemaž logy.
4. **Urči, jaká data unikla** a zda obsahují **osobní/citlivé/zvláštní kategorie údajů**, obchodní tajemství, přístupové údaje.
5. **Posuď riziko pro dotčené osoby** → vstup pro rozhodnutí o hlášení **ÚOOÚ (72 h)** a oznámení **subjektům údajů**.
6. Identifikuj **zdroj úniku** (útok / chyba / insider) a aktivuj navazující runbook ([RB‑03](runbook-03-kompromitace-uctu.md)/[RB‑04](runbook-04-malware.md)/[RB‑01](runbook-01-ransomware.md)/[RB‑07](runbook-07-insider-threat.md)).

### ⛔ NEDĚLEJ
- Nemaž ani „neuklízej" logy a artefakty – jsou klíčové pro rozsah a důkaz.
- Nepodceň/„neutaj" – nehlášené porušení s rizikem je samo o sobě porušením GDPR.
- Nekomunikuj rozsah ven, dokud ho **nepotvrdíš** (nehádej počty dotčených).

### ☎️ KOHO VOLAT
IM · **DPO / právní** · CISO · PR · Management · (dle zdroje) SOC/IAM/HR · ⟨kontakty⟩

---

## 1. Účel a rozsah
Jakékoli **neoprávněné zpřístupnění, zkopírování, odeslání nebo ztráta dat**.
Často **navazuje** na jiný incident (kompromitace účtu, malware, ransomware,
insider) – ten řeš souběžně; **RB‑05 vlastní datovou a právní stránku**.

## 2. Indikátory a spouštěče
- DLP alert, velké/neobvyklé **odchozí přenosy**, nahrávání do cloudu (Rclone/MEGA/osobní úložiště).
- Veřejně přístupný **bucket / sdílení / repozitář**, indexované soubory, data na pastebin/leak site.
- Hromadné stahování z repozitářů/CRM/DB, přístup mimo pracovní vzorec.
- Externí upozornění (výzkumník, novinář, partner, útočník – výhrůžka zveřejněním).
- Ztráta/krádež **zařízení nebo nosiče** s daty.

## 3. Klasifikace závažnosti (specifika)
- **SEV‑1:** velký objem **osobních/citlivých/zvláštních** údajů; data již zveřejněna/hrozí; vysoké riziko pro osoby; obchodní tajemství / kritická IP.
- **SEV‑2:** omezený objem osobních/citlivých dat, riziko střední.
- **SEV‑3:** interní data bez osobních údajů, nízké riziko, únik zastaven.

## 4. Role a aktivace
**DPO/právní vede datovou a regulatorní stránku**, IM koordinuje, SOC/DFIR
technickou. U insidera HR, u útoku navazující runbooky. Viz [metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci).

---

## 5. Postup po fázích

### 0 Příprava
- [ ] **Klasifikace a inventář dat** (kde jsou osobní/citlivá data, vlastníci, toky).
- [ ] **DLP**, monitoring odchozího provozu, **cloud security** (CASB/konfigurace bucketů), kontrola sdílení.
- [ ] **Šifrování** dat at‑rest i in‑transit (snižuje riziko a může omezit oznamovací povinnost), správa klíčů.
- [ ] Připravený **proces posouzení GDPR** a šablony hlášení ÚOOÚ / oznámení subjektům; registr činností.

### 1 Detekce a analýza
- [ ] Potvrď únik a **zastav ho** (viz zadržení).
- [ ] **Rozsah dat:** jaké datové sady, kolik záznamů, jaké kategorie (osobní, zvláštní kategorie čl. 9, finanční, přístupové údaje, obchodní tajemství).
- [ ] **Kanál a směr:** kudy a kam data odešla; bylo to zkopírování, odeslání, nebo jen zpřístupnění? Stáhl to někdo?
- [ ] **Zdroj:** útok (účet/malware/ransomware) vs. chyba (konfigurace, omyl) vs. insider → aktivuj navazující runbook.
- [ ] **Časová osa** a **zajištění důkazů** ([§důkazy](00-metodika-a-ramec.md#10-zacházení-s-důkazy)); identifikace **dotčených subjektů údajů**.

### 2 Zadržení
- [ ] **Zablokuj kanál:** uzavři exfiltraci (C2/účet/zařízení), odeber **veřejné zpřístupnění**, zruš sdílení/přístup, zneplatni expozici klíčů/údajů, které unikly.
- [ ] **Revokuj kompromitované přístupy a tajemství** (hesla, API klíče, certifikáty, tokeny, které byly v datech).
- [ ] U zveřejněných dat zvaž **takedown** (žádost o stažení) – přes právní; pozor, ať tím nezničíš důkazy.

### 3 Eradikace
- [ ] Uzavři příčinu (oprava konfigurace, odebrání nadbytečných oprávnění, eradikace malwaru/útočníka, řešení insidera).
- [ ] Ověř, že již **neuniká** a nejsou další exponovaná data/úložiště.

### 4 Obnova
- [ ] Obnov bezpečný stav (přenastav přístupy, rotace tajemství), posílený monitoring odchozích dat.
- [ ] Podpora dotčeným osobám (info, doporučení – změna hesel, ostražitost vůči podvodům, příp. monitoring).

### 5 Poučení
- [ ] Root cause, úprava klasifikace/DLP/oprávnění/konfigurace, doškolení.
- [ ] Metriky: počet dotčených záznamů/osob, čas do zastavení, dodržení lhůt hlášení.

---

## 6. Rozhodovací strom (GDPR – velmi zjednodušeně, řídí DPO)
```
Týká se únik OSOBNÍCH údajů?
 ├─ NE  → interní evidence, řeš jako bezpečnostní/obchodní incident.
 └─ ANO → Pravděpodobné RIZIKO pro práva a svobody osob?
            ├─ NE  → zaeviduj (čl. 33/5), zpravidla bez hlášení (rozhoduje DPO).
            └─ ANO → HLAS ÚOOÚ do 72 h (čl. 33).
                       Je riziko VYSOKÉ?
                         ├─ ANO → OZNAM i dotčeným subjektům (čl. 34) bez zbytečného odkladu.
                         └─ NE  → hlášení ÚOOÚ, subjekty nemusí (rozhoduje DPO).
```
> Šifrovaná data s bezpečnými klíči mohou riziko (a tím povinnost) snížit – posuzuje DPO.

## 7. Komunikace
- **Potvrď rozsah dřív, než ho komunikuješ.** Připrav sdělení pro dotčené (co uniklo, jaké riziko, co mají udělat, kam se obrátit).
- U dvojího vydírání (data + ransomware) koordinuj s [RB‑01](runbook-01-ransomware.md): útočník může kontaktovat vaše zákazníky/média.
- Jeden hlas ven (PR + IM + právní). Viz [metodika §11](00-metodika-a-ramec.md#11-komunikace).

## 8. Právní a regulatorní
- **GDPR:** ÚOOÚ **72 h** (čl. 33), dotčené osoby (čl. 34) – řídí **DPO**.
- **NÚKIB 24/72 h** u významného incidentu.
- **Policie ČR/NCOZ** u úniku v důsledku útoku/krádeže/insidera.
- **Smluvní oznámení** (zákazníci, zpracovatelské smlouvy), sektorové regulátory.
- Viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

## 9. Checklist (rychlý)
- [ ] Únik **zastaven** (kanál/sdílení/přístup), exponovaná tajemství revokována
- [ ] Zajištěny logy a důkazy (co/kolik/kam/kdy); nic nesmazáno
- [ ] Určen rozsah a **kategorie dat** + dotčené subjekty údajů
- [ ] Zjištěn zdroj; aktivován navazující runbook (RB‑03/04/01/07)
- [ ] **DPO posoudil GDPR**; rozhodnuto o ÚOOÚ 72 h a oznámení subjektům
- [ ] Příčina uzavřena; monitoring; komunikace; poučení

## 10. Přílohy
Timeline log · **Soupis dotčených dat a subjektů** · Evidence IoC/kanálů · [Chain of custody](00-metodika-a-ramec.md#103-šablona-chain-of-custody) · Šablona hlášení ÚOOÚ a oznámení subjektům · Kontakty
