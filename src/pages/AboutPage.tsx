import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaRocket, FaUsers, FaGlobe, FaHeart } from 'react-icons/fa';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${(props) => props.theme.text};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.primary};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.textSecondary};
  max-width: 700px;
  margin: 0 auto 2rem;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  
  h2 {
    color: ${(props) => props.theme.primary};
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    line-height: 1.8;
    margin-bottom: 1.5rem;
    color: ${(props) => props.theme.text};
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TeamMember = styled.div`
  background: ${(props) => props.theme.cardBackground};
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  
  h3 {
    margin: 1rem 0 0.5rem;
    color: ${(props) => props.theme.primary};
  }
  
  p {
    color: ${(props) => props.theme.textSecondary};
    margin: 0;
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
  }
  
  p {
    margin-bottom: 2rem;
    color: ${(props) => props.theme.textSecondary};
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

const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About multiple.live - Our Story and Mission';
  }, []);

  return (
    <AboutContainer>
      <Header>
        <Title>About multiple.live</Title>
        <Subtitle>
          The ultimate platform for watching and managing multiple live streams in one place.
        </Subtitle>
      </Header>

      <Section>
        <h2><FaRocket /> Our Story</h2>
        <p>
          multiple.live was born out of a simple idea: watching multiple live streams shouldn't be complicated. 
          As live streaming continues to grow in popularity, we noticed that there wasn't an easy way to 
          watch multiple streams from different platforms simultaneously without technical hassles.
        </p>
        <p>
          Our team of streaming enthusiasts and developers came together to create a solution that's both 
          powerful and easy to use. Whether you're an esports fan, content creator, or just someone who 
          loves live content, multiple.live is designed with you in mind.
        </p>
      </Section>

      <Section>
        <h2><FaGlobe /> Our Mission</h2>
        <p>
          We're on a mission to revolutionize how people consume live content. We believe that you should 
          be able to watch what you want, when you want, and how you want—without limitations.
        </p>
        <p>
          Our platform is built with a focus on performance, reliability, and user experience. We're 
          constantly improving and adding new features to make multiple.live the best multi-streaming 
          platform available.
        </p>
      </Section>

      <Section>
        <h2><FaUsers /> The Team</h2>
        <p>
          multiple.live is developed and maintained by a passionate team of developers, designers, and 
          streaming enthusiasts from around the world.
        </p>
        <TeamGrid>
          <TeamMember>
            <h3>baydd</h3>
            <p>Founder & Lead Developer</p>
          </TeamMember>
          <TeamMember>
            <h3>Our Community</h3>
            <p>Contributors & Supporters</p>
          </TeamMember>
        </TeamGrid>
      </Section>

      <Section>
        <h2><FaHeart /> Join Our Community</h2>
        <p>
          We're more than just a platform—we're a community of stream lovers. Join us on our journey to 
          make live streaming more accessible and enjoyable for everyone.
        </p>
      </Section>

      <CTA>
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who are already enjoying multiple.live</p>
        <CTAButton to="/app">Start Watching Now</CTAButton>
      </CTA>
    </AboutContainer>
  );
};

export default AboutPage;
