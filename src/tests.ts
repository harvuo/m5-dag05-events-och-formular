// Tester för dag 5. Ändra inte den här filen.
// Testerna för order.js och visaOrder är fördjupning. Resten ska bli gröna.
import type { Ratt, Filter } from "./typer";
import { test, assertEqual, assertTrue, visaResultat } from "./testlib";
import { meny } from "./data";
import { filtreraMeny } from "./filter";
import { laggTillIOrder, rensaOrder, antalIOrder } from "./order";
import { kopplaFilter, kopplaLaggTill } from "./events";
import {
  valideraNamn,
  valideraEpost,
  valideraTelefon,
  valideraDatum,
  valideraAntal,
  valideraFormular,
} from "./validering";
import { skapaRattKort, visaOrder } from "./ui";

const liten: Ratt[] = [
  {
    id: 1,
    namn: "Bulle",
    pris: 35,
    kategori: "bakverk",
    vegetarisk: true,
    bild: "images/bulle.svg",
    beskrivning: "Bakad.",
  },
  {
    id: 2,
    namn: "Kaffe",
    pris: 32,
    kategori: "dryck",
    vegetarisk: true,
    bild: "images/kaffe.svg",
    beskrivning: "Lokalrostat.",
  },
  {
    id: 3,
    namn: "Skinkmacka",
    pris: 62,
    kategori: "lunch",
    vegetarisk: false,
    bild: "images/smorgas.svg",
    beskrivning: "Skinka.",
  },
];

// ---- filtreraMeny ----
test("filtreraMeny: alla ger hela listan", () => {
  assertEqual(filtreraMeny(liten, "alla").length, 3);
});
test("filtreraMeny: vegetarisk", () => {
  assertEqual(
    filtreraMeny(liten, "vegetarisk").map((r) => r.id),
    [1, 2],
  );
});
test("filtreraMeny: kategori", () => {
  assertEqual(
    filtreraMeny(liten, "dryck").map((r) => r.id),
    [2],
  );
  assertEqual(filtreraMeny(meny, "lunch").length, 3);
});
test("filtreraMeny: okänt filter ger tom lista", () => {
  assertEqual(filtreraMeny(liten, "pizza" as Filter), []);
});

// ---- event delegation: kopplaFilter ----
function klicka(rot: HTMLElement, valjare: string): void {
  const element = rot.querySelector<HTMLElement>(valjare);
  if (!element) {
    throw new Error("Hittar inget element som matchar " + valjare);
  }
  element.click();
}
function byggFilter() {
  const grupp = document.createElement("div");
  grupp.innerHTML =
    '<button data-filter="alla" aria-pressed="true">Alla</button><button data-filter="dryck" aria-pressed="false"><span>Drycker</span></button><p>Text</p>';
  return grupp;
}
test("kopplaFilter: klick anropar callback med filtret", () => {
  const grupp = byggFilter();
  const valda: string[] = [];
  kopplaFilter(grupp, (f) => valda.push(f));
  klicka(grupp, '[data-filter="dryck"]');
  assertEqual(valda, ["dryck"]);
});
test("kopplaFilter: aria-pressed flyttas till den klickade knappen", () => {
  const grupp = byggFilter();
  kopplaFilter(grupp, () => {});
  klicka(grupp, '[data-filter="dryck"]');
  assertEqual(
    grupp.querySelector('[data-filter="dryck"]')?.getAttribute("aria-pressed"),
    "true",
  );
  assertEqual(
    grupp.querySelector('[data-filter="alla"]')?.getAttribute("aria-pressed"),
    "false",
  );
});
test("kopplaFilter: klick inuti knappen (på span) fungerar också", () => {
  const grupp = byggFilter();
  const valda: string[] = [];
  kopplaFilter(grupp, (f) => valda.push(f));
  klicka(grupp, "span");
  assertEqual(valda, ["dryck"]);
});
test("kopplaFilter: klick på annat i gruppen gör ingenting", () => {
  const grupp = byggFilter();
  const valda: string[] = [];
  kopplaFilter(grupp, (f) => valda.push(f));
  klicka(grupp, "p");
  assertEqual(valda, []);
});
test("kopplaLaggTill: callback får id som tal", () => {
  const box = document.createElement("div");
  box.append(skapaRattKort(liten[1]));
  const ider: number[] = [];
  kopplaLaggTill(box, (id) => ider.push(id));
  klicka(box, "button.lagg-i-order");
  assertEqual(ider, [2]);
});

// ---- skapaRattKort: knappen ----
test("skapaRattKort: har en knapp .lagg-i-order med data-id", () => {
  const knapp = skapaRattKort(liten[0]).querySelector<HTMLButtonElement>(
    "button.lagg-i-order",
  );
  assertTrue(knapp !== null, "knappen saknas");
  assertEqual(knapp?.dataset.id, "1");
  assertEqual(knapp?.type, "button");
});
test("skapaRattKort: knappen har ett unikt tillgängligt namn (aria-label)", () => {
  const knapp = skapaRattKort(liten[0]).querySelector("button");
  assertTrue(
    knapp?.getAttribute("aria-label")?.includes("Bulle"),
    "aria-label ska nämna rätten",
  );
});

