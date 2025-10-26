import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaList, FaSlidersH, FaUsers, FaPlay, FaMobile, FaDesktop, FaQuestionCircle } from 'react-icons/fa';

const HowItWorksContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${(props) => props.theme.text};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  
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

const Step = styled.div`
  display: flex;
  margin-bottom: 3rem;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-number {
    background: ${(props) => props.theme.primary};
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-right: 1.5rem;
    margin-top: 0.5rem;
    
    @media (max-width: 768px) {
      margin: 0 0 1rem 0;
    }
  }
  
  .step-content {
    flex: 1;
    
    h2 {
      color: ${(props) => props.theme.primary};
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      @media (max-width: 768px) {
        justify-content: center;
      }
    }
    
    p {
      color: ${(props) => props.theme.textSecondary};
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
    
    .step-image {
      background: ${(props) => props.theme.cardBackground};
      border-radius: 10px;
      padding: 1.5rem;
      border: 1px solid ${(props) => props.theme.border};
      margin-top: 1rem;
      text-align: center;
      
      img {
        max-width: 100%;
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      
      .image-placeholder {
        background: ${(props) => props.theme.background};
        border: 2px dashed ${(props) => props.theme.border};
        border-radius: 6px;
        padding: 3rem 2rem;
        color: ${(props) => props.theme.textSecondary};
        font-style: italic;
      }
    }
  }
  
  &:nth-child(even) {
    flex-direction: row-reverse;
    
    .step-number {
      margin-right: 0;
      margin-left: 1.5rem;
      
      @media (max-width: 768px) {
        margin: 0 0 1rem 0;
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
`;

const TipsSection = styled.section`
  background: ${(props) => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  margin: 4rem 0;
  border: 1px solid ${(props) => props.theme.border};
  
  h2 {
    color: ${(props) => props.theme.primary};
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    
    .tip {
      background: ${(props) => props.theme.background};
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid ${(props) => props.theme.primary};
      
      h3 {
        color: ${(props) => props.theme.text};
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      p {
        color: ${(props) => props.theme.textSecondary};
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.6;
      }
    }
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

const HowItWorksPage: React.FC = () => {
  useEffect(() => {
    document.title = 'How It Works - multiple.live | Get Started Guide';
  }, []);

  return (
    <HowItWorksContainer>
      <Header>
        <h1>How multiple.live Works</h1>
        <p>Get started with our step-by-step guide to watching multiple streams simultaneously</p>
      </Header>

      <Step>
        <div className="step-number">1</div>
        <div className="step-content">
          <h2><FaPlus /> Add Your Streams</h2>
          <p>
            Start by adding the streams you want to watch. You can add streams from various platforms 
            including Twitch, YouTube, and more. Simply paste the stream URL or channel name, and 
            multiple.live will handle the rest.
          </p>
          <div className="step-image">
            <div className="image-placeholder">Screenshot of adding streams interface</div>
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-number">2</div>
        <div className="step-content">
          <h2><FaSlidersH /> Customize Your Layout</h2>
          <p>
            Arrange your streams in a grid that works for you. Resize and position each stream window 
            by dragging the corners. Save your favorite layouts for quick access later.
          </p>
          <div className="step-image">
            <div className="image-placeholder">Screenshot of layout customization</div>
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-number">3</div>
        <div className="step-content">
          <h2><FaUsers /> Watch with Friends (Optional)</h2>
          <p>
            Create a watch party and invite friends to join your synchronized viewing experience. 
            Chat with friends while watching, and control playback for everyone in the room.
          </p>
          <div className="step-image">
            <div className="image-placeholder">Screenshot of watch together feature</div>
          </div>
        </div>
      </Step>

      <Step>
        <div className="step-number">4</div>
        <div className="step-content">
          <h2><FaPlay /> Enjoy Your Streams</h2>
          <p>
            That's it! Sit back and enjoy your favorite streams all in one place. Use the controls 
            to adjust volume, quality, and other settings for each stream individually.
          </p>
          <div className="step-image">
            <div className="image-placeholder">Screenshot of multiple streams playing</div>
          </div>
        </div>
      </Step>

      <TipsSection>
        <h2><FaQuestionCircle /> Pro Tips</h2>
        <div className="tips-grid">
          <div className="tip">
            <h3><FaDesktop /> Keyboard Shortcuts</h3>
            <p>Use keyboard shortcuts for quick navigation. Press '?' to see all available shortcuts.</p>
          </div>
          <div className="tip">
            <h3><FaMobile /> Mobile Friendly</h3>
            <p>Access multiple.live on your mobile device. The interface adapts to your screen size.</p>
          </div>
          <div className="tip">
            <h3><FaList /> Save Presets</h3>
            <p>Save your favorite stream combinations as presets for quick access later.</p>
          </div>
        </div>
      </TipsSection>

      <CTA>
        <h2>Ready to Start Streaming?</h2>
        <p>Join thousands of users who are already enjoying multiple.live. No downloads required, start watching instantly.</p>
        <CTAButton to="/app">Start Watching Now</CTAButton>
      </CTA>
    </HowItWorksContainer>
  );
};

export default HowItWorksPage;
