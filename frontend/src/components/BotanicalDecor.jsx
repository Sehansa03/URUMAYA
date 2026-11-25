
import { useId } from "react";

export default function BotanicalDecor({
  className = "",
  outline = false,
}) {
  const id = useId().replace(/:/g, "");
  const gradient = `${id}-leaf`;
  const shadow = `${id}-shadow`;
  const leaf = `${id}-shape`;

  return (
    <svg
      className={`uh-botanical ${className}`}
      viewBox="0 0 360 440"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradient}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#b9bf79" />
          <stop offset="45%" stopColor="#7f8c45" />
          <stop offset="100%" stopColor="#354b25" />
        </linearGradient>

        <filter id={shadow}>
          <feGaussianBlur stdDeviation="1.8" />
        </filter>

        <g id={leaf}>
          <path
            d="M0 0
               C-20 -37 -64 -66 -108 -49
               C-87 -6 -43 13 0 0Z"
            fill={outline ? "none" : `url(#${gradient})`}
            stroke={outline ? "#bca16a" : "#7d8a49"}
            strokeWidth={outline ? "1.3" : "0.6"}
          />

          <path
            d="M0 0 Q-48 -28 -101 -46"
            stroke={outline ? "#bca16a" : "#d3d4a0"}
            strokeWidth="1"
            opacity="0.8"
          />

          <path
            d="M-28 -14 L-39 -39
               M-48 -25 L-65 -48
               M-48 -25 L-76 -17
               M-70 -35 L-88 -28"
            stroke={outline ? "#bca16a" : "#c4c88a"}
            strokeWidth="0.8"
            opacity="0.65"
          />
        </g>
      </defs>

      {!outline && (
        <path
          d="M32 -20 Q115 120 206 250 T335 440"
          stroke="#52613b"
          strokeWidth="12"
          opacity=".12"
          filter={`url(#${shadow})`}
          transform="translate(10 12)"
        />
      )}

      <path
        d="M32 -20
           Q90 95 154 177
           T265 337
           Q302 385 335 440"
        stroke={outline ? "#bca16a" : "#657344"}
        strokeWidth={outline ? "1.5" : "3"}
        strokeLinecap="round"
      />

      {[
        [65, 47, 20, 1.1],
        [98, 100, -12, 1.15],
        [132, 148, 15, 1],
        [165, 195, -10, 1.1],
        [198, 245, 12, 0.95],
        [231, 294, -8, 0.85],
        [267, 343, 12, 0.75],
      ].map(([x, y, angle, scale], index) => (
        <g key={index}>
          <use
            href={`#${leaf}`}
            transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
          />

          <use
            href={`#${leaf}`}
            transform={`translate(${x} ${y}) rotate(${angle - 40}) scale(${-scale} ${scale})`}
          />
        </g>
      ))}

      <use
        href={`#${leaf}`}
        transform="translate(320 420) rotate(60) scale(.65)"
      />
    </svg>
  );
}
