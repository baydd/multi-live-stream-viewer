import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaArrowLeft,
  FaRocket,
  FaBell,
  FaGithub,
  FaStar,
  FaInfoCircle,
  FaListAlt,
  FaQuestionCircle,
  FaCog,
} from 'react-icons/fa';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.1); }
`;

const floatX = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(40px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const moveDiagonal = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(50px, 50px) rotate(90deg); }
  50% { transform: translate(100px, 0) rotate(180deg); }
  75% { transform: translate(50px, -50px) rotate(270deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
`;

const pulseFast = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.05); }
`;

// Background elements
const FloatingShape = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  z-index: -1;

  &.shape-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%);
    top: -150px;
    left: -150px;
    animation:
      ${float} 25s ease-in-out infinite,
      ${pulse} 15s ease-in-out infinite;
  }

  &.shape-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
    animation:
      ${float} 30s ease-in-out infinite reverse,
      ${pulseFast} 12s ease-in-out infinite;
  }

  &.shape-3 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%);
    top: 40%;
    right: -150px;
    animation:
      ${moveDiagonal} 40s linear infinite,
      ${pulse} 18s ease-in-out infinite;
  }

  &.shape-4 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
    top: 60%;
    left: 10%;
    animation:
      ${floatSlow} 35s ease-in-out infinite,
      ${pulse} 20s ease-in-out infinite alternate;
  }

  &.shape-5 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation:
      ${rotate} 120s linear infinite,
      ${pulse} 25s ease-in-out infinite;
  }
`;

const GridPattern = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: -2;
  opacity: 0.6;
  animation: ${pulse} 30s ease-in-out infinite alternate;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 0%, #0f0c29 70%);
    pointer-events: none;
  }
`;

const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f0c29, #1e1b4b, #0f172a);
  color: white;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  padding: 2rem;
  box-sizing: border-box;
  font-family:
    'Poppins',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  line-height: 1.6;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 25%);
    z-index: -1;
  }
`;

const GitHubButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: linear-gradient(90deg, rgba(36, 41, 46, 0.2), rgba(54, 59, 64, 0.2));
  color: #8b949e;
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 10px;
  padding: 0.7rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  margin-bottom: 2.5rem;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(36, 41, 46, 0.3), rgba(54, 59, 64, 0.3));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: #f0f6fc;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }

  .star-icon {
    color: #f9c513;
    font-size: 0.9em;
    margin-left: 2px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 0.8rem;
    button,
    a {
      flex: 1;
      padding: 0.7rem 1rem;
    }
  }
`;

const BackButton = styled.button`
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2));
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 0.7rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2.5rem;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(124, 58, 237, 0.3));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 24px;
  padding: 2.5rem;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    animation: ${pulse} 3s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 25%);
    pointer-events: none;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  color: #ffffff;
  margin: 0 0 3rem 0;
  font-size: 2.8rem;
  font-weight: 800;
  position: relative;
  padding-bottom: 1.2rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: linear-gradient(90deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: fit-content;
  
  svg {
    color: #8b5cf6;
    filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3));
    animation: ${pulse} 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 70px;
    height: 4px;
    background: linear-gradient(90deg, #8b5cf6, #6366f1);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #818cf8, #4f46e5);
    border-radius: 2px;
`;

const Section = styled.section`
  margin-bottom: 3.5rem;
  
  h2 {
    color: #a5b4fc;
    margin: 2.5rem 0 1.8rem 0;
    font-size: 1.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    position: relative;
    padding-bottom: 0.8rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #a5b4fc, #6366f1);
      border-radius: 2px;
    }
`;

const UpdateCard = styled.div`
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
    transition: all 0.4s ease;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(99, 102, 241, 0.2);

    &::before {
      width: 5px;
    }

    &::after {
      opacity: 1;
    }
  }

  h3 {
    color: #ffffff;
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    font-weight: 600;
    position: relative;
    padding-left: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;

    &::before {
      content: '→';
      position: static;
      color: #818cf8;
      font-size: 1.4em;
      transition: transform 0.3s ease;
    }
  }

  &:hover h3::before {
    transform: translateX(5px);
  }

  h3 {
    color: #a5b4fc;
    margin: 0 0 1.2rem 0;
    font-size: 1.4rem;
    font-weight: 600;
    position: relative;
    padding-left: 1rem;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #818cf8;
    }
  }

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.95rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  margin: 2.5rem 0;
`;

const FeatureCard = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.9rem;
  }
`;

const UpdatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  useEffect(() => {
    document.title = 'Updates & News - multiple.live';
  }, []);

  return (
    <PageContainer>
      <FloatingShape className="shape-1" />
      <FloatingShape className="shape-2" />
      <FloatingShape className="shape-3" />
      <FloatingShape className="shape-4" />
      <FloatingShape className="shape-5" />
      <GridPattern />
      <Content>
        <ButtonGroup>
          <BackButton onClick={onBack}>
            <FaArrowLeft /> Back to Streams
          </BackButton>
          <GitHubButton
            href="https://github.com/baydd/multi-live-stream-viewer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub /> Star on GitHub <FaStar className="star-icon" />
          </GitHubButton>
        </ButtonGroup>

        <Title>
          <FaBell /> Version History
        </Title>

        <Section>
          <h2>Latest Version: 1.5 Beta</h2>
          <UpdateCard>
            <h3>Version 1.5 Beta</h3>
            <ul style={{ marginLeft: '1.5rem', paddingLeft: '0.5rem' }}>
              <li>Home Page with modern hero and live stats</li>
              <li>Themed search and filter chips for consistency</li>
              <li>Refined channel cards with improved hover interactions</li>
              <li>Badge variants for stream state (LIVE, VOD)</li>
              <li>Modal visuals aligned with global theme</li>
              <li>Added “Developed by baydd” label to Home Page</li>
            </ul>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 1.4 Beta</h3>
            <ul style={{ marginLeft: '1.5rem', paddingLeft: '0.5rem' }}>
              <li>Redesigned Grid System with improved resizing and drag-and-drop</li>
              <li>Added real-time voice communication for room participants</li>
              <li>New Channel List feature for managing multiple streams</li>
              <li>Custom Stream Sizes for individual control</li>
              <li>Performance improvements and bug fixes</li>
            </ul>
          </UpdateCard>

          <UpdateCard>
            <h3>Version 1.3 Beta</h3>
            <ul style={{ marginLeft: '1.5rem', paddingLeft: '0.5rem' }}>
              <li>Modern Participant List with avatars and badges</li>
              <li>New Room Info Card with modern styling</li>
              <li>Added support for Facebook Live, Instagram Live, DLive, and Trovo</li>
              <li>HLS Quality Selector for better streaming quality control</li>
              <li>In-Room Chat Panel for real-time messaging</li>
              <li>Fully responsive and modernized UI</li>
            </ul>
          </UpdateCard>

          <UpdateCard>
            <h3>Version 1.2 Beta</h3>
            <ul style={{ marginLeft: '1.5rem', paddingLeft: '0.5rem' }}>
              <li>Direct paste content with Ctrl+V</li>
              <li>Performance monitor tool</li>
              <li>Improved HLS link reliability</li>
              <li>Better browser resizing stability</li>
            </ul>
          </UpdateCard>

          <UpdateCard>
            <h3>Version 0.9 Beta</h3>
            <ul style={{ marginLeft: '1.5rem', paddingLeft: '0.5rem' }}>
              <li>Completely redesigned interface</li>
              <li>Update broadcast links via grids in edit mode</li>
              <li>Various bug fixes</li>
            </ul>
          </UpdateCard>
        </Section>

        <Section>
          <h2>Older Versions</h2>
          <UpdateCard>
            <h3>Version 0.8 Beta</h3>
            <p>Added Room system</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.7 Beta</h3>
            <p>Bug fixes</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.6 Beta</h3>
            <p>Save and Load System added</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.5 Beta</h3>
            <p>Twitter Dark Mode added</p>
            <p>New languages: Arabic, Spanish, Chinese, Russian, Portuguese</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.4 Beta</h3>
            <p>New Grid Edit system</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.3 Beta</h3>
            <p>Added Kick support</p>
            <p>Bug fixes</p>
          </UpdateCard>
          <UpdateCard>
            <h3>Version 0.2 Beta</h3>
            <p>Added Twitch support</p>
            <p>Grid system improvements</p>
          </UpdateCard>
        </Section>

        <Section>
          <h2>
            Coming Soon <FaRocket />
          </h2>
          <FeatureGrid>
            <FeatureCard>
              <h3>
                <FaRocket /> Multi-Device Sync
              </h3>
              <p>Synchronize your streams and settings across multiple devices in real-time.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>
                <FaRocket /> Enhanced Mobile Experience
              </h3>
              <p>Improved interface and controls for mobile devices.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>
                <FaRocket /> More Streaming Platforms
              </h3>
              <p>Adding support for additional streaming services.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>
                <FaRocket /> Advanced Analytics
              </h3>
              <p>Get detailed statistics about your streaming habits and preferences.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>
                <FaRocket /> Custom Themes
              </h3>
              <p>Create and apply your own color schemes and layouts.</p>
            </FeatureCard>
            <FeatureCard>
              <h3>
                <FaRocket /> Offline Mode
              </h3>
              <p>Record and save your favorite streams to watch offline anytime, anywhere.</p>
            </FeatureCard>
          </FeatureGrid>
        </Section>

        <Section>
          <h2>Explore More</h2>
          <FeatureGrid>
            <FeatureCard as={Link} to="/about" style={{ textDecoration: 'none' }}>
              <h3>
                <FaInfoCircle /> About Us
              </h3>
              <p>
                Learn more about multiple.live and our mission to enhance your streaming experience.
              </p>
            </FeatureCard>
            <FeatureCard as={Link} to="/features" style={{ textDecoration: 'none' }}>
              <h3>
                <FaListAlt /> Features
              </h3>
              <p>Discover all the powerful features that multiple.live has to offer.</p>
            </FeatureCard>
            <FeatureCard as={Link} to="/how-it-works" style={{ textDecoration: 'none' }}>
              <h3>
                <FaQuestionCircle /> How It Works
              </h3>
              <p>Get started with our step-by-step guide to using multiple.live.</p>
            </FeatureCard>
            <FeatureCard as={Link} to="/faq" style={{ textDecoration: 'none' }}>
              <h3>
                <FaQuestionCircle /> FAQ
              </h3>
              <p>Find answers to frequently asked questions about multiple.live.</p>
            </FeatureCard>
          </FeatureGrid>
        </Section>
      </Content>
    </PageContainer>
  );
};

export default UpdatesPage;
