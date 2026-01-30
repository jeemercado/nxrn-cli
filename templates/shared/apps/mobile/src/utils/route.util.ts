/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonActions, NavigationState, ParamListBase } from '@react-navigation/native';

export function getPreviousRouteName(navigationState: NavigationState<ParamListBase>) {
  const routes = navigationState.routes;
  const currentIndex = navigationState.index;

  if (currentIndex > 0) {
    return routes[currentIndex - 1].name;
  }

  return null;
}

export function getCurrentRouteName(navigation: any) {
  return navigation.getState().routes[navigation.getState().index].name;
}

export function navigationPop(navigation: any, frequency = 2) {
  navigation.dispatch((state: any) => {
    const routes = state.routes.slice(0, -frequency);

    return CommonActions.reset({
      ...state,
      index: routes.length - 1,
      routes,
    });
  });
}

export function navigationNavigateAndReset(
  navigation: any,
  routeName: string,
  frequency = 1,
  params?: any,
) {
  navigation.dispatch((state: any) => {
    const routes = state.routes.slice(0, -frequency);
    routes.push({ name: routeName, params });

    return CommonActions.reset({
      ...state,
      index: routes.length - 1,
      routes,
    });
  });
}
