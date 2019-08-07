import shortid from 'shortid';
import { CommonAction, Router } from '@navigation-ex/core';
import TabRouter, {
  TabActions,
  TabActionType,
  TabRouterOptions,
  TabNavigationState,
} from './TabRouter';

export type DrawerActionType =
  | TabActionType
  | {
      type: 'OPEN_DRAWER' | 'CLOSE_DRAWER' | 'TOGGLE_DRAWER';
      source?: string;
      target?: string;
    };

export type DrawerRouterOptions = TabRouterOptions;

export type DrawerNavigationState = TabNavigationState & {
  /**
   * Whether the drawer is open or closed.
   */
  isDrawerOpen: boolean;
};

export const DrawerActions = {
  ...TabActions,
  openDrawer(): DrawerActionType {
    return { type: 'OPEN_DRAWER' };
  },
  closeDrawer(): DrawerActionType {
    return { type: 'CLOSE_DRAWER' };
  },
  toggleDrawer(): DrawerActionType {
    return { type: 'TOGGLE_DRAWER' };
  },
};

export default function DrawerRouter(
  options: DrawerRouterOptions
): Router<DrawerNavigationState, DrawerActionType | CommonAction> {
  const router = TabRouter(options) as Router<
    DrawerNavigationState,
    TabActionType | CommonAction
  >;

  return {
    ...router,

    getInitialState({ routeNames, routeParamList }) {
      const index =
        options.initialRouteName === undefined
          ? 0
          : routeNames.indexOf(options.initialRouteName);

      return {
        key: `drawer-${shortid()}`,
        index,
        routeNames,
        routeKeyHistory: [],
        routes: routeNames.map(name => ({
          name,
          key: `${name}-${shortid()}`,
          params: routeParamList[name],
        })),
        isDrawerOpen: false,
      };
    },

    getStateForRouteFocus(state, key) {
      const index = state.routes.findIndex(r => r.key === key);

      const result =
        index === -1 || index === state.index
          ? state
          : router.getStateForRouteFocus(state, key);

      if (result.isDrawerOpen) {
        return {
          ...result,
          isDrawerOpen: false,
        };
      }

      return result;
    },

    getStateForAction(state, action) {
      switch (action.type) {
        case 'OPEN_DRAWER':
          if (state.isDrawerOpen) {
            return state;
          }

          return {
            ...state,
            isDrawerOpen: true,
          };

        case 'CLOSE_DRAWER':
          if (!state.isDrawerOpen) {
            return state;
          }

          return {
            ...state,
            isDrawerOpen: false,
          };

        case 'TOGGLE_DRAWER':
          return {
            ...state,
            isDrawerOpen: !state.isDrawerOpen,
          };

        default:
          return router.getStateForAction(state, action);
      }
    },

    actionCreators: DrawerActions,
  };
}