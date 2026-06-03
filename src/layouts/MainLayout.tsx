import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 select-none antialiased selection:bg-amber-500 selection:text-stone-900" id="main-layout-wrapper">
      {/* Dynamic Sticky Header */}
      <Navbar />

      {/* Main Viewport Body */}
      <main className="flex-grow overflow-x-hidden">
        <Outlet />
      </main>

      {/* Structured Dark Footer */}
      <Footer />
    </div>
  );
}
