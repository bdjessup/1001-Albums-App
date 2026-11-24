import { HeaderHeightContext } from "expo-router/react-navigation";
import { useVerticalBarEdgeIOS } from "expo-status-bar";
import { use } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Album backgrounds extend under the bars. Only the foreground needs this offset. */
export function useHeaderInset(): number {
  const headerHeight = use(HeaderHeightContext);
  const verticalBar = useVerticalBarEdgeIOS();
  const { top } = useSafeAreaInsets();
  if (verticalBar) return top;
  return headerHeight ?? top;
}
