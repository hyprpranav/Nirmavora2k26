import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
