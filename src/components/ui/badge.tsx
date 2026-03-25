import * as React from "react"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const getVariantStyle = (variant: BadgeVariant): React.CSSProperties => {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "hsl(var(--secondary))",
        color: "hsl(var(--secondary-foreground))",
        borderColor: "transparent",
      }
    case "destructive":
      return {
        backgroundColor: "hsl(var(--destructive))",
        color: "hsl(var(--destructive-foreground))",
        borderColor: "transparent",
      }
    case "outline":
      return {
        backgroundColor: "transparent",
        color: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
      }
    case "default":
    default:
      return {
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        borderColor: "transparent",
      }
  }
}

function Badge({ variant = "default", style, ...props }: BadgeProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        borderWidth: 1,
        borderStyle: "solid",
        padding: "0.125rem 0.625rem",
        fontSize: "0.75rem",
        fontWeight: 700,
        ...getVariantStyle(variant),
        ...style,
      }}
      {...props}
    />
  )
}

// Kept for backward-compat with any existing imports.
const badgeVariants = (_opts?: { variant?: BadgeVariant }) => ""

export { Badge, badgeVariants }
