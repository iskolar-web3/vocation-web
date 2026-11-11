import { Toaster as Sonner, toast } from 'sonner';

/* M5: bottom-center, glass, dark. Sits above the mobile tab bar and the home indicator:
   --tabbar-total is set by the shell when [data-tabbar] is mounted (see index.css). */

const OFFSET = 'calc(max(var(--tabbar-total, 0px), env(safe-area-inset-bottom, 0px)) + 12px)';

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      offset={{ bottom: OFFSET }}
      mobileOffset={{ bottom: OFFSET, left: 16, right: 16 }}
      toastOptions={{ unstyled: true, classNames: { toast: 'vtoast glass' } }}
    />
  );
}

export { toast };
