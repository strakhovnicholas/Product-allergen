import NetInfo from '@react-native-community/netinfo';

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function subscribeNetwork(callback: (online: boolean) => void) {
  return NetInfo.addEventListener((state) => {
    callback(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
}
