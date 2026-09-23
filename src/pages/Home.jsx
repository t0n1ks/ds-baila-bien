import About from '../components/About.jsx';
import Classes from '../components/Classes.jsx';
import Gallery from '../components/Gallery.jsx';
import Hero from '../components/Hero.jsx';
import InstagramBlock from '../components/InstagramBlock.jsx';
import Marquee from '../components/Marquee.jsx';
import Prices from '../components/Prices.jsx';
import TrialForm from '../components/TrialForm.jsx';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Marquee />
      <About />
      <Classes />
      <Prices />
      <Gallery />
      <InstagramBlock />
      <TrialForm />
    </main>
  );
}
