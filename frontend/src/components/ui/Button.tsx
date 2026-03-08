// Button.tsx — reusable button component
// Instead of copying Tailwind classes everywhere, we define variants here
// Usage: <Button variant="primary">Book Now</Button>

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled,
  className = "",
  fullWidth,
}: ButtonProps) => {

  const base = "font-bold rounded-xl transition-all flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-white hover:bg-green-600",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};