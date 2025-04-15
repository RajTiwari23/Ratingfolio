export function FeatureSection(){
    return (
        <div className="bg-slate-50 min-h-[60vh] w-full flex flex-col items-center py-20 px-6 sm:px-10 rounded space-y-10">
  <h2 className="font-plex text-4xl font-semibold text-center">Features</h2>

  <div className="flex flex-wrap justify-center gap-6">
    {[
      {
        title: "Rating",
        description: "Access your ratings from multiple platforms all in one place.",
      },
      {
        title: "Submissions",
        description: "Track all your problem submissions across platforms effortlessly.",
      },
      {
        title: "Accuracy",
        description: "View your overall coding accuracy across various platforms.",
      },
    ].map((feature, idx) => (
      <div
        key={idx}
        className="flex flex-col max-w-xs w-full p-8 rounded-xl bg-white transition-shadow border border-slate-100 shadow hover:shadow-lg gap-4"
      >
        <h3 className="text-2xl font-plex font-medium">{feature.title}</h3>
        <p className="text-sm text-gray-600">{feature.description}</p>
      </div>
    ))}
  </div>
</div>

    )
}