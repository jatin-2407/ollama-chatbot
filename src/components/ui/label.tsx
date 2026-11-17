import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }: ComponentProps<"label">) => (
  <label className={cn("block select-none text-sm font-medium leading-none", className)} {...props} />
);
