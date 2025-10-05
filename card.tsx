import * as React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className="", ...props }) => (
  <div className={"rounded-lg border border-gray-200 shadow-sm " + className} {...props} />
);
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className="", ...props }) => (
  <div className={"border-b px-4 py-3 " + className} {...props} />
);
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className="", ...props }) => (
  <h3 className={"text-lg font-semibold " + className} {...props} />
);
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className="", ...props }) => (
  <div className={"px-4 py-3 " + className} {...props} />
);
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className="", ...props }) => (
  <div className={"border-t px-4 py-3 " + className} {...props} />
);
