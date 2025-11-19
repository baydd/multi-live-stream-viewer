import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaTv,
  FaUsers,
  FaMobileAlt,
  FaSlidersH,
  FaBell,
  FaLock,
  FaSync,
  FaExpand,
  FaPalette,
} from 'react-icons/fa';

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${(props) => props.theme.text};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;

  h1 {
    font-size: 2.8rem;
    color: ${(props) => props.theme.primary};
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: ${(props) => props.theme.textSecondary};
    max-width: 700px;
    margin: 0 auto;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const FeatureCard = styled.div`
  background: ${(props) => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid ${(props) => props.theme.border};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${(props) => props.theme.shadow || 'rgba(0,0,0,0.1)'};
  }

  .icon {
    font-size: 2.5rem;
    color: ${(props) => props.theme.primary};
    margin-bottom: 1.5rem;
    display: inline-block;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.text};
  }

  p {
    color: ${(props) => props.theme.textSecondary};
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
`;

const FeatureHighlight = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;

  svg {
    color: ${(props) => props.theme.primary};
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  span {
    color: ${(props) => props.theme.text};
  }
`;

const CTA = styled.div`
  text-align: center;
  margin-top: 4rem;
  padding: 3rem 2rem;
  background: ${(props) => props.theme.background};
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};

  h2 {
    color: ${(props) => props.theme.primary};
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  p {
    color: ${(props) => props.theme.textSecondary};
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: ${(props) => props.theme.primary};
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px ${(props) => props.theme.primary}40;
  }
`;

const FeaturesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Features - multiple.live | Multi-Streaming Platform';
  }, []);

  const features = [
    {
      icon: <FaTv />,
      title: 'Multi-Stream Viewing',
      description:
        'Watch multiple live streams from different platforms in a single, customizable dashboard.',
      highlights: [
        'Support for all major streaming platforms',
        'Drag-and-drop interface for easy organization',
        'Customizable grid layouts',
        'Picture-in-picture mode',
      ],
    },
    {
      icon: <FaUsers />,
      title: 'Watch Together',
      description:
        'Create watch parties and enjoy streams with friends in real-time with synchronized playback.',
      highlights: [
        'Real-time synchronization',
        'Chat with other viewers',
        'Create private rooms',
        'Invite friends easily',
      ],
    },
    {
      icon: <FaMobileAlt />,
      title: 'Cross-Platform',
      description: 'Access your streams from any device with a modern web browser.',
      highlights: [
        'Fully responsive design',
        'Progressive Web App support',
        'Works on all screen sizes',
        'Offline capabilities',
      ],
    },
    {
      icon: <FaSlidersH />,
      title: 'Customization',
      description: 'Tailor your viewing experience to your preferences.',
      highlights: [
        'Adjustable stream quality',
        'Custom layouts and presets',
        'Dark/light theme',
        'Keyboard shortcuts',
      ],
    },
    {
      icon: <FaBell />,
      title: 'Notifications',
      description: 'Never miss a stream with our notification system.',
      highlights: [
        'Browser notifications',
        'Stream start alerts',
        'Custom notification sounds',
        'Email notifications',
      ],
    },
    {
      icon: <FaLock />,
      title: 'Privacy Focused',
      description: 'Your data stays yours. We value your privacy.',
      highlights: ['No account required', 'Client-side processing', 'No tracking', 'Open source'],
    },
  ];

  return (
    <FeaturesContainer>
      <Header>
        <h1>Powerful Features for the Best Streaming Experience</h1>
        <p>Discover everything you can do with multiple.live</p>
      </Header>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <div className="icon">{feature.icon}</div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <div>
              {feature.highlights.map((highlight, i) => (
                <FeatureHighlight key={i}>
                  <FaSync size={12} />
                  <span>{highlight}</span>
                </FeatureHighlight>
              ))}
            </div>
          </FeatureCard>
        ))}
      </FeaturesGrid>

      <CTA>
        <h2>Ready to Enhance Your Streaming Experience?</h2>
        <p>
          Join thousands of users who are already enjoying multiple.live. No downloads required,
          start watching instantly.
        </p>
        <CTAButton to="/app">Start Watching Now</CTAButton>
      </CTA>
    </FeaturesContainer>
  );
};

export default FeaturesPage;
