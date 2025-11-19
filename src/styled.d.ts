import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    border: string;
    cardBackground: string;
    inputBackground: string;
    buttonBackground: string;
    buttonText: string;
    buttonHover: string;
    buttonActive: string;
    buttonDisabled: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    hover: string;
    shadowSm: string;
    shadow: string;
    shadowLg: string;
    gradient: string;
    button: {
      primary: string;
      secondary: string;
      danger: string;
      text: string;
    };
    modal: {
      background: string;
      overlay: string;
    };
    tooltip: {
      background: string;
      text: string;
    };
    scrollbar: {
      track: string;
      thumb: string;
    };
  }
}
