export function formatToEur(number: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  })
    .format(number)
    .replace(/\u00A0/g, " ");
}
