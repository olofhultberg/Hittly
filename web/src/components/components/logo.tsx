export function Logo({ withText = true }: { withText?: boolean }) {
    return (
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600">
          {/* enkel ikon – låda + lupp (emoji fallback) */}
          <span className="text-white text-lg">🔍</span>
        </div>
        {withText && <span className="text-xl font-semibold">GrejFinder</span>}
      </div>
    );
  }