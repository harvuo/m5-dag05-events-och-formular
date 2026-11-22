// Dag 5 (fördjupning): Beställningen som data. En order är en array: [{ id: 1, antal: 2 }, ...]
import type { OrderRad } from "./typer";
// Alla funktioner ska returnera NYA arrayer och aldrig ändra order de får in.

// Lägg till en rätt. Finns id redan i ordern: öka antal med 1. Annars lägg till { id, antal: 1 }.
export function laggTillIOrder(order: OrderRad[], id: number): OrderRad[] {
  const befintligRad = order.find((rad) => rad.id === id);

  if (!befintligRad) {
    return [...order, { id, antal: 1 }];
  }

  const index = order.indexOf(befintligRad);
  const uppdateradRad: OrderRad = {
    ...befintligRad,
    antal: befintligRad.antal + 1,
  };

  return [...order.slice(0, index), uppdateradRad, ...order.slice(index + 1)];
}

// En tom order.
export function rensaOrder(): OrderRad[] {
  return [];
}

// Totala antalet varor i ordern (summan av alla antal).
export function antalIOrder(order: OrderRad[]): number {
  return order.reduce((summa, rad) => summa + rad.antal, 0);
}
