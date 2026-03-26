function Skeleton({
  className,
  style,
  ...props
}) {
  return (
    <div

      style={{
        borderRadius: "0.5rem",
        backgroundColor: "hsl(var(--muted))",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ...style
      }}
      {...props} />);


}

export { Skeleton };