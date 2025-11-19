import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stream } from '../types';
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaGlobe,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { loadAllChannels, Channel } from '../utils/m3uParser';
import { useTranslation } from 'react-i18next';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const DropdownBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  z-index: 1100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;

  &[data-visible='true'] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.secondary || '#64748b'};
  font-size: 14px;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  margin-right: 10px;
  color: ${({ theme }) => theme.primary || '#4a6cf7'};
`;

const ErrorMessage = styled.div`
  padding: 14px 16px;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  border-radius: 8px;
  margin: 0 16px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
  border-left: 3px solid #dc2626;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ChannelListContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 16px;
  z-index: 1000;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  width: 100%;
  max-width: 380px;

  @media (max-width: 768px) {
    max-width: 100%;
    margin-right: 0;
  }
`;

const ChannelButton = styled.button`
  width: 100%;
  min-height: 48px;
  background: ${({ theme }) => theme.cardBackground || theme.background || '#ffffff'};
  color: ${({ theme }) => theme.text || '#1a202c'};
  border: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
  text-align: left;

  &:not(:disabled):hover {
    border-color: ${({ theme }) => theme.primary || '#4a6cf7'};
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.primary || '#4a6cf7'};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.primary || '#4a6cf7'}40`};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }
`;

const SearchContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 16px;
  background: ${({ theme }) => theme.cardBackground || theme.background || '#ffffff'};
  border-bottom: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  border-radius: 14px 14px 0 0;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};
  border-radius: 8px;
  background: ${({ theme }) => theme.background || '#ffffff'};
  color: ${({ theme }) => theme.text || '#1a202c'};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  &:focus {
    border-color: ${({ theme }) => theme.primary || '#4a6cf7'};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.primary || '#4a6cf7'}33`};
    background: ${({ theme }) => theme.background || '#ffffff'};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) =>
    theme.background === '#ffffff' ? '#64748b' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 15px;
  pointer-events: none;
  transition: color 0.2s ease;

  ${SearchInputWrapper}:focus-within & {
    color: ${({ theme }) => theme.primary || '#4a6cf7'};
  }
`;

const Dropdown = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.cardBackground || '#ffffff'};
  border-radius: 14px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.2);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1200;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(10px)')};
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  border: 1px solid ${({ theme }) => theme.border || '#e2e8f0'};

  @media (max-width: 768px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    max-height: 80vh;
    border-radius: 20px 20px 0 0;
    transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(100%)')};
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background || '#f8fafc'};
    border-radius: 0 12px 12px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary || '#c7d2fe'};
    border-radius: 4px;
  }
`;

const DropdownContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const CountriesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 16px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme.background === '#ffffff' ? '#f1f5f9' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 3px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => (theme.primary ? `${theme.primary}80` : '#c7d2fe80')};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.primary || '#c7d2fe'};
    }
  }
`;

interface ThemeProps {
  theme: {
    primary?: string;
    background?: string;
    cardBackground?: string;
    border?: string;
    buttonHover?: string;
    text?: string;
  };
}

const CountrySection = styled.div.attrs({ className: 'country-section' })<
  { isExpanded: boolean } & ThemeProps
