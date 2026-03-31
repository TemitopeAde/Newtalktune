import React from "react";
import Link from "next/link";

const lastUpdated = "March 2025";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `Talktune ("we", "us", "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at www.talktune.co ("the Service").

Please read this policy carefully. If you disagree with any part of it, please discontinue use of the Service. For questions or concerns, contact us at legal@talktune.co.`,
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    content: `We collect the following categories of information:

Account Information
• Name and email address provided during registration.
• Password (stored in encrypted form).
• Phone number and country code (optional).

Usage Information
• Scripts and text content you submit to the Service.
• Voice model selections and audio settings.
• Generated audio files and associated metadata.
• Subscription plan details and billing cycle.

Technical Information
• IP address and device information.
• Browser type and operating system.
• Pages visited, features used, and time spent on the platform.
• Cookies and similar tracking technologies (see Section 7).

Payment Information
• Payment transactions are processed by Flutterwave. We do not store your full card details. We receive confirmation of successful payments and the associated plan and billing cycle.`,
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: `We use the information we collect to:

• Create and manage your account.
• Provide, operate, and improve the Service.
• Process payments and manage your subscription.
• Generate voiceovers using AI voice models (via ElevenLabs and YarnGPT).
• Send transactional emails such as payment confirmations and usage reminders.
• Enforce our Terms and Conditions and prevent misuse.
• Comply with applicable legal obligations.
• Respond to your enquiries and support requests.

We do not sell your personal data to third parties.`,
  },
  {
    id: "third-parties",
    title: "4. Third-Party Services",
    content: `To provide the Service, we work with the following third-party providers:

Flutterwave (Payment Processing)
Your payment details are submitted directly to Flutterwave and governed by their privacy policy. We receive only the outcome of transactions and relevant metadata (plan, billing cycle, transaction reference). Flutterwave is PCI DSS compliant.
Learn more: https://flutterwave.com/us/privacy-policy

ElevenLabs / YarnGPT (AI Audio Generation)
Your script content is transmitted to ElevenLabs and/or YarnGPT to generate audio. These providers process your content solely for the purpose of generating audio output. We recommend reviewing their privacy policies for details on how they handle submitted text.
ElevenLabs: https://elevenlabs.io/privacy
YarnGPT: Please refer to their documentation for their data handling practices.

These providers are contractually obligated to handle your data in accordance with applicable privacy laws.`,
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide the Service.

• Account data is retained until you delete your account.
• Generated audio files and scripts are retained to allow you to access past projects.
• Payment records are retained as required by Nigerian financial regulations and for dispute resolution.

Upon account deletion, we will delete or anonymise your personal data within 30 days, except where retention is required by law.

To request deletion of your account and data, contact legal@talktune.co.`,
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: `We implement industry-standard technical and organisational measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction. These include:

• Encrypted passwords using secure hashing algorithms.
• HTTPS encryption for all data transmitted between your browser and our servers.
• Access controls limiting who can access personal data within our team.
• Secure infrastructure hosted on trusted cloud providers.

No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: `We use cookies and similar technologies to maintain your session, remember your preferences, and understand how the Service is used.

Types of cookies we use:

• Essential cookies: Required for the Service to function (e.g. authentication tokens, session management). These cannot be disabled.
• Analytics cookies: Help us understand usage patterns and improve the Service.

You can control cookies through your browser settings. Disabling essential cookies may affect your ability to use the Service.`,
  },
  {
    id: "your-rights",
    title: "8. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you.
• Correction: Request correction of inaccurate or incomplete data.
• Deletion: Request deletion of your personal data, subject to legal retention requirements.
• Objection: Object to certain uses of your data.
• Portability: Request your data in a structured, machine-readable format.

To exercise any of these rights, contact us at legal@talktune.co. We will respond within 30 days.`,
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    content: `The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us at legal@talktune.co and we will promptly delete the information.`,
  },
  {
    id: "transfers",
    title: "10. International Data Transfers",
    content: `Talktune is operated from Nigeria. By using the Service, you acknowledge that your data may be transferred to and processed by servers located outside your country of residence, including countries where data protection laws may differ from those in your jurisdiction.

Where such transfers occur, we take appropriate steps to ensure your data is protected in accordance with this Privacy Policy.`,
  },
  {
    id: "changes",
    title: "11. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by updating the "Last Updated" date at the top of this page.

We encourage you to review this policy periodically. Your continued use of the Service after any changes constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: `If you have any questions, concerns, or requests relating to this Privacy Policy or how we handle your data, please contact us at:

Email: legal@talktune.co
Website: https://www.talktune.co`,
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background -mt-16 text-white">
      {/* Hero */}
      <div className="relative pt-[160px] pb-20 px-6 md:px-[100px] overflow-hidden">
        <div className="w-1/2 h-[300px] bg-[#A8EF4370] rounded-full absolute -top-5 left-1/2 -translate-x-1/2 blur-[200px] z-10" />
        <div className="max-w-4xl mx-auto">
          <p className="uppercase text-[#8cbe41] font-semibold text-sm tracking-widest mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            We take your privacy seriously. This policy explains what data we
            collect, how we use it, and the choices you have.
          </p>
          <p className="text-white/40 text-sm mt-6">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-[100px] pb-24">
        {/* Table of contents */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-white font-semibold text-lg mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-white/60 hover:text-[#8cbe41] transition-colors text-sm"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-b border-white/10 pb-12 last:border-0"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <div className="text-white/70 text-base leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 bg-[#8cbe4115] border border-[#8cbe4130] rounded-2xl p-6 md:p-8">
          <p className="text-white/70 text-sm leading-relaxed">
            This Privacy Policy is provided for informational purposes. For
            legal advice specific to your situation, consult a qualified
            professional. You can also review our{" "}
            <Link
              href="/terms-and-conditions"
              className="text-[#8cbe41] hover:underline"
            >
              Terms and Conditions
            </Link>{" "}
            for the rules governing your use of the Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
