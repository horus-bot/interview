import * as React from "react";



const Alert = React.forwardRef(


  ({ variant = "default", style, ...props }, ref) =>
  <div
    ref={ref}
    role="alert"
    style={{
      position: "relative",
      width: "100%",
      borderRadius: "0.75rem",
      border: `1px solid ${variant === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
      backgroundColor: "hsl(var(--background))",
      color: variant === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--foreground))",
      padding: "1rem",
      ...style
    }}
    {...props} />

);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(


  ({ style, ...props }, ref) =>
  <h5
    ref={ref}
    style={{
      margin: 0,
      marginBottom: "0.25rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
      ...style
    }}
    {...props} />

);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(


  ({ style, ...props }, ref) =>
  <div
    ref={ref}
    style={{
      fontSize: "0.875rem",
      lineHeight: 1.5,
      opacity: 0.95,
      ...style
    }}
    {...props} />

);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };