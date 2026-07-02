import { cn } from "@/lib/cn";

// Consistent page gutter + max measure for the inner content area.
export function PageContainer({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 py-7 sm:px-8 sm:py-10",
        wide ? "max-w-[1180px]" : "max-w-[1040px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
