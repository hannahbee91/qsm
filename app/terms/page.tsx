export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '2rem' }}>
        <h1 className="mb-4 text-center">Terms and Conditions</h1>
        
        <p className="mb-4">
          These Terms and Conditions constitute a legally binding agreement made between you and {process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}, concerning your access to and use of this service.
        </p>
        
        <h2 className="mt-4 mb-2">1. Age Requirement</h2>
        <p className="mb-4" style={{ fontWeight: 'bold' }}>
          By using our services, you represent and warrant that you are at least 18 years of age. If you are under 18 years of age, you are strictly prohibited from registering for or participating in any events on this platform.
        </p>

        <h2 className="mt-4 mb-2">2. User Accounts</h2>
        <p className="mb-4">
          When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>

        <h2 className="mt-4 mb-2">3. Event Participation and Conduct</h2>
        <p className="mb-4">
          By registering for an event, you agree to conduct yourself in a respectful and appropriate manner. We reserve the right to suspend or ban users who violate community guidelines or make others feel unsafe.
        </p>

        <h2 className="mt-4 mb-2">4. Disclaimer</h2>
        <p className="mb-4">
          We make no guarantees regarding matches or connections. All interactions with other users, both on the platform and in person, are at your own risk.
        </p>
      </div>
    </div>
  );
}
