"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport } from
"@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description &&
              <ToastDescription>{description}</ToastDescription>
              }
            </div>
            {action}
            <ToastClose />
          </Toast>);

      })}
      <ToastViewport />
    </ToastProvider>);

}