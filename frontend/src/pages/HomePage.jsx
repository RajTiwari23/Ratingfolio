import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LandingSection, FeatureSection, UpdateSection } from '../components/home';


export function HomePage() {
  return (
    <div className="space-y-2">
      <Header />
      <LandingSection />
      <FeatureSection />
      <UpdateSection />
      <Footer />
    </div>
  );
}
