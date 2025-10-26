import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaMemory, FaClock, FaWifi } from 'react-icons/fa';

interface PerformanceStats {
  fps: number;
  memory: number;
  latency: number;
  bandwidth: number;
}

const MonitorContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: ${(props) => props.theme.cardBackground}ee;
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  padding: 12px;
  display: ${(props) => (props.visible ? 'flex' : 'none')};
  gap: 16px;
  z-index: 100;
  box-shadow: ${(props) => props.theme.shadowLg};
  font-size: 0.75rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${(props) => props.theme.text};

  .icon {
    color: ${(props) => props.theme.primary};
  }

  .value {
    font-weight: 600;
  }

  .unit {
    opacity: 0.7;
  }
`;

const PerformanceMonitor: React.FC<{ visible: boolean }> = ({ visible }) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memory: 0,
    latency: 0,
    bandwidth: 0,
  });

  useEffect(() => {
    if (!visible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateStats = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        // Get memory usage (if available)
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        // Simulate latency and bandwidth (in real app, these would come from actual measurements)
        const latency = Math.round(Math.random() * 50 + 10);
        const bandwidth = Math.round(Math.random() * 100 + 50);

        setStats({ fps, memory, latency, bandwidth });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(updateStats);
    };

    animationId = requestAnimationFrame(updateStats);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [visible]);

  return (
    <MonitorContainer visible={visible}>
      <Stat>
        <FaChartLine className="icon" />
        <span className="value">{stats.fps}</span>
        <span className="unit">FPS</span>
      </Stat>

      {stats.memory > 0 && (
        <Stat>
          <FaMemory className="icon" />
          <span className="value">{stats.memory}</span>
          <span className="unit">MB</span>
        </Stat>
      )}

      <Stat>
        <FaClock className="icon" />
        <span className="value">{stats.latency}</span>
        <span className="unit">ms</span>
      </Stat>

      <Stat>
        <FaWifi className="icon" />
        <span className="value">{stats.bandwidth}</span>
        <span className="unit">%</span>
      </Stat>
    </MonitorContainer>
  );
};

export default PerformanceMonitor;
