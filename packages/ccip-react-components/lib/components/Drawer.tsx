import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { TDrawer, DrawerProps } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTheme } from '@/hooks/useTheme';

export const Drawer = forwardRef<TDrawer, PropsWithChildren<DrawerProps>>(
  ({ open, children }, ref) => {
    const openRef = useRef(open);
    const [drawerOpen, setDrawerOpen] = useState(open);

    const toggleDrawer = useCallback(() => {
      setDrawerOpen((open) => {
        openRef.current = !open;
        return openRef.current;
      });
    }, []);

    const openDrawer = useCallback(() => {
      setDrawerOpen(true);
      openRef.current = true;
    }, []);

    const closeDrawer = useCallback(() => {
      setDrawerOpen(false);
      openRef.current = false;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        isOpen: () => openRef.current,
        toggleDrawer,
        openDrawer,
        closeDrawer,
      }),
      [closeDrawer, openDrawer, toggleDrawer]
    );

    const { style } = useTheme();

    return (
      <Sheet onOpenChange={(o) => setDrawerOpen(o)} open={drawerOpen}>
        <SheetContent
          className="p-0 w-full md:w-[473px] sm:max-w-none"
          style={style}
        >
          <VisuallyHidden.Root>
            <SheetHeader>
              <SheetTitle>Bridge dialog</SheetTitle>
              <SheetDescription>Bridge dialog</SheetDescription>
            </SheetHeader>
          </VisuallyHidden.Root>
          {children}
        </SheetContent>
      </Sheet>
    );
  }
);
