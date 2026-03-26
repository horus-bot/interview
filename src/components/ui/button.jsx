import * as React from "react";
import { Slot } from "@radix-ui/react-slot";







// Back-compat export for shadcn components that still expect it.
// (We now style buttons via inline styles instead of utility class strings.)
export function buttonVariants(_opts)



{
  return "";
}

const getStyles = (variant = 'default', size = 'default') => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    outline: 'none'
  };

  const variants = {
    default: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    destructive: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
    outline: { border: '1px solid hsl(var(--border))', backgroundColor: 'transparent', color: 'hsl(var(--foreground))' },
    secondary: { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' },
    ghost: { backgroundColor: 'transparent', color: 'hsl(var(--foreground))' },
    link: { backgroundColor: 'transparent', color: 'hsl(var(--primary))', textDecoration: 'underline' }
  };

  const sizes = {
    default: { height: '2.5rem', padding: '0 1rem' },
    sm: { height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.375rem' },
    lg: { height: '2.75rem', padding: '0 2rem', borderRadius: '0.375rem' },
    icon: { height: '2.5rem', width: '2.5rem' }
  };

  return { ...base, ...variants[variant], ...sizes[size] };
};

const Button = React.forwardRef(
  ({ className, style, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [hover, setHover] = React.useState(false);

    const computedStyle = {
      ...getStyles(variant, size),
      opacity: hover ? 0.9 : 1,
      transform: hover && variant !== 'link' ? 'scale(1.02)' : 'none',
      ...style
    };

    return (
      <Comp
        ref={ref}
        style={computedStyle}
        onMouseEnter={(e) => {setHover(true);props.onMouseEnter?.(e);}}
        onMouseLeave={(e) => {setHover(false);props.onMouseLeave?.(e);}}
        {...props} />);


  }
);
Button.displayName = "Button";

export { Button };