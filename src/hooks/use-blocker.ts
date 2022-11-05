import { useContext, useEffect, ContextType } from "react";
import { Blocker, Transition, History } from "history";
import {
  Navigator as BaseNavigator,
  UNSAFE_NavigationContext as NavigationContext,
} from "react-router-dom";

interface Navigator extends BaseNavigator {
  block: History["block"];
}

type NavigationContextWithBlock = ContextType<typeof NavigationContext> & {
  navigator: Navigator;
};

function useBlocker(blocker: Blocker, when = true) {
  const { navigator } = useContext(
    NavigationContext
  ) as NavigationContextWithBlock;

  useEffect(() => {
    if (!when) return;

    const unblock = navigator.block((tx: Transition) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          // Automatically unblock the transition so it can play all the way
          // through before retrying it. TODO: Figure out how to re-enable
          // this block if the transition is cancelled for some reason.
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
}

export default useBlocker;
