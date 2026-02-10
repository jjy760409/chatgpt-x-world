import { Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import AdminPage from "@/pages/AdminPage"
import ThanksPage from "@/pages/ThanksPage"
import PricingPage from "@/pages/PricingPage"
import AboutPage from "@/pages/AboutPage"
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
      </Route>
    </Routes>
  )
}

export default App


