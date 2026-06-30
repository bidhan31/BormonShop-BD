import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full h-[90vh] min-h-[560px] overflow-hidden" aria-label="Hero banner">
      {/* Background image */}
      <Image
        src="/hero-bg.png"
        alt="BormonShop BD New Collection 2026"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark gradient overlay so text stays legible over any photo */}
      <div className="">
        <div className="absolute inset-0 bg-gradient-to-t from-#000000 via-#0F0F0F/60 to-#000000/20" />

        <div className="relative pt-16 h-full flex flex-col items-center justify-center text-center px-6 ">
          <p className=" uppercase tracking-[0.3em]  font-bold mb-4 text-3xl animate-fade-up flex">
            <strong className=" text-accent mr-5" >BormonShop </strong> BD
          </p>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-ink leading-tight max-w-3xl animate-fade-up">
            New Collection <span className="text-accent">2026</span>
          </h1>
          <p className="text-muted text-base md:text-lg mt-5 max-w-xl animate-fade-up">
            Premium fits, engineered fabrics, built for the streets of Dhaka and beyond.
          </p>
      </div>
      <div className="relative pt-32 flex justify-center mt-8 animate-fade-up">
          <Link href="/shop" className=" btn-gold mt-8 text-base inline-block animate-fade-up">
            Shop Now
          </Link>
      </div>
      </div>
    </section>
  );
}
