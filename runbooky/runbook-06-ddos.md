# RB‑06 – Runbook: DDoS / útok na dostupnost

> Postup pro **útok na dostupnost** – DDoS (volumetrický, protokolový,
> aplikační L7), zahlcení služeb. Cíl: **udržet/obnovit dostupnost** a odlišit
> útok od provozní špičky či výpadku. Pozor: DDoS bývá **zástěrka** pro jiný útok.

| | |
|---|---|
| **ID / Název** | RB‑06 DDoS / dostupnost |
| **Vlastník** | vedoucí provozu / NOC + IRT |
| **Verze / Datum revize** | 1.0 / 2026‑06‑22 |
| **Klasifikace** | Interní |
| **Souvisí s** | [RB‑01 Ransomware](runbook-01-ransomware.md) / [RB‑05 Únik dat](runbook-05-unik-dat.md) (DDoS jako zástěrka nebo trojí vydírání), [RB‑04 Malware](runbook-04-malware.md) |
| **MITRE ATT&CK** | T1498 Network DoS · T1499 Endpoint DoS · T1498.001 Reflection/Amplification |

---

## 🚨 První hodina (TL;DR – co udělat HNED)

### ✅ UDĚLEJ HNED
1. **Zaznamenej čas, aktivuj IM a NOC/provoz.** Potvrď, že jde o **útok**, ne výpadek/špičku (skok provozu, geografie, typ paketů, cílený endpoint).
2. **Aktivuj ochranu proti DDoS:** zapoj **scrubbing / anti‑DDoS službu** (poskytovatel, CDN/WAF, ISP), přepni provoz přes mitigaci.
3. **Charakterizuj útok:** vrstva (L3/4 vs L7), vektor (UDP flood, SYN, amplifikace, HTTP flood), cílová služba/IP, objem.
4. **Nasaď opatření** dle vrstvy: rate‑limiting, geo/IP blokace, filtrování vektoru, **WAF pravidla** pro L7, blackhole/anycast u poskytovatele.
5. **Hlídej souběžný útok:** DDoS může zakrývat **průnik/exfiltraci** – sleduj jiné alerty (SOC), neztrať ostražitost.
6. **Komunikuj dostupnost** dovnitř i ven (status page) a zapoj **ISP / poskytovatele** ochrany.

### ⛔ NEDĚLEJ
- Neřeš to jen „přidáním kapacity" naslepo – bez filtrování útoku to nestačí a prodraží se.
- Neignoruj ostatní bezpečnostní alerty během DDoS (riziko zástěrky).
- Neplať „výpalné" za zastavení (ransom DDoS) bez rozhodnutí managementu + právního.

### ☎️ KOHO VOLAT
IM · NOC/provoz · **Poskytovatel anti‑DDoS / ISP / CDN** · SOC · PR · ⟨kontakty⟩

---

## 1. Účel a rozsah
Útoky cílící na **dostupnost** služeb. **Mimo rozsah / navazuje:** pokud je DDoS
krytí pro průnik → souběžně příslušný runbook ([RB‑04](runbook-04-malware.md)/[RB‑03](runbook-03-kompromitace-uctu.md)/[RB‑05](runbook-05-unik-dat.md)); výpadek bez
útoku řeš jako provozní incident (mimo tento balík).

## 2. Indikátory a spouštěče
- Náhlý **skok provozu / vyčerpání pásma / spojení**, nedostupnost služby.
- Vysoký podíl provozu z neobvyklých geografií/ASN, anomální poměr typů paketů.
- L7: záplava „validních" HTTP požadavků na drahé endpointy, vyčerpání spojení/aplikace.
- **Výhrůžka / ransom DDoS** e‑mailem; opakované krátké „demo" útoky.

## 3. Klasifikace závažnosti (specifika)
- **SEV‑1:** nedostupnost **kritické / příjmové / veřejné** služby; dlouhotrvající; součást vydírání nebo zástěrka.
- **SEV‑2:** významné zpomalení/výpadky části služeb, mitigace zabírá.
- **SEV‑3:** drobný/krátký útok absorbovaný ochranou.

