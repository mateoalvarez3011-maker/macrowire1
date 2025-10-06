import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default"|"outline" }

export const Button: React.FC<Props> = ({ className="", variant="default", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ";
  const styles = variant === "outline"
    ? "border border-gray-300 hover:bg-gray-50"
    : "bg-black text-white hover:bg-black/90";
  return <button className={base + styles + " " + className} {...props} />;
};
