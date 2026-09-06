export type BookingContact = {
  email: string;
  whatsapp: string;
  instagramUrl?: string;
};

export function bookingMessage(data: Record<string, FormDataEntryValue>) {
  const value = (key: string) => typeof data[key] === 'string' ? data[key].trim() : '';
  const date = value('date');
  return [
    'Olá, Acácias! Quero conversar sobre um evento.',
    '',
    `Nome: ${value('name')}`,
    ...(value('company') ? [`Empresa / produção: ${value('company')}`] : []),
    `Cidade: ${value('city')}`,
    `Evento: ${value('event')}`,
    ...(date ? [`Data prevista: ${date.split('-').reverse().join('/')}`] : []),
    ...(value('phone') ? [`Telefone: ${value('phone')}`] : []),
    `E-mail: ${value('email')}`,
    '',
    value('message'),
  ].join('\n');
}

export function bookingDestination(contact: BookingContact, message: string) {
  if (/^\d{10,15}$/.test(contact.whatsapp)) {
    return {
      channel: 'WhatsApp' as const,
      url: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`,
    };
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return {
      channel: 'e-mail' as const,
      url: `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent('Evento com a Acácias')}&body=${encodeURIComponent(message)}`,
    };
  }
  return null;
}
