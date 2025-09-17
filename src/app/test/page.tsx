import React from 'react';

interface SubpageProps {
  city?: string;
  domain?: string;
}

export default function HamburgSubpage({
  city = "Hamburg",
  domain = "https://dinext.de"
}: SubpageProps) {
  return (
    <>
      
    <header>
        <h1>IT-Dienstleistungen in Hamburg von DINEXT</h1>
    </header>
    <main>
        <section>
            <h2>Über DINEXT in Hamburg</h2>
            <p>Willkommen bei DINEXT – Ihrem vertrauenswürdigen Partner für erstklassige IT-Dienstleistungen in Hamburg. Unsere langjährige Erfahrung in der IT-Branche ermöglicht es uns, innovative und maßgeschneiderte Lösungen anzubieten, die genau auf die Bedürfnisse Ihres Unternehmens abgestimmt sind.</p>
        </section>
        <section>
            <h2>Unsere Dienstleistungen</h2>
            <p>In Hamburg bieten wir eine Vielzahl von IT-Dienstleistungen an, darunter:</p>
            <ul>
                <li>IT-Beratung und Strategieentwicklung</li>
                <li>Systemintegration und Softwareentwicklung</li>
                <li>Cloud-Lösungen und IT-Support</li>
                <li>Sicherheitslösungen zur Risikominderung</li>
            </ul>
            <p>Unsere Experten in Hamburg sind stets auf dem neuesten Stand der Technik und helfen Ihnen dabei, Ihre IT-Infrastruktur zu optimieren und Ihr Unternehmen digital zukunftssicher zu machen.</p>
        </section>
        <section>
            <h2>Warum Hamburg?</h2>
            <p>Die dynamische Geschäftswelt in Hamburg erfordert innovative IT-Lösungen. Als internationaler Handelsstandort bietet Hamburg einzigartige Möglichkeiten, die wir umfassend nutzen. DINEXT ist fest in der Hamburger Gemeinschaft verwurzelt und wir verstehen die spezifischen Anforderungen, die Unternehmen in dieser Region haben. </p>
        </section>
        <section>
            <h2>Kontaktieren Sie uns</h2>
            <p>Wenn Sie in Hamburg nach qualifizierten IT-Dienstleistungen suchen, zögern Sie nicht, uns zu kontaktieren. Unser Team bei DINEXT steht Ihnen jederzeit zur Verfügung, um Ihre Fragen zu beantworten und Sie bei Ihren IT-Herausforderungen zu unterstützen.</p>
            <p>Rufen Sie uns an unter <strong>+49 40 123456</strong> oder senden Sie uns eine E-Mail an <strong>info@dinext.de</strong>. Lassen Sie uns gemeinsam die digitale Zukunft Ihres Unternehmens gestalten.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2023 DINEXT. Alle Rechte vorbehalten.</p>
    </footer>

    </>
  );
}

// Export metadata for Next.js
export const metadata = {
  title: "IT-Dienstleistungen in Hamburg - DINEXT",
  description: "DINEXT bietet maßgeschneiderte IT-Lösungen für Unternehmen in Hamburg. Erfahren Sie mehr über unsere Dienstleistungen."
};  