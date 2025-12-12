export default function FunnelIcon({
  color = "--white",
  size = 7,
  filled = false,
}) {
  return (
    <svg
      width={size}
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.75 0.75H0.75L5.95 7.05667V11.4167L8.55 12.75V7.05667L13.75 0.75Z"
        stroke={`var(${color})`}
        fill={filled ? `var(${color})` : "none"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
