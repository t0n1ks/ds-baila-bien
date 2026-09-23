import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import Datenschutz from './pages/Datenschutz.jsx';
import Home from './pages/Home.jsx';
import Impressum from './pages/Impressum.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {/* HashRouter: GitHub Pages has no server rewrites, so /impressum
            would 404 on a direct hit. Swap for BrowserRouter on Vercel. */}
        <HashRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
          <ScrollToTop />
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
