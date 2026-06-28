import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] min-h-[560px] overflow-hidden" aria-label="Hero banner">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600"
        alt="BormonShop BD New Collection 2026"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark gradient overlay so text stays legible over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-accent uppercase tracking-[0.2em] text-sm font-medium mb-4 animate-fade-up">
          BormonShop BD
        </p>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-ink leading-tight max-w-3xl animate-fade-up">
          New Collection <span className="text-accent">2026</span>
        </h1>
        <p className="text-muted text-base md:text-lg mt-5 max-w-xl animate-fade-up">
          Premium fits, engineered fabrics, built for the streets of Dhaka and beyond.
        </p>

        <Link href="/shop" className="btn-gold mt-8 text-base inline-block animate-fade-up">
          Shop Now
        </Link>
      </div>
    </section>
  );
}
