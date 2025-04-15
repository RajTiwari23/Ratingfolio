import { useEffect, useState } from "react"

export default function PixelArtDashboard() {
  const [frame, setFrame] = useState(0)
  const [barHeights, setBarHeights] = useState([3, 5, 2, 7, 4, 6, 3, 5])
  const [stars, setStars] = useState([0, 0, 0, 0, 0])
  const [metrics, setMetrics] = useState([65, 42, 87])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 60)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (frame % 10 === 0) {
      setBarHeights((prev) =>
        prev.map((height) => Math.max(1, Math.min(8, height + Math.floor(Math.random() * 3) - 1))),
      )
    }

    if (frame % 15 === 0) {
      const newStars = [...stars]
      const randomIndex = Math.floor(Math.random() * 5)
      newStars[randomIndex] = (newStars[randomIndex] + 1) % 2
      setStars(newStars)
    }

    if (frame % 20 === 0) {
      setMetrics((prev) =>
        prev.map((metric) => Math.max(30, Math.min(99, metric + Math.floor(Math.random() * 11) - 5))),
      )
    }
  }, [frame, stars])

  if (!loaded) {
    return <div className="h-full w-full bg-[#f5f3ff] rounded-lg"></div>
  }

  return (
    <div className="relative h-full w-2/5 bg-[#4c1d95] rounded-lg p-4 overflow-hidden shadow-2xl border-4 border-[#6d28d9]">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      ></div>

      {/* Dashboard header */}
      <div className="relative z-10 mb-6 border-b-4 border-[#6d28d9] pb-2">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-xl tracking-wider pixel-font">RATINGFOLIO</div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-[#a78bfa]"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#5b21b6] p-3 rounded-lg border-2 border-[#6d28d9]">
          <div className="text-[#c4b5fd] text-xs mb-2 font-bold">PERFORMANCE</div>
          <div className="h-32 flex items-end justify-between">
            {barHeights.map((height, i) => (
              <div
                key={i}
                className="w-4 bg-[#a78bfa] transition-all duration-500"
                style={{ height: `${height * 12.5}%` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="bg-[#5b21b6] p-3 rounded-lg border-2 border-[#6d28d9]">
          <div className="text-[#c4b5fd] text-xs mb-2 font-bold">RATINGS</div>
          <div className="flex flex-col space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex space-x-1">
                {stars.map((filled, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 ${
                      i < 3 || (row === 2 && i < 4) || (row === 3 && i < 5) ? "bg-[#facc15]" : "bg-[#7c3aed]"
                    } transition-colors duration-300`}
                    style={{
                      clipPath:
                        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-[#5b21b6] p-3 rounded-lg border-2 border-[#6d28d9]">
          <div className="text-[#c4b5fd] text-xs mb-2 font-bold">METRICS</div>
          <div className="grid grid-cols-3 gap-2">
            {metrics.map((value, i) => (
              <div key={i} className="bg-[#6d28d9] p-2 rounded text-center">
                <div className="text-white text-xl font-bold">{value}%</div>
                <div className="text-[#c4b5fd] text-xs">
                  {i === 0 ? "ACCURACY" : i === 1 ? "COMPLETION" : "RATING"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated pixels in background */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-[#8b5cf6] opacity-30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s infinite ease-in-out ${Math.random() * 2}s`,
          }}
        ></div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        .pixel-font {
          font-family: monospace;
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  )
}
