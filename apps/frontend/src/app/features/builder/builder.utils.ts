export type SectionType =
  | "hero"
  | "features"
  | "stats"
  | "image-text"
  | "testimonials"
  | "cta"
  | "contact"
  | "text"
  | "faq"
  | "custom-html"
  | "video-embed"
  | "smart-link"
  | "email-fan-gate"
  | "header"
  | "footer";

export function getDefaultData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        headline: "Music That Moves You",
        subtext:
          "Experience the raw energy of live performances, soulful studio sessions, and exclusive merch — all in one place.",
        primaryBtnText: "Listen Now",
        primaryBtnUrl: "#",
        secondaryBtnText: "Book a Show",
        secondaryBtnUrl: "#contact",
        bgColor: "#0f0f0f",
        textColor: "#ffffff",
        accentColor: "#e63946",
        textAlign: "center",
        paddingY: "80",
      };
    case "features":
      return {
        title: "What We Offer",
        subtitle: "Everything a music lover could want",
        bgColor: "#ffffff",
        columns: "3",
        cardStyle: "bordered",
        items: [
          {
            icon: "🎸",
            title: "Live Performances",
            desc: "Electrifying shows across major venues and festivals",
          },
          {
            icon: "🎙️",
            title: "Studio Sessions",
            desc: "Exclusive behind-the-scenes recording content",
          },
          {
            icon: "🛍️",
            title: "Official Merch",
            desc: "Limited edition drops — tees, vinyls, and more",
          },
        ],
      };
    case "stats":
      return {
        bgColor: "#0f0f0f",
        accentColor: "#e63946",
        textColor: "#ffffff",
        items: [
          { number: "500K+", label: "Monthly Streams" },
          { number: "100+", label: "Live Shows" },
          { number: "20+", label: "Cities Toured" },
          { number: "5", label: "Studio Albums" },
        ],
      };
    case "image-text":
      return {
        tag: "About the Artist",
        heading: "Born to Make Music",
        body: "From humble garage jams to sold-out arenas, the journey has been nothing short of extraordinary. Rooted in passion, driven by rhythm.",
        ctaText: "Read Full Story",
        ctaUrl: "#",
        imagePosition: "right",
        imageUrl: "",
        bgColor: "#f9fafb",
      };
    case "testimonials":
      return {
        title: "What Fans Are Saying",
        bgColor: "#ffffff",
        cardStyle: "shadow",
        items: [
          {
            text: "Absolutely blown away by the live show. Best concert I've been to!",
            name: "Arjun Mehta",
            role: "Fan",
            rating: 5,
          },
          {
            text: "The new album is on repeat. Every track is a banger.",
            name: "Sneha Kapoor",
            role: "Fan",
            rating: 5,
          },
          {
            text: "Got the vinyl merch — insane quality. Will definitely buy again.",
            name: "Rohan Das",
            role: "Fan",
            rating: 5,
          },
        ],
      };
    case "cta":
      return {
        headline: "Ready to Experience the Music?",
        subtext: "Book tickets for the next show before they sell out.",
        btnText: "Get Tickets",
        btnUrl: "#contact",
        bgColor: "#e63946",
        btnColor: "#ffffff",
        textColor: "#ffffff",
      };
    case "contact":
      return {
        title: "Get In Touch",
        subtitle: "Booking inquiries, collabs, or just say hi",
        showName: true,
        showPhone: true,
        showEmail: true,
        showMessage: true,
        submitText: "Send Message",
        whatsappNumber: "",
        bgColor: "#f9fafb",
        btnColor: "#0f0f0f",
      };
    case "text":
      return {
        content:
          "Add your text content here. You can write paragraphs, lists, and more.",
        fontSize: "16",
        color: "#374151",
        align: "left",
        maxWidth: "800",
      };
    case "faq":
      return {
        title: "Frequently Asked Questions",
        bgColor: "#ffffff",
        accentColor: "#e63946",
        items: [
          {
            question: "How can I book the artist for an event?",
            answer:
              "Fill in the contact form below or reach out via WhatsApp for booking inquiries.",
          },
          {
            question: "Where can I buy official merch?",
            answer:
              "Merch is available exclusively through this page and at live shows.",
          },
          {
            question: "Is there a fan club or membership?",
            answer:
              "Yes! Sign up via the contact form to get early access to drops and show tickets.",
          },
        ],
      };
    case "custom-html":
      return {
        html: `<!-- Paste your HTML, CSS, and JS here -->
<style>
  .custom-block {
    padding: 40px;
    text-align: center;
    background: #f9fafb;
    font-family: sans-serif;
  }
  .custom-block h2 { color: #111; }
  .custom-block p  { color: #555; margin-top: 8px; }
</style>

<div class="custom-block">
  <h2>Custom HTML Section</h2>
  <p>Replace this with your own HTML, CSS, and JavaScript.</p>
</div>`,
        height: "300",
      };
    case "video-embed":
      return {
        url: "",
        title: "",
        bgColor: "#000000",
        aspectRatio: "16:9",
        paddingY: "40",
        maxWidth: "900",
      };
    case "smart-link":
      return {
        coverUrl: "",
        title: "Track / Album Title",
        artist: "Artist Name",
        releaseType: "single",
        bgColor: "#0f0f0f",
        textColor: "#ffffff",
        accentColor: "#e63946",
        links: [
          { platform: "spotify", label: "Spotify", url: "", active: true },
          { platform: "apple", label: "Apple Music", url: "", active: true },
          {
            platform: "youtube",
            label: "YouTube Music",
            url: "",
            active: true,
          },
          { platform: "amazon", label: "Amazon Music", url: "", active: false },
          { platform: "jiosaavn", label: "JioSaavn", url: "", active: true },
          { platform: "gaana", label: "Gaana", url: "", active: false },
          { platform: "deezer", label: "Deezer", url: "", active: false },
          {
            platform: "soundcloud",
            label: "SoundCloud",
            url: "",
            active: false,
          },
          { platform: "tidal", label: "Tidal", url: "", active: false },
        ],
      };
    case "email-fan-gate":
      return {
        headline: "Join the Fan Club",
        subtext:
          "Get exclusive access to music, tour dates & merch drops straight to your inbox.",
        namePlaceholder: "Your Name",
        emailPlaceholder: "Your Email",
        showName: true,
        platform: "",
        btnText: "Join Now",
        successMessage: "You're in! Welcome to the inner circle. 🎉",
        bgColor: "#0f0f0f",
        textColor: "#ffffff",
        accentColor: "#e63946",
        btnBgColor: "#e63946",
        btnTextColor: "#ffffff",
        paddingY: "80",
      };
    case "header":
      return {
        logoType: "text",
        logoText: "Brand Name",
        logoUrl: "",
        links: [
          { label: "Home", url: "#" },
          { label: "About", url: "#about" },
          { label: "Contact", url: "#contact" },
        ],
        ctaText: "",
        ctaUrl: "",
        bgColor: "#ffffff",
        textColor: "#111111",
        linkColor: "#374151",
        ctaBgColor: "#534AB7",
        ctaTextColor: "#ffffff",
      };
    case "footer":
      return {
        logoType: "text",
        logoText: "Brand Name",
        logoUrl: "",
        tagline: "Making the world a better place.",
        columns: [
          {
            heading: "Quick Links",
            links: [
              { label: "Home", url: "#" },
              { label: "About", url: "#about" },
              { label: "Contact", url: "#contact" },
            ],
          },
        ],
        socials: [
          { platform: "instagram", url: "" },
          { platform: "youtube", url: "" },
          { platform: "facebook", url: "" },
          { platform: "whatsapp", url: "" },
        ],
        copyright: `© ${new Date().getFullYear()} Brand Name. All rights reserved.`,
        bgColor: "#111111",
        textColor: "#ffffff",
        mutedColor: "#9ca3af",
      };
    default:
      return {};
  }
}

