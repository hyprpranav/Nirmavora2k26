import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import Designathon from '../components/landing/Designathon';
import Hackathon from '../components/landing/Hackathon';
import Timeline from '../components/landing/Timeline';
import Fees from '../components/landing/Fees';
import HowToReach from '../components/landing/HowToReach';
import Contact from '../components/landing/Contact';

export default function Landing() {
  return (
    <>
      <Hero />
      <About />
      <Designathon />
      <Hackathon />
      <Timeline />
      <Fees />
      <HowToReach />
      <Contact />
    </>
  );
}
