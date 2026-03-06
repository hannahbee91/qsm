export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
        <h1 className="mb-4 text-center">Privacy Policy</h1>
        
        <p className="mb-4">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}. We are committed to protecting your personal information and your right to privacy.
        </p>
        
        <h2 className="mt-4 mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and Services, when you participate in activities on the app or otherwise when you contact us. This includes your name, email, age, pronouns, and contact information you provided.
        </p>

        <h2 className="mt-4 mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">
          We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use your contact info to facilitate connections with your matches from events.
        </p>

        <h2 className="mt-4 mb-2">3. Will Your Information Be Shared?</h2>
        <p className="mb-4">
          We only share and disclose your information with the express purpose of facilitating your event connections in the event of a mutual match.
        </p>

        <h2 className="mt-4 mb-2">4. Contact Us</h2>
        <p className="mb-4">
          If you have questions or comments about this notice, you may contact us using the Support page.
        </p>
      </div>
    </div>
  );
}