>`
  margin: 0 12px 8px 12px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ theme }: ThemeProps) =>
    theme.cardBackground ||
    (theme.background === '#ffffff' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.6)')};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }: ThemeProps) => theme.border || 'rgba(203, 213, 225, 0.2)'};

  &:last-child {
    margin-bottom: 12px;
  }

  /* Add a visual indicator for expanded state */
  ${({ isExpanded, theme }: { isExpanded: boolean } & ThemeProps) =>
    isExpanded &&
    `
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${theme.primary ? `${theme.primary}30` : 'rgba(79, 70, 229, 0.2)'};
    background: ${theme.cardBackground || (theme.background === '#ffffff' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.7)')};
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

interface CountryHeaderProps extends ThemeProps {
  isExpanded?: boolean;
}

const CountryHeader = styled.div<CountryHeaderProps>`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  color: ${({ theme }: ThemeProps) =>
    theme.text || (theme.background === '#ffffff' ? '#1e293b' : '#f8fafc')};
  border-radius: 10px;

  /* Add a subtle background on hover */
  &:hover {
    background: ${({ theme }: ThemeProps) =>
      theme.background === '#ffffff' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'};
  }

  /* Add a nice accent line on the left when expanded */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: ${({ theme }) => theme.primary || '#4f46e5'};
    border-radius: 0 3px 3px 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Show the accent line when expanded */
  ${({ isExpanded }: { isExpanded?: boolean }) =>
    isExpanded &&
    `
    &::before {
      height: 60%;
    }
  `}

  &:hover {
    background: ${({ theme }) => theme.buttonHover || 'rgba(0, 0, 0, 0.03)'};
  }

  & > svg {
    margin-left: auto;
    color: #94a3b8;
    transition: transform 0.2s ease;
  }

  span {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
  }
`;

const ChannelListWrapper = styled.div<{ $isExpanded: boolean }>`
  max-height: ${({ $isExpanded }) => ($isExpanded ? 'none' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: ${({ theme }) => theme.background || '#ffffff'};
  padding: 0 8px;
  margin: 0;
  opacity: ${({ $isExpanded }) => ($isExpanded ? '1' : '0')};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme.background === '#ffffff' ? '#f1f5f9' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 3px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => (theme.primary ? `${theme.primary}80` : '#c7d2fe80')};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.primary || '#c7d2fe'};
    }
  }
`;

const ChannelItem = styled.div`
  padding: 10px 12px;
  margin: 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.15s ease;
  font-size: 14px;
  border-radius: 6px;
  color: ${({ theme }) => theme.text || '#1a202c'};
  background: transparent;
  position: relative;

  &:hover {
    background: ${({ theme }) =>
      theme.background === '#ffffff' ? '#f8fafc' : 'rgba(0, 0, 0, 0.05)'};
  }

  &:active {
    transform: translateY(1px);
  }

  /* Add a subtle gradient overlay on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      ${({ theme }) => (theme.primary ? `${theme.primary}08` : 'rgba(79, 70, 229, 0.04)')} 0%,
      transparent 50%
    );
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) =>
      theme.buttonHover ||
      (theme.background === '#ffffff' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.7)')};
    transform: translateX(6px);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.06);
    border-color: ${({ theme }) =>
      theme.primary ? `${theme.primary}30` : 'rgba(79, 70, 229, 0.2)'};

    &::before {
      opacity: 1;
    }

    img {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateX(4px) scale(0.99);
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.05);
  }

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 6px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    background: ${({ theme }) =>
      theme.background === '#ffffff' ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'};
    padding: 4px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
  }

  span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${({ theme }) => theme.text || (theme.background === '#ffffff' ? '#1e293b' : '#f1f5f9')};
    font-size: 14px;
    font-weight: 500;
    position: relative;
    z-index: 1;
    letter-spacing: 0.01em;

    /* Add a subtle gradient fade for long text */
    mask-image: linear-gradient(
      to right,
      black calc(100% - 40px),
      rgba(0, 0, 0, 0.8) calc(100% - 20px),
      transparent 100%
    );
  }

  &:last-child {
    margin-bottom: 8px;
  }
`;

// Channel interface is now imported from m3uParser

interface ChannelListProps {
  onSelectChannel: (channel: Stream) => void;
}

const ChannelListComponent: React.FC<ChannelListProps> = ({ onSelectChannel }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const channels = await loadAllChannels();

      // Initialize expanded countries based on search
      const initialExpanded: Record<string, boolean> = {};
      channels.forEach((channel) => {
        if (!initialExpanded[channel.country]) {
          initialExpanded[channel.country] = false;
        }
      });

      setAllChannels(channels);
      setExpandedCountries(initialExpanded);
    } catch (err) {
      console.error('Error loading channels:', err);
      setError('Failed to load channels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return allChannels;
    const query = searchQuery.toLowerCase();
    return allChannels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        (channel.country && channel.country.toLowerCase().includes(query))
    );
  }, [searchQuery, allChannels]);

  const channelsByCountry = useMemo(() => {
    const groups: Record<string, Channel[]> = {};

    filteredChannels.forEach((channel) => {
      const country = channel.country || 'Other';
      if (!groups[country]) {
        groups[country] = [];
      }
      groups[country].push(channel);
    });

    // Auto-expand countries when searching
    if (searchQuery.trim()) {
      const newExpanded = { ...expandedCountries };
      let hasChanges = false;

      Object.keys(groups).forEach((country) => {
        if (!newExpanded[country]) {
          newExpanded[country] = true;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setTimeout(() => setExpandedCountries(newExpanded), 0);
      }
    }

    // Sort countries alphabetically
    return Object.keys(groups)
      .sort()
      .reduce(
        (acc, country) => {
          acc[country] = groups[country].sort((a, b) => a.name.localeCompare(b.name));
          return acc;
        },
        {} as Record<string, Channel[]>
      );
  }, [filteredChannels, searchQuery, expandedCountries]);

  const toggleCountry = useCallback(
    (country: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const isCurrentlyExpanded = expandedCountries[country] !== false;

      setExpandedCountries((prev) => ({
        ...prev,
        [country]: !isCurrentlyExpanded,
      }));

      if (!isCurrentlyExpanded) {
        const target = e.currentTarget.closest('.country-section');

        if (target) {
          setTimeout(() => {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 50);
        }
      }

      e.nativeEvent.stopImmediatePropagation();
    },
    [expandedCountries]
  );

  const handleChannelSelect = useCallback(
    (channel: Channel, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!channel?.url) return;

      const stream: Stream = {
        id: channel.id,
        url: channel.url,
        title: channel.name,
        platform: 'hls',
        layout: {
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
      };

      // Close dropdown first to avoid any UI glitches
      setIsDropdownOpen(false);

      // Then trigger the onSelectChannel callback
      onSelectChannel(stream);
    },
    [onSelectChannel]
  );

  const toggleAllCountries = useCallback(() => {
    const allExpanded = Object.keys(channelsByCountry).every(
      (country) => expandedCountries[country]
    );

    const newState = { ...expandedCountries };
    let hasChanges = false;

    Object.keys(channelsByCountry).forEach((country) => {
      if (newState[country] === allExpanded) {
        newState[country] = !allExpanded;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setExpandedCountries(newState);
    }
  }, [channelsByCountry, expandedCountries]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.channel-list-container, .channel-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <ChannelListContainer className="channel-list-container">
      <DropdownBackdrop data-visible={isDropdownOpen} onClick={() => setIsDropdownOpen(false)} />
      <ChannelButton
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        disabled={isLoading}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoading ? <LoadingSpinner size={14} /> : <FaGlobe style={{ color: '#4a6cf7' }} />}
          <span>
            {isLoading
              ? t('channel_selector.loading') || 'Loading...'
              : t('channel_selector.select_channel') || 'Select Channel'}
          </span>
        </div>
        {isDropdownOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
      </ChannelButton>

      <Dropdown
        className="channel-dropdown"
        onClick={(e) => e.stopPropagation()}
        $isVisible={isDropdownOpen}
      >
        <SearchContainer>
          <SearchInputWrapper>
            <SearchInput
              type="text"
              placeholder={t('channel_selector.search_placeholder') || 'Search channel or country'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus={isDropdownOpen}
              disabled={isLoading}
            />
            <SearchIcon />
          </SearchInputWrapper>
        </SearchContainer>
        <CountriesList>
          <div>
            {error ? (
              <ErrorMessage>
                <FaExclamationTriangle />
                {error}
                <button
                  onClick={loadChannels}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: '1px solid currentColor',
                    color: 'inherit',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FaSpinner style={{ display: isLoading ? 'inline-block' : 'none' }} />
                  Tekrar Dene
                </button>
              </ErrorMessage>
            ) : isLoading ? (
              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#666',
                }}
              >
                <LoadingSpinner size={16} />
                <span>Kanallar yükleniyor...</span>
              </div>
            ) : (
              <>
                <CountryHeader onClick={toggleAllCountries}>
                  <span>
                    <FaGlobe />
                    {Object.keys(channelsByCountry).every((country) => expandedCountries[country])
                      ? t('channel_selector.collapse_all') || 'Collapse All'
                      : t('channel_selector.expand_all') || 'Expand All'}
                  </span>
                </CountryHeader>

                {Object.keys(channelsByCountry).length > 0 ? (
                  Object.entries(channelsByCountry).map(([country, channels]) => {
                    const countryCode = channels[0]?.countryCode?.toLowerCase() || 'xx';
                    const isExpanded = expandedCountries[country] !== false;

                    return (
                      <CountrySection key={country} isExpanded={isExpanded}>
                        <CountryHeader onClick={(e) => toggleCountry(country, e)}>
                          <span>
                            <img
                              src={`https://flagcdn.com/16x12/${countryCode}.png`}
                              alt={country}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                              style={{ width: '16px', height: '12px', objectFit: 'cover' }}
                            />
                            {country} ({channels.length})
                          </span>
                          {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </CountryHeader>

                        <ChannelListWrapper $isExpanded={isExpanded}>
                          {channels.map((channel) => (
                            <ChannelItem
                              key={channel.id}
                              onClick={(e) => handleChannelSelect(channel, e)}
                              title={channel.name}
                            >
                              {channel.logo && (
                                <img
                                  src={channel.logo}
                                  alt={channel.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                />
                              )}
                              <span
                                style={{
                                  flex: 1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {channel.name}
                              </span>
                            </ChannelItem>
                          ))}
                        </ChannelListWrapper>
                      </CountrySection>
                    );
                  })
                ) : (
                  <EmptyState>
                    {searchQuery
                      ? t('channel_selector.no_results') || 'No results found'
                      : t('channel_selector.no_channels') || 'No channels found'}
                  </EmptyState>
                )}
              </>
            )}
          </div>
        </CountriesList>
      </Dropdown>
    </ChannelListContainer>
  );
};

export default ChannelListComponent;
