import { Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import AdminPage from "@/pages/AdminPage"
import ThanksPage from "@/pages/ThanksPage"
import PricingPage from "@/pages/PricingPage"
import AboutPage from "@/pages/AboutPage"
import PrivacyPage from "@/pages/PrivacyPage"
import TermsPage from "@/pages/TermsPage"
import DisclaimerPage from "@/pages/DisclaimerPage"
import Layout from "@/layout/Layout"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/thanks" element={<ThanksPage />} />

        {/* Legal Pages */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
      </Route>
    </Routes>
  )
}

export default App


