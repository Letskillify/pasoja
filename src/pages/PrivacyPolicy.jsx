import React from 'react';
import PageHeader from '../components/Home/PageHeader';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-zinc-900">
      <PageHeader
        title="Privacy Policy"
        subtitle="Your privacy is paramount. Learn how we safeguard your personal information."
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Privacy Policy' }]}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20 space-y-12">
        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-xl font-light uppercase tracking-widest text-[#b8860b]">
            1. Commitment To Privacy
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            PASOJA ("we", "our", "us") respects your personal privacy and is committed to protecting the confidential data you share with us. This Privacy Policy details how we collect, store, utilize, and protect your personal information when you visit or make a purchase from our store.
          </p>
        </section>

        {/* Information Collected */}
        <section className="space-y-4 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-light uppercase tracking-widest text-[#b8860b]">
            2. Information We Collect
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            When you interact with our platform, we collect information necessary to fulfill your orders and enhance your atelier experience:
          </p>
          <ul className="list-disc list-inside text-xs md:text-sm text-zinc-600 space-y-2 pl-2">
            <li><strong className="text-zinc-900">Account Data:</strong> Name, email address, phone number, and delivery addresses provided upon registration or checkout.</li>
            <li><strong className="text-zinc-900">Payment Details:</strong> Encrypted payment transaction IDs (card and banking information is processed directly by secured gateways like Razorpay and is never stored on our servers).</li>
            <li><strong className="text-zinc-900">Device & Usage Data:</strong> IP address, browser type, device information, and interaction logs collected automatically via secure cookies.</li>
          </ul>
        </section>

        {/* How We Use Your Data */}
        <section className="space-y-4 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-light uppercase tracking-widest text-[#b8860b]">
            3. How We Use Your Information
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            We strictly utilize your data for essential operational and service purposes:
          </p>
          <ul className="list-disc list-inside text-xs md:text-sm text-zinc-600 space-y-2 pl-2">
            <li>Processing, fulfilling, and shipping your apparel orders.</li>
            <li>Sending real-time shipment tracking status and invoice documentation.</li>
            <li>Responding to customer support requests and providing personal styling recommendations.</li>
            <li>Maintaining platform security and preventing fraudulent transactions.</li>
          </ul>
        </section>

        {/* Data Protection & Sharing */}
        <section className="space-y-4 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-light uppercase tracking-widest text-[#b8860b]">
            4. Data Security & Third-Party Sharing
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties. We share data only with trusted service partners essential to operating our business (such as logistics carriers and payment gateways), strictly under confidentiality agreements.
          </p>
        </section>

        {/* Your Rights */}
        <section className="space-y-4 border-t border-zinc-200 pt-8">
          <h2 className="text-xl font-light uppercase tracking-widest text-[#b8860b]">
            5. Your Rights & Contact Information
          </h2>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            You have the right to access, update, or request deletion of your personal account information at any time from your Account Dashboard. If you have questions regarding this Privacy Policy, please email us at <span className="text-zinc-900 font-bold">privacy@pasoja.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