// ---- validering ----
test("valideraNamn", () => {
  assertEqual(valideraNamn(""), "Fyll i ditt namn.");
  assertEqual(valideraNamn("   "), "Fyll i ditt namn.");
  assertEqual(valideraNamn("A"), "Namnet måste vara minst 2 tecken.");
  assertEqual(valideraNamn("Anna"), "");
});
test("valideraEpost: tom och utan @", () => {
  assertEqual(valideraEpost(""), "Fyll i din e-postadress.");
  assertEqual(valideraEpost("anna"), "E-postadressen måste innehålla @.");
});
test("valideraEpost: fel form och giltig", () => {
  assertEqual(
    valideraEpost("anna@"),
    "Ange en giltig e-postadress, till exempel namn@exempel.se.",
  );
  assertEqual(
    valideraEpost("anna@exempel"),
    "Ange en giltig e-postadress, till exempel namn@exempel.se.",
  );
  assertEqual(valideraEpost("anna@exempel.se"), "");
});
test("valideraTelefon: valfritt, så tom text är giltig", () => {
  assertEqual(valideraTelefon(""), "");
});
test("valideraTelefon: tecken och längd", () => {
  assertEqual(valideraTelefon("070-123 45 67"), "");
  assertEqual(valideraTelefon("+46 70 123 45 67"), "");
  assertEqual(
    valideraTelefon("abc"),
    "Telefonnumret får bara innehålla siffror, mellanslag, plus och bindestreck.",
  );
  assertEqual(valideraTelefon("12345"), "Telefonnumret är för kort.");
});
test("valideraDatum", () => {
  assertEqual(valideraDatum("", "2026-10-19"), "Välj ett datum.");
  assertEqual(
    valideraDatum("2026-10-18", "2026-10-19"),
    "Datumet kan inte vara i det förflutna.",
  );
  assertEqual(valideraDatum("2026-10-19", "2026-10-19"), "");
  assertEqual(valideraDatum("2027-01-01", "2026-10-19"), "");
});
test("valideraAntal", () => {
  assertEqual(valideraAntal(""), "Välj antal personer.");
  assertEqual(valideraAntal("3"), "");
});
test("valideraFormular: giltigt ger tomt objekt", () => {
  const ok = {
    namn: "Anna",
    epost: "anna@exempel.se",
    telefon: "",
    datum: "2026-11-01",
    antal: "2",
  };
  assertEqual(valideraFormular(ok, "2026-10-19"), {});
});
test("valideraFormular: bara fälten med fel ingår", () => {
  const fel = valideraFormular(
    {
      namn: "",
      epost: "anna@exempel.se",
      telefon: "",
      datum: "2026-11-01",
      antal: "",
    },
    "2026-10-19",
  );
  assertEqual(fel, {
    namn: "Fyll i ditt namn.",
    antal: "Välj antal personer.",
  });
});

// ---- fördjupning: order.js och visaOrder ----
test("order: laggTillIOrder lägger till ny rad", () => {
  assertEqual(laggTillIOrder([], 1), [{ id: 1, antal: 1 }]);
});
test("order: laggTillIOrder ökar antal för befintlig rad", () => {
  assertEqual(
    laggTillIOrder(
      [
        { id: 1, antal: 1 },
        { id: 2, antal: 1 },
      ],
      1,
    ),
    [
      { id: 1, antal: 2 },
      { id: 2, antal: 1 },
    ],
  );
});
test("order: laggTillIOrder ändrar inte ordern den fick in", () => {
  const ordern = [{ id: 1, antal: 1 }];
  laggTillIOrder(ordern, 1);
  laggTillIOrder(ordern, 2);
  assertEqual(ordern, [{ id: 1, antal: 1 }]);
});
test("order: rensaOrder och antalIOrder", () => {
  assertEqual(rensaOrder(), []);
  assertEqual(
    antalIOrder([
      { id: 1, antal: 2 },
      { id: 2, antal: 3 },
    ]),
    5,
  );
  assertEqual(antalIOrder([]), 0);
});
function orderRef() {
  const lista = document.createElement("ul");
  const summa = document.createElement("span");
  const tom = document.createElement("p");
  return { lista, summa, tom };
}
test("visaOrder: tom order visar tom-texten och summan 0 kr", () => {
  const ref = orderRef();
  visaOrder(ref, [], liten);
  assertEqual(ref.lista.children.length, 0);
  assertEqual(ref.tom.classList.contains("dold"), false);
  assertEqual(ref.summa.textContent, "0 kr");
});
test("visaOrder: rader, dold tom-text och summa", () => {
  const ref = orderRef();
  visaOrder(
    ref,
    [
      { id: 1, antal: 2 },
      { id: 2, antal: 1 },
    ],
    liten,
  );
  assertEqual(ref.lista.children.length, 2);
  assertTrue(
    ref.lista.children[0].textContent.includes("2 × Bulle"),
    "första raden",
  );
  assertEqual(ref.tom.classList.contains("dold"), true);
  assertEqual(ref.summa.textContent, "102 kr");
});
test("visaOrder: anrop två gånger dubblerar inte raderna", () => {
  const ref = orderRef();
  visaOrder(ref, [{ id: 1, antal: 1 }], liten);
  visaOrder(ref, [{ id: 1, antal: 1 }], liten);
  assertEqual(ref.lista.children.length, 1);
});

visaResultat();
