import React from "react";
import Link from "next/link";

const lastUpdated = "March 2025";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using Talktune ("the Service", "Platform", "we", "us", or "our"), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By creating an account or using any part of the Platform, you represent that you are at least 18 years of age and have the legal capacity to enter into a binding agreement.`,
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `Talktune is an AI-powered voiceover platform that enables users to convert text scripts into high-quality audio using a variety of voice models. The Service includes features such as script uploading, voice model selection, language selection, audio generation, and audio export.

Access to certain features of the Service is subject to a paid subscription plan. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.`,
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: `To access the Service, you must register for an account. You agree to:

• Provide accurate, current, and complete information during registration.
• Maintain and promptly update your account information.
• Keep your password secure and confidential.
• Accept responsibility for all activities that occur under your account.
• Notify us immediately at legal@talktune.co if you suspect unauthorised use of your account.

We reserve the right to suspend or terminate accounts that violate these Terms or are found to be engaging in fraudulent activity.`,
  },
  {
    id: "subscriptions",
    title: "4. Subscriptions and Billing",
    content: `Talktune offers the following subscription plans:

• Free Plan: Limited to 150 characters per voiceover and 300 characters per month.
• Creator Plan ($10/month or $100/year): Up to 1,500 characters per voiceover and 174,000 characters per month.
• Pro Plan ($17/month or $170/year): Up to 5,000 characters per voiceover with unlimited monthly usage.

Payments are processed securely through Flutterwave. By subscribing to a paid plan, you authorise Talktune to charge your selected payment method at the applicable rate.

Yearly subscriptions are billed as a single payment covering 12 months of access at the price of 10 months (2 months free). Subscriptions automatically provide access until the end of the paid period.

You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for unused portions of a billing period unless required by applicable law.`,
  },
  {
    id: "content",
    title: "5. User Content",
    content: `You retain ownership of all scripts, text, and other content you submit to the Service ("User Content"). By submitting User Content, you grant Talktune a limited, non-exclusive, royalty-free licence to process and store your content solely for the purpose of providing the Service.

You are solely responsible for your User Content. You agree not to submit content that:

• Infringes any third-party intellectual property rights.
• Is unlawful, defamatory, obscene, or harmful.
• Contains malware, viruses, or other malicious code.
• Violates any applicable laws or regulations in Nigeria or internationally.

We reserve the right to remove any User Content that violates these Terms.`,
  },
  {
    id: "ip",
    title: "6. Intellectual Property",
    content: `All rights, title, and interest in and to the Service — including its design, code, voice models, branding, and underlying technology — are and remain the exclusive property of Talktune and its licensors.

Audio files generated using our voice models are licensed to you for personal or commercial use, subject to the terms of your active subscription plan. You may not reverse-engineer, decompile, or attempt to extract the underlying voice model technology.

The Talktune name, logo, and all related marks are trademarks of Talktune. You may not use our trademarks without our prior written consent.`,
  },
  {
    id: "prohibited",
    title: "7. Prohibited Uses",
    content: `You agree not to use the Service to:

• Generate content that is fraudulent, deceptive, or misleading.
• Impersonate any person or entity, or falsely represent an affiliation.
• Create deepfakes or non-consensual synthetic media of real individuals.
• Violate any applicable law or regulation.
• Attempt to gain unauthorised access to any part of the Service or its infrastructure.
• Resell, sublicense, or redistribute the Service or generated audio without permission.
• Use automated tools, bots, or scrapers to access the Service beyond what is permitted.

Violation of these prohibitions may result in immediate termination of your account.`,
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers and Limitation of Liability",
    content: `The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

To the maximum extent permitted by applicable law, Talktune shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Service.

Our total liability to you for any claims arising under these Terms shall not exceed the amount paid by you to Talktune in the three (3) months preceding the claim.`,
  },
  {
    id: "termination",
    title: "9. Termination",
    content: `We may suspend or terminate your access to the Service at any time, with or without cause or notice, including if we believe you have violated these Terms.

Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination — including intellectual property, disclaimers, and limitation of liability — shall survive.

You may terminate your account at any time by contacting us at legal@talktune.co.`,
  },
  {
    id: "governing",
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    content: `We reserve the right to update or modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page with a revised "Last Updated" date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.

We encourage you to review these Terms periodically.`,
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: `If you have any questions, concerns, or requests regarding these Terms, please contact us at:

Email: legal@talktune.co
Website: https://www.talktune.co`,
  },
];

const TermsPage = () => {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Please read these terms carefully before using Talktune. They govern
            your access to and use of our platform.
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
            These Terms and Conditions are provided for informational purposes
            and do not constitute legal advice. We recommend consulting a
            qualified legal professional if you have specific concerns. You can
            also review our{" "}
            <Link
              href="/privacy-policy"
              className="text-[#8cbe41] hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            for information on how we handle your data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
