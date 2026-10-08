/* The one place for site settings. Leave a value empty ('') and the button or
   block that needs it is hidden (or shows "coming soon") — nothing breaks. */
window.INVOICEO = {
  version: '1.0.0',
  releaseDate: '9 October 2026',

  // WhatsApp number with country code, digits only, e.g. '919876543210'.
  whatsapp: '919025537550',

  // Google Forms (from your own Google account).
  forms: {
    support: 'https://docs.google.com/forms/d/e/1FAIpQLSc6HAtInB-gJv9T2vwfLHoy26V2T-jTh83cMCBbuY889UwOuA/viewform',
    customization: 'https://docs.google.com/forms/d/e/1FAIpQLSeUgqmkyVSTjPFYT8p42ocNIHXM0q9JrbXWu7OyNOYHXC9DZQ/viewform',
    customizationEmbed: 'https://docs.google.com/forms/d/e/1FAIpQLSeUgqmkyVSTjPFYT8p42ocNIHXM0q9JrbXWu7OyNOYHXC9DZQ/viewform?embedded=true',
    feedback: 'https://docs.google.com/forms/d/e/1FAIpQLScAyP1dcMYSECr67mjOiol7-JUWVEguaB719En9OMwbfDOPtg/viewform'
  },

  // Google Analytics measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = no tracking.
  analyticsId: '',

  // Installer sizes shown on the Download page, e.g. '28 MB'. Empty = not shown.
  sizes: { windows: '', mac: '', linuxDeb: '', linuxAppImage: '' }
};
