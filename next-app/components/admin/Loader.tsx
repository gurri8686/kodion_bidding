'use client';

// Thin spinning ring. Colors are set inline (literal hex) so they don't depend
// on Tailwind generating orange utility classes.
export const Loader = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div
      role="status"
      aria-label="Loading"
      className="animate-spin rounded-full"
      style={{
        width: 48,
        height: 48,
        border: "4px solid #FFE0CC",
        borderTopColor: "#FF6D00",
      }}
    />
  </div>
);
