import { Link } from "react-router-dom";
import { Compass, Sparkles, Award, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function About() {
  return (
    <div id="about-page" className="min-h-screen bg-stone-50 pb-20 font-sans">
      <Breadcrumb items={[{ label: "Our Story" }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* EDITORIAL HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-stone-900 text-white rounded-3xl overflow-hidden p-8 sm:p-12 mb-16 shadow-xl relative border border-stone-800">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono block">
              ESTABLISHED IN PARIS, 1996
            </span>
            <h1 className="font-sans font-black text-3.5xl sm:text-5xl text-white tracking-tight leading-none">
              Maison de Sac Luxury Heritage
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif pt-2 pr-4">
              What began as a single workshop block in the historic Marais district has grown into an international boutique for individuals who value functional luggage design, structural leather alignment, and zero-compromise sustainability.
            </p>
            <p className="text-xs text-stone-400 leading-relaxed font-serif">
              We create beautiful bags, durable tech commuters, and minimal secure cardholders built to withstand your daily commutes and adventures while growing a beautiful unique honey colored patina with time.
            </p>
          </div>

          <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden bg-stone-800 shadow-lg h-full min-h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800"
              alt="Artisan sewing leather"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center filter grayscale contrast-[1.1] brightness-[0.7]"
            />
            {/* Embedded glassmorphic caption strip */}
            <div className="absolute bottom-4 left-4 right-4 bg-stone-950/70 backdrop-blur-md p-3 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block font-semibold">
                Authentic vegetable bark tanning techniques
              </span>
            </div>
          </div>
        </section>

        {/* MISSION & VISION BENTO BLOCKS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" id="about-mission">
          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-150 shadow-xxs">
            <div className="p-3 bg-amber-50 text-amber-700 w-fit rounded-2xl border border-amber-100 mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight mb-3">Our Core Mission</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif mb-4">
              Our mission is to establish fashion designs that bridge luxury-class aesthetic with organic utility. We reject fast-fashion models, opting instead to manufacture smaller, curated batch series that prioritize stitch longevity and materials health.
            </p>
            <p className="text-xs text-stone-500 leading-normal font-serif">
              By combining classic French bark tanning rituals with modern RFID shield systems and padded device sleeves, we secure your carry-ons.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-150 shadow-xxs">
            <div className="p-3 bg-amber-50 text-amber-700 w-fit rounded-2xl border border-amber-100 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight mb-3">Our Grand Vision</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif mb-4">
              We envision a fully circular luxury accessory ecosystem where zero tanning water goes polluted and every single scrap leather fiber gets braided into keys or internal pocket support tags to avoid landfills.
            </p>
            <p className="text-xs text-stone-500 leading-normal font-serif">
              Our target is to expand global workspace partnerships, empowering active leaders to carry eco-certified canvas and vegan-touch pieces.
            </p>
          </div>
        </section>

        {/* DETAILED CRAFTSMANSHIP PHASES */}
        <section className="bg-stone-100 p-8 sm:p-12 rounded-3xl border border-stone-200" id="about-crafts">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-10">
            <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono block mb-2">
              AUDITED LIFECYCLES
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3.5xl text-stone-900 tracking-tight">
              Phases Of Material Execution
            </h2>
            <div className="w-10 h-0.5 bg-amber-500 mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="font-mono text-3xl font-black text-stone-300">01 /</span>
              <h3 className="font-sans font-bold text-sm text-stone-900 uppercase tracking-widest">
                Responsible Hide Selection
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-serif">
                We select premium, raw cowhides representing byproduct surpluses of certified agricultural firms. We never source from deforested biome land.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-3xl font-black text-stone-300">02 /</span>
              <h3 className="font-sans font-bold text-sm text-stone-900 uppercase tracking-widest">
                Natural Vegetable Tanning
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-serif">
                Our dye vats incorporate natural vegetable tannins derived from Chestnut, Mimosa, and Quebracho bark extracts—eliminating toxic chromium chemicals entirely.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-3xl font-black text-stone-300">03 /</span>
              <h3 className="font-sans font-bold text-sm text-stone-900 uppercase tracking-widest">
                Curator Batch Distribution
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-serif">
                Once items bypass strict inspections criteria, they are packaged in custom organic canvas bags, preserving maximum leather breathability in transit.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM METADATA CALL TO ACTION */}
        <section className="bg-amber-500 rounded-3xl p-8 sm:p-10 text-center text-stone-950 mt-16 max-w-4xl mx-auto shadow-md border border-amber-450 flex flex-col items-center">
          <h2 className="font-sans font-black text-2xl tracking-tight leading-none mb-3">
            Explore the Capsule Collection
          </h2>
          <p className="text-stone-900 text-xs sm:text-sm font-serif max-w-sm leading-relaxed mb-6">
            Witness our legendary stitch-density and natural patinas in action. Browse available models from our inventory.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-1.5 bg-stone-950 hover:bg-stone-850 text-white font-bold py-3.5 px-8 rounded-xl text-xxs uppercase tracking-widest transition-all"
          >
            Shop the Atelier Catalog
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </Link>
        </section>

      </div>
    </div>
  );
}
