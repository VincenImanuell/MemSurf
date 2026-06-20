export function Logo({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="MemSurf logo"
      width={size}
      height={size}
      className="rounded-xl object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
