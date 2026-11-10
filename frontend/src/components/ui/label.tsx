import * as React from "react";
import { clsx } from "clsx";

const labelVariants = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx(labelVariants, className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";
