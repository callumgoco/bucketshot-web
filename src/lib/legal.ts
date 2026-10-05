export const CONTACT_EMAIL = "trywaffle@gmail.com";

export const LEGAL_EFFECTIVE_DATE = "5 October 2026";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const privacySections: LegalSection[] = [
  {
    title: "Who we are",
    paragraphs: [
      "BucketShot (“we”, “us”) provides a photography location catalog and trip-planning product on the web and in the iOS app. This Privacy Policy explains what information we collect, how we use it, and your choices.",
      `Questions about privacy: ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: "Information we collect",
    paragraphs: [
      "Account information: when you sign up we collect your email address and authentication credentials. On the web this is email/password or magic-link sign-in via Supabase. On iOS you may also use Sign in with Apple.",
      "Profile information: display name, username, bio, home region, gear notes, photography interests, and optional avatar image.",
      "User content: locations, Bucket Shots, photographs, comments, collections, trips, gear lists, and related notes or media you create or upload.",
      "Location and media metadata: coordinates you provide or that we read from photo EXIF (for example via browser file import). You control whether places and photographs are public, private, or shown with approximate coordinates.",
      "Usage data needed to operate the product: saves, bookmarks, and similar preferences associated with your account. We do not run a third-party analytics or crash-reporting SDK in the web app described here.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "To create and secure your account, sync data between web and iOS, show the catalog, and power saves, trips, collections, comments, and publishing.",
      "To display weather and light context near places (via Open-Meteo) and to render maps (MapLibre with CARTO basemap tiles).",
      "To host and deliver media through our backend (Supabase Auth, database, and storage).",
      "To communicate with you about the service when you contact us, and to meet legal obligations.",
    ],
  },
  {
    title: "Sharing",
    paragraphs: [
      "We use service providers that process data on our behalf, including Supabase (authentication, database, file storage), Open-Meteo (weather), and CARTO/MapLibre tile providers (maps).",
      "Content you mark public can be visible to other users and guests browsing the catalog.",
      "We do not sell your personal information.",
      "We may disclose information if required by law, to protect rights and safety, or in connection with a merger, acquisition, or asset sale.",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "We keep account and content data while your account is active and as needed to provide the service. You may delete content you control or request account deletion by contacting us. Some backups or legal records may persist for a limited period.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use industry-standard measures appropriate to our stack (including HTTPS and provider access controls). No method of transmission or storage is completely secure.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "BucketShot is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us data, contact us and we will take appropriate steps.",
    ],
  },
  {
    title: "International users",
    paragraphs: [
      "We may process and store information in the United Kingdom, European Economic Area, United States, or other regions where our providers operate. By using BucketShot you understand your information may be transferred to those locations.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the updated version on this page and revise the effective date. Continued use after changes means you accept the updated policy.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Email ${CONTACT_EMAIL} for privacy requests, including access or deletion where applicable.`,
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "Agreement",
    paragraphs: [
      "These Terms of Use (“Terms”) govern your use of BucketShot’s websites, apps, and related services. By creating an account or using BucketShot you agree to these Terms. If you do not agree, do not use the service.",
      `Contact: ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: "The service",
    paragraphs: [
      "BucketShot helps photographers discover places, learn compositions (Bucket Shots), and plan trips. Features may differ between web and iOS. We may change, suspend, or discontinue parts of the service with reasonable notice where practicable.",
    ],
  },
  {
    title: "Accounts",
    paragraphs: [
      "You are responsible for your account credentials and for activity under your account. Provide accurate information and keep your email reachable. We may suspend or terminate accounts that violate these Terms or harm other users or the service.",
    ],
  },
  {
    title: "User content",
    paragraphs: [
      "You retain ownership of content you upload. You grant BucketShot a worldwide, non-exclusive, royalty-free license to host, store, reproduce, display, and distribute that content as needed to operate and promote the service (for example showing public catalog items).",
      "You must have the rights to content you submit and must not upload unlawful, infringing, or harmful material. We may remove content that violates these Terms.",
    ],
  },
  {
    title: "Subscriptions (Plus Monthly and Plus Annual)",
    paragraphs: [
      "BucketShot may offer auto-renewable subscriptions such as Plus Monthly and Plus Annual through Apple’s In-App Purchase on iOS.",
      "Payment is charged to your Apple ID account at confirmation of purchase. Subscriptions renew automatically unless you cancel at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period at the rate shown in the App Store or in the app.",
      "Manage or cancel subscriptions in your Apple ID account settings (Settings → Apple ID → Subscriptions on your device). Deleting the app does not cancel a subscription.",
      "Prices are displayed at the point of purchase in the App Store / app and may vary by region. Refunds are handled by Apple under Apple’s policies, except where applicable law requires otherwise.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "Do not misuse BucketShot, attempt unauthorized access, scrape in a way that harms the service, interfere with other users, or use the service for unlawful purposes. Location information is for personal photography planning; respect land access rules, private property, and local laws.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "Catalog information, weather, light times, and maps are provided for convenience and may be incomplete or inaccurate. You are responsible for your own safety and decisions in the field. The service is provided “as is” to the fullest extent permitted by law.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, BucketShot and its operators are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or goodwill arising from your use of the service. Our aggregate liability for claims relating to the service is limited to the greater of (a) the amounts you paid us for subscriptions in the twelve months before the claim or (b) £50, except where liability cannot be limited by law.",
    ],
  },
  {
    title: "Privacy",
    paragraphs: [
      "Our Privacy Policy explains how we collect and use personal information. It forms part of your agreement with us.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "You may stop using BucketShot at any time. We may suspend or end access if you breach these Terms. Provisions that by their nature should survive (including ownership, licenses already granted, disclaimers, and limitations) will survive termination.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update these Terms by posting a revised version on this page with a new effective date. Continued use after changes means you accept the updated Terms.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      `Questions about these Terms: ${CONTACT_EMAIL}.`,
    ],
  },
];
