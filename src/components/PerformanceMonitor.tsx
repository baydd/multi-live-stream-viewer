import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChartLine, FaMemory, FaClock, FaWifi } from 'react-icons/fa';

interface PerformanceStats {
  fps: number;
  memory: number;
  latency: number;
  bandwidth: number;
}

interface NetworkInformation {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
}

const getConnection = (): NetworkInformation | null => {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as any;
  return nav?.connection || nav?.mozConnection || nav?.webkitConnection || null;
};

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

  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lagTimeoutRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastSampleRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const lagRef = useRef(0);

  useEffect(() => {
    if (!visible || typeof window === 'undefined' || typeof performance === 'undefined') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (lagTimeoutRef.current) {
        clearTimeout(lagTimeoutRef.current);
        lagTimeoutRef.current = null;
      }
      return;
    }

    frameCountRef.current = 0;
    lastSampleRef.current = performance.now();

    const measureFrames = () => {
      frameCountRef.current += 1;
      rafRef.current = requestAnimationFrame(measureFrames);
    };

    const sampleStats = () => {
      const now = performance.now();
      const elapsed = now - lastSampleRef.current;
      const fps = elapsed > 0 ? Math.round((frameCountRef.current * 1000) / elapsed) : 0;
      frameCountRef.current = 0;
      lastSampleRef.current = now;

      const memory = (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        : 0;

      const connection = getConnection();
      const latencyCandidate = connection?.rtt;
      const latency =
        typeof latencyCandidate === 'number' && latencyCandidate > 0
          ? Math.round(latencyCandidate)
          : Math.round(lagRef.current);

      let bandwidth = 0;
      if (typeof connection?.downlink === 'number') {
        bandwidth = Math.max(0, Math.round(connection.downlink * 10) / 10); // Mbps
      } else if (connection?.effectiveType) {
        const map: Record<string, number> = {
          'slow-2g': 0.025,
          '2g': 0.1,
          '3g': 1.5,
          '4g': 5,
        };
        bandwidth = map[connection.effectiveType] || 0.5;
      }

      setStats({ fps, memory, latency, bandwidth });
    };

    const measureEventLoopLag = () => {
      const interval = 250;
      let expected = performance.now() + interval;

      const tick = () => {
        const now = performance.now();
        const drift = now - expected;
        lagRef.current = Math.max(0, drift);
        expected = now + interval;
        lagTimeoutRef.current = window.setTimeout(tick, interval);
      };

      lagTimeoutRef.current = window.setTimeout(tick, interval);
    };

    measureFrames();
    sampleStats();
    measureEventLoopLag();

    intervalRef.current = window.setInterval(sampleStats, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        frameCountRef.current = 0;
        lastSampleRef.current = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (lagTimeoutRef.current) {
        clearTimeout(lagTimeoutRef.current);
        lagTimeoutRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        <span className="unit">Mbps</span>
      </Stat>
    </MonitorContainer>
  );
};

export default PerformanceMonitor;
