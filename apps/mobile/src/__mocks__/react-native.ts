export const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {}),
};

export const View = 'View';
export const Text = 'Text';
export const TextInput = 'TextInput';
export const TouchableOpacity = 'TouchableOpacity';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const ActivityIndicator = 'ActivityIndicator';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
export const SafeAreaView = 'SafeAreaView';
export const StatusBar = 'StatusBar';
export const Modal = 'Modal';

type BackHandlerListener = () => boolean | null | undefined;
const backHandlerListeners: BackHandlerListener[] = [];

export const BackHandler = {
  addEventListener: (eventName: string, handler: BackHandlerListener) => {
    if (eventName === 'hardwareBackPress') {
      backHandlerListeners.push(handler);
    }
    return {
      remove: () => {
        const index = backHandlerListeners.indexOf(handler);
        if (index !== -1) {
          backHandlerListeners.splice(index, 1);
        }
      },
    };
  },
  removeEventListener: (eventName: string, handler: BackHandlerListener) => {
    const index = backHandlerListeners.indexOf(handler);
    if (index !== -1) {
      backHandlerListeners.splice(index, 1);
    }
  },
  exitApp: () => {},
  // Helper for tests to simulate hardware back button
  _triggerBackPress: () => {
    for (let i = backHandlerListeners.length - 1; i >= 0; i--) {
      const handled = backHandlerListeners[i]();
      if (handled) return true;
    }
    return false;
  },
  _reset: () => {
    backHandlerListeners.length = 0;
  },
};

export const Platform = {
  OS: 'android' as const,
  select: (obj: any) => (obj.android !== undefined ? obj.android : obj.default),
};
