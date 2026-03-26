import * as React from "react";

const Input = React.forwardRef(
  ({ className, style, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        style={{
          display: 'flex',
          height: '2.5rem',
          width: '100%',
          borderRadius: '0.375rem',
          border: '1px solid hsl(var(--input))',
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          ...style
        }}
        {...props} />);


  }
);
Input.displayName = "Input";

export { Input };