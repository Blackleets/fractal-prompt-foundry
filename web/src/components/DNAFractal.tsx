interface DNAFractalProps {
  isActive: boolean;
  className?: string;
}

const strands = Array.from({ length: 12 }, (_, index) => index);

function DNAFractal({ isActive, className = "" }: DNAFractalProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(108,92,231,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(0,210,255,0.12),transparent_22%),radial-gradient(circle_at_50%_84%,rgba(167,139,250,0.08),transparent_18%)]" />

      <div className="absolute inset-0 opacity-30">
        {strands.map((strand) => (
          <div
            key={strand}
            className={`absolute left-[50%] top-0 h-full w-px origin-center bg-gradient-to-b from-transparent via-[#a78bfa] to-transparent ${
              isActive ? "animate-[pulse_2.5s_ease-in-out_infinite]" : ""
            }`}
            style={{
              transform: `translateX(${(strand - 6) * 42}px) rotate(${strand % 2 === 0 ? 10 : -10}deg)`,
              opacity: 0.15 + strand * 0.025,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {strands.map((strand) => (
          <span
            key={`particle-${strand}`}
            className={`absolute rounded-full bg-[#a78bfa]/60 blur-[1px] ${
              isActive ? "animate-[floatParticle_7s_linear_infinite]" : ""
            }`}
            style={{
              left: `${12 + strand * 7}%`,
              top: `${(strand * 9) % 80}%`,
              width: `${6 + (strand % 4) * 3}px`,
              height: `${6 + (strand % 4) * 3}px`,
              animationDelay: `${strand * 0.35}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a78bfa]/30 bg-[#1a1535]/40 shadow-[0_0_120px_rgba(108,92,231,0.12)]">
        <div
          className={`absolute inset-6 rounded-full border border-[#6c5ce7]/30 ${isActive ? "animate-spin" : ""}`}
          style={{ animationDuration: "16s" }}
        />
        <div className={`absolute inset-0 rounded-full border border-[#a78bfa]/12 ${isActive ? "animate-pulse" : ""}`} />
      </div>
    </div>
  );
}

export default DNAFractal;
