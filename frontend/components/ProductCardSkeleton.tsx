export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-secondary border border-border overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="h-4 w-1/4 skeleton rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
