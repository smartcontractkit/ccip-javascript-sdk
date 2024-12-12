import { useAppContext } from '@/hooks/useAppContext';
import { CSSProperties, useMemo } from 'react';

export const useTheme = () => {
  const { config } = useAppContext();

  const style = useMemo(
    () =>
      ({
        '--ccip-primary': config?.theme?.palette?.primary,
        '--ccip-background': config?.theme?.palette?.background,
        '--ccip-border': config?.theme?.palette?.border,
        '--ccip-text': config?.theme?.palette?.text,
        '--ccip-muted': config?.theme?.palette?.muted,
        '--ccip-input': config?.theme?.palette?.input,
        '--ccip-popover': config?.theme?.palette?.popover,
        '--ccip-selected': config?.theme?.palette?.selected,
        '--ccip-warning': config?.theme?.palette?.warning,
        '--ccip-warning-background': config?.theme?.palette?.warningBackground,
        '--radius': `${config?.theme?.shape?.radius ?? 0}px`,
      }) as CSSProperties,
    [config?.theme]
  );

  return { style, variant: config?.variant };
};
