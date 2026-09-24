export function whatsappLink(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}
