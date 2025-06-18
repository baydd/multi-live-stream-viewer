import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  background: '#ffffff',
  text: '#1a1a1a',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#6b7280',
  accent: '#17a2b8',
  border: '#e5e7eb',
  cardBackground: 'rgba(255, 255, 255, 0.8)',
  inputBackground: '#ffffff',
  buttonBackground: '#3b82f6',
  buttonText: '#ffffff',
  buttonHover: '#2563eb',
  buttonActive: '#1d4ed8',
  buttonDisabled: '#6b7280',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
  hover: '#f3f4f6',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  button: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    danger: '#ef4444',
    text: '#ffffff'
  },
  modal: {
    background: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  tooltip: {
    background: '#1a1a1a',
    text: '#ffffff'
  },
  scrollbar: {
    track: '#f3f4f6',
    thumb: '#d1d5db'
  }
};

export const darkTheme: DefaultTheme = {
  background: '#1a1a1a',
  text: '#ffffff',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#9ca3af',
  accent: '#0dcaf0',
  border: '#374151',
  cardBackground: 'rgba(31, 41, 55, 0.8)',
  inputBackground: '#1f2937',
  buttonBackground: '#3b82f6',
  buttonText: '#ffffff',
  buttonHover: '#2563eb',
  buttonActive: '#1d4ed8',
  buttonDisabled: '#6b7280',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
  hover: '#374151',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  button: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    danger: '#ef4444',
    text: '#ffffff'
  },
  modal: {
    background: '#1f2937',
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  tooltip: {
    background: '#ffffff',
    text: '#1a1a1a'
  },
  scrollbar: {
    track: '#374151',
    thumb: '#4b5563'
  }
};