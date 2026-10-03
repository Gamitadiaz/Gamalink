import Image from "next/image";

export function LandingImageGallery({ images }: { images: string[] }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Galería de imágenes del negocio"
      className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-3"
    >
      {images.map((src) => (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg" key={src}>
          <Image
            alt="Imagen del negocio"
            className="object-cover"
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            src={src}
            unoptimized
          />
        </div>
      ))}
    </section>
  );
}
