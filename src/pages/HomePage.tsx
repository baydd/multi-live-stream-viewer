import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlay, FaUsers, FaTv, FaMobileAlt, FaChartLine } from 'react-icons/fa';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${(props) => props.theme.text};
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, ${(props) => props.theme.primary}15 0%, ${(props) => props.theme.background} 100%);
  border-radius: 16px;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.primary};
  font-weight: 800;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.textSecondary};
  max-width: 700px;
  margin: 0 auto 2rem;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: ${(props) => props.theme.primary};
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  margin: 0 0.5rem 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px ${(props) => props.theme.primary}40;
  }
`;

const SecondaryButton = styled(CTAButton)`
  background: transparent;
  border: 2px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const FeatureCard = styled.div`
  background: ${(props) => props.theme.cardBackground};
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid ${(props) => props.theme.border};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px ${(props) => props.theme.shadow || 'rgba(0,0,0,0.1)'};
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${(props) => props.theme.primary};
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${(props) => props.theme.textSecondary};
  line-height: 1.6;
`;

const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'multiple.live - Watch Multiple Live Streams Simultaneously';
  }, []);

  return (
    <HomeContainer>
      <HeroSection>
        <Title>Watch Multiple Live Streams at Once</Title>
        <Subtitle>
          multiple.live lets you view and manage multiple live streams in one place. Perfect for content creators, 
          esports fans, and anyone who wants to keep up with multiple live events simultaneously.
        </Subtitle>
        <div>
          <CTAButton to="/app">Start Watching Now</CTAButton>
          <SecondaryButton to="/how-it-works">How It Works</SecondaryButton>
        </div>
      </HeroSection>

      <FeaturesGrid>
        <FeatureCard>
          <FeatureIcon><FaTv /></FeatureIcon>
          <FeatureTitle>Multi-Stream Viewing</FeatureTitle>
          <FeatureDescription>
            Watch multiple live streams from different platforms in a single, customizable dashboard.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon><FaUsers /></FeatureIcon>
          <FeatureTitle>Watch Together</FeatureTitle>
          <FeatureDescription>
            Create watch parties and enjoy streams with friends in real-time with synchronized playback.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon><FaMobileAlt /></FeatureIcon>
          <FeatureTitle>Responsive Design</FeatureTitle>
          <FeatureDescription>
            Works perfectly on all devices, from desktop to mobile, with a clean and intuitive interface.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default HomePage;
