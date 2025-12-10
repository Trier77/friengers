export default function MapPinIcon({ color = "--white", size = 7 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3.5C2.5875 3.5 2.25 3.185 2.25 2.8C2.25 2.415 2.5875 2.1 3 2.1C3.4125 2.1 3.75 2.415 3.75 2.8C3.75 3.185 3.4125 3.5 3 3.5ZM3 0C1.425 0 0 1.127 0 2.87C0 4.032 1.00125 5.4075 3 7C4.99875 5.4075 6 4.032 6 2.87C6 1.127 4.575 0 3 0Z"
        fill={`var(${color})`}
      />
    </svg>
  );
}
