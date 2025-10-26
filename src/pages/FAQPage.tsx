import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronDown, FaChevronRight, FaQuestionCircle, FaGlobe, FaTv, FaUsers, FaMobile } from 'react-icons/fa';

const FAQContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${(props) => props.theme.text};
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    color: ${(props) => props.theme.primary};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  
  p {
    font-size: 1.1rem;
    color: ${(props) => props.theme.textSecondary};
    max-width: 700px;
    margin: 0 auto;
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
  
  input {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: 2px solid ${(props) => props.theme.border};
    background: ${(props) => props.theme.cardBackground};
    color: ${(props) => props.theme.text};
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primary};
      box-shadow: 0 0 0 3px ${(props) => props.theme.primary}40;
    }
    
    &::placeholder {
      color: ${(props) => props.theme.textSecondary};
      opacity: 0.7;
    }
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  button {
    background: ${(props) => props.theme.cardBackground};
    border: 1px solid ${(props) => props.theme.border};
    color: ${(props) => props.theme.text};
    padding: 0.5rem 1.25rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover, &.active {
      background: ${(props) => props.theme.primary};
      color: white;
      border-color: ${(props) => props.theme.primary};
    }
    
    svg {
      font-size: 0.9em;
    }
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const FAQItem = styled.div`
  background: ${(props) => props.theme.cardBackground};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &.active {
    box-shadow: 0 5px 15px ${(props) => props.theme.shadow || 'rgba(0,0,0,0.1)'};
  }
  
  .question {
    padding: 1.25rem 1.5rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    user-select: none;
    
    &:hover {
      background: ${(props) => props.theme.background};
    }
    
    svg {
      transition: transform 0.2s ease;
      color: ${(props) => props.theme.primary};
    }
    
    &.active {
      svg {
        transform: rotate(180deg);
      }
    }
  }
  
  .answer {
    padding: 0 1.5rem;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    color: ${(props) => props.theme.textSecondary};
    line-height: 1.7;
    
    p {
      margin: 0 0 1rem 0;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    &.active {
      padding: 0 1.5rem 1.5rem;
      max-height: 1000px;
    }
  }
`;

const ContactSection = styled.section`
  background: ${(props) => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  
  h2 {
    color: ${(props) => props.theme.primary};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  p {
    color: ${(props) => props.theme.textSecondary};
    margin-bottom: 1.5rem;
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

type FAQItemType = {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
  icon?: React.ReactNode;
};

const FAQPage: React.FC = () => {
  const [activeItems, setActiveItems] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    document.title = 'FAQ - multiple.live | Frequently Asked Questions';
  }, []);

  const toggleItem = (id: string) => {
    setActiveItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqItems: FAQItemType[] = [
    {
      id: 'what-is',
      question: 'What is multiple.live?',
      answer: (
        <p>multiple.live is a web-based platform that allows you to watch multiple live streams simultaneously in a single, customizable interface. It's perfect for content creators, esports fans, and anyone who wants to keep up with multiple live events at once.</p>
      ),
      category: 'general',
      icon: <FaQuestionCircle />
    },
    {
      id: 'how-to-add',
      question: 'How do I add streams?',
      answer: (
        <div>
          <p>To add a stream:</p>
          <ol>
            <li>Click the "+" button or the "Add Stream" button</li>
            <li>Enter the stream URL or channel name</li>
            <li>Click "Add" or press Enter</li>
          </ol>
          <p>You can add streams from various platforms including Twitch, YouTube, and more.</p>
        </div>
      ),
      category: 'getting-started',
      icon: <FaTv />
    },
    {
      id: 'supported-platforms',
      question: 'Which streaming platforms are supported?',
      answer: (
        <div>
          <p>multiple.live supports most major streaming platforms including:</p>
          <ul>
            <li>Twitch</li>
            <li>YouTube Live</li>
            <li>Facebook Gaming</li>
            <li>And other platforms that support HLS or DASH streaming</li>
          </ul>
        </div>
      ),
      category: 'features',
      icon: <FaGlobe />
    },
    {
      id: 'watch-together',
      question: 'How does the Watch Together feature work?',
      answer: (
        <div>
          <p>The Watch Together feature allows you to:</p>
          <ul>
            <li>Create a private room</li>
            <li>Invite friends with a shareable link</li>
            <li>Synchronize playback across all participants</li>
            <li>Chat in real-time</li>
          </ul>
          <p>All streams in the room will be perfectly synchronized for all participants.</p>
        </div>
      ),
      category: 'features',
      icon: <FaUsers />
    },
    {
      id: 'mobile-support',
      question: 'Is there a mobile app?',
      answer: (
        <div>
          <p>multiple.live is a Progressive Web App (PWA), which means you can add it to your home screen and use it like a native app. While there isn't a dedicated app store app, the web version is fully optimized for mobile devices.</p>
          <p>To add to home screen:</p>
          <ol>
            <li>Open multiple.live in your mobile browser</li>
            <li>Tap the share button (iOS) or menu button (Android)</li>
            <li>Select "Add to Home Screen"</li>
          </ol>
        </div>
      ),
      category: 'mobile',
      icon: <FaMobile />
    },
    {
      id: 'privacy',
      question: 'Is my data private?',
      answer: (
        <div>
          <p>Yes, we take your privacy seriously. multiple.live processes all streams client-side, meaning:</p>
          <ul>
            <li>We don't store your stream data on our servers</li>
            <li>No account or personal information is required to use the basic features</li>
            <li>We don't track your viewing habits</li>
          </ul>
          <p>For more information, please see our <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
      ),
      category: 'general',
      icon: <FaQuestionCircle />
    },
    {
      id: 'keyboard-shortcuts',
      question: 'What keyboard shortcuts are available?',
      answer: (
        <div>
          <p>multiple.live supports several keyboard shortcuts for better navigation:</p>
          <ul>
            <li><strong>Space</strong>: Play/Pause all streams</li>
            <li><strong>M</strong>: Mute/Unmute all streams</li>
            <li><strong>F</strong>: Toggle fullscreen</li>
            <li><strong>E</strong>: Toggle edit mode</li>
            <li><strong>Esc</strong>: Exit fullscreen/close modals</li>
          </ul>
          <p>Press <strong>?</strong> while using the app to see all available shortcuts.</p>
        </div>
      ),
      category: 'features',
      icon: <FaQuestionCircle />
    },
    {
      id: 'troubleshooting',
      question: 'A stream isn\'t loading. What should I do?',
      answer: (
        <div>
          <p>If a stream isn't loading, try these troubleshooting steps:</p>
          <ol>
            <li>Check your internet connection</li>
            <li>Make sure the stream URL is correct and the stream is live</li>
            <li>Try refreshing the page</li>
            <li>Check if the stream works directly on the source platform</li>
            <li>Try using a different browser or device</li>
          </ol>
          <p>If the problem persists, please contact our support team with details about the issue.</p>
        </div>
      ),
      category: 'troubleshooting',
      icon: <FaQuestionCircle />
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: <FaQuestionCircle /> },
    { id: 'getting-started', name: 'Getting Started', icon: <FaTv /> },
    { id: 'features', name: 'Features', icon: <FaGlobe /> },
    { id: 'mobile', name: 'Mobile', icon: <FaMobile /> },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <FaQuestionCircle /> },
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <FAQContainer>
      <Header>
        <h1><FaQuestionCircle /> Frequently Asked Questions</h1>
        <p>Find answers to common questions about using multiple.live</p>
      </Header>

      <SearchContainer>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <CategoryTabs>
        {categories.map(category => (
          <button
            key={category.id}
            className={activeCategory === category.id ? 'active' : ''}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </CategoryTabs>

      <FAQList>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <FAQItem key={item.id} className={activeItems[item.id] ? 'active' : ''}>
              <div 
                className={`question ${activeItems[item.id] ? 'active' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <span>{item.question}</span>
                <FaChevronDown />
              </div>
              <div className={`answer ${activeItems[item.id] ? 'active' : ''}`}>
                {item.answer}
              </div>
            </FAQItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No questions found matching your search. Try different keywords or check back later.
          </div>
        )}
      </FAQList>

      <ContactSection>
        <h2>Still have questions?</h2>
        <p>Can't find the answer you're looking for? Our support team is here to help.</p>
        <CTAButton to="/contact">Contact Support</CTAButton>
      </ContactSection>
    </FAQContainer>
  );
};

export default FAQPage;