export const SECTION_ELEMENTS = [
  { type: "header", label: "Header", icon: "▣", category: "STRUCTURE" },
  { type: "footer", label: "Footer", icon: "▤", category: "STRUCTURE" },
  { type: "hero", label: "Hero", icon: "⊞", category: "LAYOUT" },
  { type: "image-text", label: "Image + Text", icon: "◫", category: "LAYOUT" },
  { type: "features", label: "Features", icon: "✦", category: "CONTENT" },
  { type: "stats", label: "Stats", icon: "📊", category: "CONTENT" },
  { type: "testimonials", label: "Reviews", icon: "💬", category: "CONTENT" },
  { type: "text", label: "Text Block", icon: "T", category: "CONTENT" },
  { type: "faq", label: "FAQ", icon: "❓", category: "CONTENT" },
  { type: "cta", label: "CTA", icon: "🎯", category: "CONVERSION" },
  {
    type: "contact",
    label: "Contact Form",
    icon: "📩",
    category: "CONVERSION",
  },
  {
    type: "email-fan-gate",
    label: "Fan Gate",
    icon: "✉️",
    category: "CONVERSION",
  },
  { type: "video-embed", label: "Video Embed", icon: "▶", category: "MEDIA" },
  { type: "smart-link", label: "Smart Link", icon: "🎵", category: "MUSIC" },
  {
    type: "custom-html",
    label: "Custom HTML",
    icon: "</>",
    category: "ADVANCED",
  },
];

export const TEMPLATES = [
  {
    label: "Musician / Artist",
    icon: "🎸",
    sections: ["hero", "features", "stats", "image-text", "contact"],
  },
  {
    label: "Smart Link Page",
    icon: "🎵",
    sections: ["smart-link"],
  },
  {
    label: "Business / Service",
    icon: "💼",
    sections: ["hero", "features", "testimonials", "cta", "contact"],
  },
  {
    label: "Restaurant / Cafe",
    icon: "🍽️",
    sections: ["hero", "features", "image-text", "contact"],
  },
  {
    label: "Event / Promotion",
    icon: "🎉",
    sections: ["hero", "stats", "cta", "contact"],
  },
];