## 4. Role a aktivace
IM, NOC/provoz, síťař, poskytovatel ochrany/ISP, SOC (souběžný útok), PR. Viz [metodika §7](00-metodika-a-ramec.md#7-role-a-odpovědnosti-raci).

---

## 5. Postup po fázích

### 0 Příprava
- [ ] **Anti‑DDoS / scrubbing** (poskytovatel, CDN, WAF), **always‑on nebo on‑demand** s nasmlouvanou reakční dobou.
- [ ] Znát **kapacitu a topologii**, mít **runbook přepnutí** na mitigaci, kontakty na ISP/poskytovatele 24/7.
- [ ] **WAF** a rate‑limiting pro L7, **anycast/CDN**, autoscaling kritických služeb.
- [ ] **Status page** a komunikační šablony výpadku; baseline „normálního" provozu pro detekci anomálií.

### 1 Detekce a analýza
- [ ] Potvrď útok vs. provozní problém; **charakterizuj** vrstvu, vektor, cíl, objem, zdroje.
- [ ] Zjisti **dopad** (které služby, kolik uživatelů, příjmy/SLA).
- [ ] Prověř **souběžné indikátory** průniku (DDoS jako zástěrka) – zapoj SOC.

### 2 Zadržení (mitigace)
- [ ] **Přesměruj přes scrubbing/CDN**, aktivuj filtrování vektoru, **rate‑limiting**, geo/IP/ASN blokace.
- [ ] L3/4: u poskytovatele/ISP nasaď filtry, **RTBH/blackhole**, anti‑spoofing, blokace amplifikačních zdrojů.
- [ ] L7: **WAF pravidla**, challenge (CAPTCHA/JS), blokace škodlivých vzorů, ochrana drahých endpointů, caching.
- [ ] Škáluj kapacitu **spolu** s filtrováním (ne místo něj).

### 3 Eradikace / utlumení
- [ ] Laď pravidla podle vývoje útoku (vektory se mění), drž mitigaci, dokud útok neustane.
- [ ] Spolupracuj s ISP/poskytovatelem na zdrojích a dlouhodobém filtrování.

### 4 Obnova
- [ ] Po odeznění postupně **vrať provoz** do normálu, ověř plnou funkčnost a výkon.
- [ ] Ponech zvýšenou ostražitost (útoky se vrací ve vlnách); aktualizuj status page.

### 5 Poučení
- [ ] Vyhodnoť účinnost mitigace a kapacit, doplň chybějící ochranu, prověř, zda nešlo o zástěrku.
- [ ] Metriky: doba nedostupnosti, čas do mitigace, špičkový objem útoku, dopad na SLA.

---

## 6. Rozhodovací strom
```
Je to útok, nebo provozní problém/špička?
 ├─ Provozní → mimo tento runbook (provozní incident).
 └─ Útok → Jaká vrstva?
            ├─ L3/L4 (volumetrický/protokolový) → scrubbing + ISP/RTBH + filtr vektoru.
            └─ L7 (aplikační)                    → WAF + rate‑limit + challenge + cache.

Provázejí DDoS jiné alerty (přihlášení, exfiltrace, malware)?
 └─ ANO → DDoS může být ZÁSTĚRKA → souběžně RB‑03/04/05, neztrácej ostražitost.

Přišla výhrůžka / požadavek na platbu (ransom DDoS)?
 └─ ANO → management + právní; platbu nepreferovat; zapoj ISP/poskytovatele, případně policii.
```

## 7. Komunikace
- **Status page + interní info**: co je nedostupné, co děláme, kdy update.
- Koordinace s **ISP/poskytovatelem ochrany**. Jeden hlas ven (PR + IM). Viz [metodika §11](00-metodika-a-ramec.md#11-komunikace).

## 8. Právní a regulatorní
- **NÚKIB 24/72 h**, jde‑li o **významný incident** (výpadek dostupnosti regulované služby často spadá pod hlášení).
- **Policie ČR/NCOZ** u vydírání (ransom DDoS) nebo cíleného útoku.
- GDPR obvykle ne (pokud nejde i o únik dat). Viz [metodika §12](00-metodika-a-ramec.md#12-právní-a-regulatorní-povinnosti).

## 9. Checklist (rychlý)
- [ ] Potvrzen útok; charakterizována vrstva/vektor/cíl/objem
- [ ] Aktivována mitigace (scrubbing/CDN/WAF/ISP), nasazeno filtrování + rate‑limit
- [ ] Ověřena absence **souběžného průniku** (zástěrka)
- [ ] Komunikace (status page, interní, poskytovatel)
- [ ] Po odeznění obnova + zvýšená ostražitost
- [ ] NÚKIB dle významnosti; poučení a doplnění ochrany

## 10. Přílohy
Timeline log · Charakteristika útoku (vektor/objem/zdroje) · Kontakty ISP/poskytovatele 24/7 · Komunikační šablony výpadku
