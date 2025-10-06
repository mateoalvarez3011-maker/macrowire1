import * as React from "react";
export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className="", ...props }) => (
  <span className={"inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 text-xs " + className} {...props} />
);
