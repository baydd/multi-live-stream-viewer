import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  background: '#fafafa',
  text: '#2d3748',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  secondary: '#64748b',
  accent: '#06b6d4',
  border: '#e2e8f0',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  inputBackground: '#ffffff',
  buttonBackground: '#4f46e5',
  buttonText: '#ffffff',
  buttonHover: '#4338ca',
  buttonActive: '#3730a3',
  buttonDisabled: '#94a3b8',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  hover: '#f1f5f9',
  shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  shadowLg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  button: {
    primary: '#4f46e5',
    secondary: '#64748b',
    danger: '#ef4444',
    text: '#ffffff'
  },
  modal: {
    background: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.4)'
  },
  tooltip: {
    background: '#1f2937',
    text: '#ffffff'
  },
  scrollbar: {
    track: '#f1f5f9',
    thumb: '#cbd5e1'
  }
};

export const darkTheme: DefaultTheme = {
  background: '#0f172a',
  text: '#f1f5f9',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#94a3b8',
  accent: '#06b6d4',
  border: '#334155',
  cardBackground: 'rgba(30, 41, 59, 0.95)',
  inputBackground: '#1e293b',
  buttonBackground: '#6366f1',
  buttonText: '#ffffff',
  buttonHover: '#4f46e5',
  buttonActive: '#4338ca',
  buttonDisabled: '#64748b',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  info: '#60a5fa',
  hover: '#334155',
  shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  shadowLg: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  button: {
    primary: '#6366f1',
    secondary: '#64748b',
    danger: '#f87171',
    text: '#ffffff'
  },
  modal: {
    background: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.6)'
  },
  tooltip: {
    background: '#f1f5f9',
    text: '#1f2937'
  },
  scrollbar: {
    track: '#334155',
    thumb: '#475569'
  }
};