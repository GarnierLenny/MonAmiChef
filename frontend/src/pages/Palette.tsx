export default function Palette() {
  type Swatch = { shade: number; className: string };

  const palettes: { name: string; items: Swatch[] }[] = [
    {
      name: "Primary Orange",
      items: [
        { shade: 50, className: "bg-primary-50" },
        { shade: 100, className: "bg-primary-100" },
        { shade: 200, className: "bg-primary-200" },
        { shade: 300, className: "bg-primary-300" },
        { shade: 400, className: "bg-primary-400" },
        { shade: 500, className: "bg-primary-500" },
        { shade: 600, className: "bg-primary-600" },
        { shade: 700, className: "bg-primary-700" },
        { shade: 800, className: "bg-primary-800" },
        { shade: 900, className: "bg-primary-900" },
      ],
    },
    {
      name: "Neutral (Orange-tinted)",
      items: [
        { shade: 50, className: "bg-neutral-50" },
        { shade: 100, className: "bg-neutral-100" },
        { shade: 200, className: "bg-neutral-200" },
        { shade: 300, className: "bg-neutral-300" },
        { shade: 400, className: "bg-neutral-400" },
        { shade: 500, className: "bg-neutral-500" },
        { shade: 600, className: "bg-neutral-600" },
        { shade: 700, className: "bg-neutral-700" },
        { shade: 800, className: "bg-neutral-800" },
        { shade: 900, className: "bg-neutral-900" },
      ],
    },
    {
      name: "Success (Warm Green)",
      items: [
        { shade: 50, className: "bg-success-50" },
        { shade: 100, className: "bg-success-100" },
        { shade: 200, className: "bg-success-200" },
        { shade: 300, className: "bg-success-300" },
        { shade: 400, className: "bg-success-400" },
        { shade: 500, className: "bg-success-500" },
        { shade: 600, className: "bg-success-600" },
        { shade: 700, className: "bg-success-700" },
        { shade: 800, className: "bg-success-800" },
        { shade: 900, className: "bg-success-900" },
      ],
    },
    {
      name: "Danger (Red)",
      items: [
        { shade: 50, className: "bg-danger-50" },
        { shade: 100, className: "bg-danger-100" },
        { shade: 200, className: "bg-danger-200" },
        { shade: 300, className: "bg-danger-300" },
        { shade: 400, className: "bg-danger-400" },
        { shade: 500, className: "bg-danger-500" },
        { shade: 600, className: "bg-danger-600" },
        { shade: 700, className: "bg-danger-700" },
        { shade: 800, className: "bg-danger-800" },
        { shade: 900, className: "bg-danger-900" },
      ],
    },
    {
      name: "Warning (Amber)",
      items: [
        { shade: 50, className: "bg-warning-50" },
        { shade: 100, className: "bg-warning-100" },
        { shade: 200, className: "bg-warning-200" },
        { shade: 300, className: "bg-warning-300" },
        { shade: 400, className: "bg-warning-400" },
        { shade: 500, className: "bg-warning-500" },
        { shade: 600, className: "bg-warning-600" },
        { shade: 700, className: "bg-warning-700" },
        { shade: 800, className: "bg-warning-800" },
        { shade: 900, className: "bg-warning-900" },
      ],
    },
    {
      name: "Info (Cobalt)",
      items: [
        { shade: 50, className: "bg-info-50" },
        { shade: 100, className: "bg-info-100" },
        { shade: 200, className: "bg-info-200" },
        { shade: 300, className: "bg-info-300" },
        { shade: 400, className: "bg-info-400" },
        { shade: 500, className: "bg-info-500" },
        { shade: 600, className: "bg-info-600" },
        { shade: 700, className: "bg-info-700" },
        { shade: 800, className: "bg-info-800" },
        { shade: 900, className: "bg-info-900" },
      ],
    },
  ];

  return (
    <div className="flex gap-8 p-8 pb-20">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Color Palettes</h1>

        {palettes.map((palette) => (
          <div key={palette.name} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{palette.name}</h2>
            <div className="flex gap-2 flex-wrap">
              {palette.items.map(({ shade, className }) => (
                <div key={shade} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-24 h-24 rounded-lg shadow-md ${className}`}
                  />
                  <p className="font-semibold text-sm text-center">{shade}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-64 sticky ml-24 top-8 self-start">
        <h2 className="text-xl font-bold mb-4">Overview</h2>
        <div className="flex space-y-0.5">
          {palettes.map((palette) => (
            <div key={palette.name}>
              <div className="flex flex-col gap-0.5">
                {palette.items.map(({ shade, className }) => (
                  <div key={shade} className={`w-18 h-18 ${className}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
