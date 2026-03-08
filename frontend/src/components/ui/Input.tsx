// Input.tsx — reusable input field with label and error state

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: string; // material symbol name
}

export const Input = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  icon,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full py-3 rounded-xl border bg-slate-50 text-slate-900
            text-sm font-medium outline-none transition-all
            focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${icon ? "pl-10 pr-4" : "px-4"}
            ${error ? "border-red-400 bg-red-50" : "border-slate-200"}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};