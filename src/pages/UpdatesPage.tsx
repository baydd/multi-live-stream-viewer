import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBell, FaGithub } from 'react-icons/fa';

const Page = styled.div`
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  background: ${(p) => p.theme.background};
  color: ${(p) => p.theme.text};
  padding: 2rem 1rem;
`;

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const TopActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.cardBackground};
  color: ${(p) => p.theme.text};
  cursor: pointer;
  font-weight: 600;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.cardBackground};
  color: ${(p) => p.theme.text};
  text-decoration: none;
  font-weight: 600;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Section = styled.section`
  margin: 1.25rem 0;
`;

const Card = styled.div`
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.cardBackground};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const SmallTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const UpdatesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  useEffect(() => {
    document.title = 'Updates - multiple.live';
  }, []);

  return (
    <Page>
      <Container>
        <TopBar>
          <Title>
            <FaBell /> Updates
          </Title>
          <TopActions>
            <TextButton onClick={onBack}>
              <FaArrowLeft /> Back
            </TextButton>
            <LinkButton
              href="https://github.com/baydd/multi-live-stream-viewer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub /> GitHub
            </LinkButton>
          </TopActions>
        </TopBar>

        <Section>
          <Card>
            <SmallTitle>Version 1.5 Beta</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Home Page with modern hero and live stats</li>
              <li>Themed search and filter chips for consistency</li>
              <li>Refined channel cards with improved hover interactions</li>
              <li>Badge variants for stream state (LIVE, VOD)</li>
              <li>Modal visuals aligned with global theme</li>
              <li>Added “Developed by baydd” label to Home Page</li>
            </ul>
          </Card>

          <Card>
            <SmallTitle>Version 1.4 Beta</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Redesigned Grid System with improved resizing and drag-and-drop</li>
              <li>Added real-time voice communication for room participants</li>
              <li>New Channel List feature for managing multiple streams</li>
              <li>Custom Stream Sizes for individual control</li>
              <li>Performance improvements and bug fixes</li>
            </ul>
          </Card>

          <Card>
            <SmallTitle>Version 1.3 Beta</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Modern Participant List with avatars and badges</li>
              <li>New Room Info Card with modern styling</li>
              <li>Added support for Facebook Live, Instagram Live, DLive, and Trovo</li>
              <li>HLS Quality Selector for better streaming quality control</li>
              <li>In-Room Chat Panel for real-time messaging</li>
              <li>Fully responsive and modernized UI</li>
            </ul>
          </Card>

          <Card>
            <SmallTitle>Version 1.2 Beta</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Direct paste content with Ctrl+V</li>
              <li>Performance monitor tool</li>
              <li>Improved HLS link reliability</li>
              <li>Better browser resizing stability</li>
            </ul>
          </Card>

          <Card>
            <SmallTitle>Version 0.9 Beta</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Completely redesigned interface</li>
              <li>Update broadcast links via grids in edit mode</li>
              <li>Various bug fixes</li>
            </ul>
          </Card>
        </Section>

        <Section>
          <Card>
            <SmallTitle>Older Versions</SmallTitle>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>0.8 Beta — Added Room system</li>
              <li>0.7 Beta — Bug fixes</li>
              <li>0.6 Beta — Save and Load System added</li>
              <li>0.5 Beta — Twitter Dark Mode; new languages</li>
              <li>0.4 Beta — New Grid Edit system</li>
              <li>0.3 Beta — Added Kick support</li>
              <li>0.2 Beta — Added Twitch support; grid improvements</li>
            </ul>
          </Card>
        </Section>
      </Container>
    </Page>
  );
};

export default UpdatesPage;
