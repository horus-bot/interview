import * as React from "react";

const Card = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      borderRadius: '0.5rem',
      border: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      ...style
    }}
    {...props} />

);
Card.displayName = "Card";

const CardHeader = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      padding: '1.5rem',
      ...style
    }}
    {...props} />

);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-0.025em',
      ...style
    }}
    {...props} />

);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      fontSize: '0.875rem',
      color: 'hsl(var(--muted-foreground))',
      ...style
    }}
    {...props} />

);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div ref={ref} style={{ padding: '1.5rem', paddingTop: 0, ...style }} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(


  ({ className, style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1.5rem',
      paddingTop: 0,
      ...style
    }}
    {...props} />

);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };