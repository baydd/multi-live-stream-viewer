import { watchTogetherService } from './watchTogetherService';

type PeerState =
  | 'new'
  | 'setting-local-offer'
  | 'have-local-offer'
  | 'have-remote-offer'
  | 'stable'
  | 'closed';

export type VoicePeer = {
  pc: RTCPeerConnection;
  audioEl: HTMLAudioElement;
  stream?: MediaStream;
  connectionState: PeerState;
  pendingCandidates?: RTCIceCandidateInit[];
};

export class VoiceService {
  private localStream: MediaStream | null = null;
  private peers: Map<string, VoicePeer> = new Map();
  private roomCode: string | null = null;
  private isMicEnabled = false;
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
  ];
  private audioContext: AudioContext | null = null;

  async join(roomCode: string) {
    this.roomCode = roomCode;
    const socket = watchTogetherService.getSocket();
    if (!socket) throw new Error('Socket yok');

    socket.off('voice:peer-joined');
    socket.off('voice:peer-left');
    socket.off('voice:offer');
    socket.off('voice:answer');
    socket.off('voice:candidate');

    socket.on('voice:peer-joined', ({ userId }) => {
      const me = socket.id;
      if (userId === me) return;
      this.createOffer(userId).catch(console.error);
    });

    socket.on('voice:peer-left', ({ userId }) => {
      this.cleanupPeer(userId);
    });

    socket.on('voice:offer', async ({ fromUserId, sdp }) => {
      await this.handleOffer(fromUserId, sdp);
    });

    socket.on('voice:answer', async ({ fromUserId, sdp }) => {
      console.log(
        `Received answer from ${fromUserId} in state:`,
        this.peers.get(fromUserId)?.connectionState || 'no peer'
      );

      const peer = this.peers.get(fromUserId);
      if (!peer) {
        console.log('Received answer from unknown peer:', fromUserId);
        return;
      }

      // Skip if we're already stable and the SDP matches
      if (peer.connectionState === 'stable') {
        const currentRemoteDesc = peer.pc.remoteDescription?.sdp || '';
        const newRemoteDesc = sdp.sdp || '';

        if (currentRemoteDesc === newRemoteDesc) {
          console.log('Already have the same remote description, ignoring duplicate answer');
          return;
        }

        // If we're stable but the SDP is different, we need to handle this as a renegotiation
        console.log('Stable connection but different SDP, handling as renegotiation');
      }

      try {
        // Check if we're in a state where we can accept an answer
        const canAcceptAnswer = ['have-local-offer', 'have-remote-offer', 'stable'].includes(
          peer.connectionState
        );

        if (!canAcceptAnswer) {
          console.log(`Cannot accept answer in state: ${peer.connectionState}`);
          return;
        }

        console.log(`Setting remote description for answer from ${fromUserId}`);

        // Create a new RTCSessionDescription object
        const answer = new RTCSessionDescription(sdp);

        // Set remote description with the answer
        try {
          await peer.pc.setRemoteDescription(answer);
          peer.connectionState = 'stable';
          console.log(`Successfully set remote description for answer from ${fromUserId}`);
          const queue = peer.pendingCandidates || [];
          peer.pendingCandidates = [];
          for (const c of queue) {
            try { await peer.pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
          }
        } catch (setDescError) {
          // If we get a state error, try to recover by rolling back the local description
          if (setDescError instanceof Error && setDescError.name === 'InvalidStateError') {
            console.log('Recovering from InvalidStateError, rolling back local description');
            try {
              // Rollback local description and try again
              await peer.pc.setLocalDescription({ type: 'rollback' });
              await peer.pc.setRemoteDescription(answer);
              peer.connectionState = 'stable';
              console.log('Successfully recovered and set remote description');
              const queue = peer.pendingCandidates || [];
              peer.pendingCandidates = [];
              for (const c of queue) {
                try { await peer.pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
              }
            } catch (recoveryError) {
              console.error('Failed to recover from InvalidStateError:', recoveryError);
              throw recoveryError; // Re-throw to be caught by the outer catch
            }
          } else {
            throw setDescError; // Re-throw other errors
          }
        }
      } catch (error) {
        console.error('Error setting remote description (answer):', error);
        // Don't immediately clean up, as this might be a temporary issue
        // The connection state change handler will handle cleanup if needed
      }
    });

    socket.on('voice:candidate', async ({ fromUserId, candidate }) => {
      const peer = this.peers.get(fromUserId);
      if (!peer) return;
      try {
        if (!peer.pc.remoteDescription) {
          peer.pendingCandidates = peer.pendingCandidates || [];
          peer.pendingCandidates.push(candidate);
          return;
        }
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('ICE candidate eklenemedi', e);
      }
    });

    const res = await new Promise<any>((resolve, reject) => {
      socket.emit('voice:join', { roomCode }, (res: any) => {
        if (res?.error) reject(new Error(res.error));
        else resolve(res);
      });
    });
    if (res?.iceServers && Array.isArray(res.iceServers)) {
      this.iceServers = res.iceServers as RTCIceServer[];
    }
    console.log('Sesli sohbete katılındı:', roomCode);
  }

  async leave() {
    const socket = watchTogetherService.getSocket();
    if (this.roomCode && socket) {
      socket.emit('voice:leave', { roomCode: this.roomCode });
      socket.off('voice:peer-joined');
      socket.off('voice:peer-left');
      socket.off('voice:offer');
      socket.off('voice:answer');
      socket.off('voice:candidate');
    }
    this.disableMic();
    // Tüm peerleri temizle
    Array.from(this.peers.keys()).forEach((id) => this.cleanupPeer(id));
    this.peers.clear();
    this.roomCode = null;
  }

  async enableMic() {
    if (this.isMicEnabled) return;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      this.isMicEnabled = true;
      // Var olan tüm bağlantılara local track ekle
      this.peers.forEach(({ pc }) => {
        this.localStream!.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
      });
    } catch (e) {
      console.error('Mikrofon açılamadı', e);
      throw e;
    }
  }

  disableMic() {
    if (!this.isMicEnabled) return;
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.isMicEnabled = false;
    // Yeni offer/answer döngüsüne gerek yok; mevcut peerler ses almayı durdurur.
  }

  private createPeerConnection(targetUserId: string): VoicePeer {
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceCandidatePoolSize: 10,
    });

    try {
      pc.addTransceiver('audio', { direction: 'recvonly' });
    } catch {}

    // Add connection state change handler
    pc.onconnectionstatechange = () => {
      console.log(`Connection state changed for ${targetUserId}:`, pc.connectionState);

      // If connection fails, clean up
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        console.log(`Connection ${pc.connectionState} for peer ${targetUserId}, cleaning up...`);
        this.cleanupPeer(targetUserId);
      }
    };

    // Add signaling state change handler
    pc.onsignalingstatechange = () => {
      console.log(`Signaling state changed for ${targetUserId}:`, pc.signalingState);
    };

    const audioEl = new Audio();
    audioEl.autoplay = true;
    // playsInline TS tiplerinde yok; attribute olarak ekleyelim
    try {
      (audioEl as any).playsInline = true;
    } catch {}
    audioEl.setAttribute('playsinline', 'true');
    audioEl.muted = false;
    // Audio elementini DOM'a ekle (gizli bir container yoksa body'e ekleyelim)
    try {
      if (!audioEl.isConnected) {
        document.body.appendChild(audioEl);
      }
    } catch {}

    // Remote track geldiğinde ses elementine bağla ve çalmayı dene
    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      audioEl.srcObject = stream;
      const p = audioEl.play();
      if (p && typeof p.then === 'function') {
        p.catch((err: any) => {
          console.warn('Audio play engellendi veya başarısız oldu:', err);
        });
      }
    };

    // ICE adaylarını gönder
    pc.onicecandidate = (ev) => {
      if (ev.candidate && this.roomCode) {
        watchTogetherService.getSocket()?.emit('voice:candidate', {
          roomCode: this.roomCode,
          targetUserId,
          candidate: ev.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Voice PC state', targetUserId, pc.connectionState);
    };

    // Mevcut mikrofon açıksa track ekle
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
    }

    const peer: VoicePeer = {
      pc,
      audioEl,
      connectionState: 'new',
      pendingCandidates: [],
    };
    this.peers.set(targetUserId, peer);
    return peer;
  }

  private async createOffer(targetUserId: string) {
    if (!this.roomCode) return;

    try {
      let peer = this.peers.get(targetUserId);
      if (!peer) {
        peer = this.createPeerConnection(targetUserId);
      } else if (peer.connectionState === 'setting-local-offer') {
        return;
      }

      // Skip if we're already processing an offer for this peer
      if (
        peer.connectionState === 'setting-local-offer'
      ) {
        console.log('Already processing an offer for', targetUserId);
        return;
      }

      peer.connectionState = 'have-local-offer';

      try {
        // Create the offer
        const offer = await peer.pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });

        // Set local description before sending the offer
        await peer.pc.setLocalDescription(offer);

        // Send the offer to the other peer
        watchTogetherService.getSocket()?.emit('voice:offer', {
          roomCode: this.roomCode,
          targetUserId,
          sdp: offer,
        });
      } catch (error) {
        console.error('Error creating offer:', error);
        peer.connectionState = 'closed';
        this.cleanupPeer(targetUserId);
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  private async handleOffer(fromUserId: string, sdp: any) {
    if (!this.roomCode) return;

    console.log(
      `Handling offer from ${fromUserId} in state:`,
      this.peers.get(fromUserId)?.connectionState || 'no peer'
    );

    try {
      let peer = this.peers.get(fromUserId);
      if (!peer) {
        console.log(`Creating new peer connection for ${fromUserId}`);
        peer = this.createPeerConnection(fromUserId);
      } else if (peer.connectionState === 'stable') {
        // Check if this is a renegotiation attempt
        const currentRemoteDesc = peer.pc.remoteDescription?.sdp || '';
        const newRemoteDesc = sdp.sdp || '';

        if (currentRemoteDesc === newRemoteDesc) {
          console.log('Already have the same remote description, ignoring duplicate offer');
          return;
        }

        console.log('Stable connection but different SDP, handling as renegotiation');
      }

      // Skip if we're already processing an offer for this peer
      if (
        ['have-remote-offer', 'setting-local-offer', 'have-local-offer'].includes(
          peer.connectionState
        )
      ) {
        console.log(
          `Already processing an offer/answer for ${fromUserId} in state:`,
          peer.connectionState
        );
        return;
      }

      const originalState = peer.connectionState;
      peer.connectionState = 'have-remote-offer';

      try {
        // Create a new RTCSessionDescription object
        const offer = new RTCSessionDescription(sdp);

        // Set remote description first
        await peer.pc.setRemoteDescription(offer);

        // Create answer
        const answer = await peer.pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });

        // Set local description with the answer
        peer.connectionState = 'setting-local-offer';
        await peer.pc.setLocalDescription(answer);

        // Only mark as stable after everything is set up
        peer.connectionState = 'stable';

        // Send the answer back to the peer
        watchTogetherService.getSocket()?.emit('voice:answer', {
          roomCode: this.roomCode,
          targetUserId: fromUserId,
          sdp: answer,
        });

        console.log(`Successfully handled offer from ${fromUserId}`);
      } catch (error) {
        console.error('Error handling offer:', error);

        // Try to recover by rolling back to the original state
        try {
          if (error instanceof Error && error.name === 'InvalidStateError') {
            console.log('Attempting to recover from InvalidStateError');
            await peer.pc.setLocalDescription({ type: 'rollback' });

            // If we had a previous state, try to restore it
            if (originalState) {
              peer.connectionState = originalState;
            }

            // If we're still having issues, clean up and recreate the peer
            if (peer.pc.signalingState === 'have-remote-offer') {
              console.log('Recovery failed, cleaning up and recreating peer');
              this.cleanupPeer(fromUserId);

              // Create a new peer and retry the offer
              setTimeout(() => {
                this.handleOffer(fromUserId, sdp).catch(console.error);
              }, 100);
              return;
            }
          }

          // If we get here, recovery failed or it wasn't an InvalidStateError
          throw error;
        } catch (recoveryError) {
          console.error('Failed to recover from error:', recoveryError);
          peer.connectionState = 'closed';
          this.cleanupPeer(fromUserId);
        }
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
      // The connection state change handler will handle cleanup if needed
    }
  }

  private cleanupPeer(userId: string) {
    const peer = this.peers.get(userId);
    if (!peer) return;

    console.log(`Cleaning up peer connection for user: ${userId}`);

    // Remove from peers map first to prevent race conditions
    this.peers.delete(userId);

    // Close the peer connection in a timeout to prevent blocking
    setTimeout(() => {
      try {
        // Remove all event handlers
        peer.pc.ontrack = null;
        peer.pc.onicecandidate = null;
        peer.pc.onconnectionstatechange = null;
        peer.pc.onsignalingstatechange = null;
        peer.pc.oniceconnectionstatechange = null;
        peer.pc.onicegatheringstatechange = null;
        peer.pc.onnegotiationneeded = null;

        // Close the peer connection if not already closed
        if (peer.pc.connectionState !== 'closed') {
          try {
            peer.pc.close();
          } catch (e) {
            console.error('Error closing peer connection:', e);
          }
        }
      } catch (error) {
        console.error('Error while cleaning up peer connection:', error);
      }

      // Clean up audio element in the next tick
      setTimeout(() => {
        try {
          if (peer.audioEl) {
            peer.audioEl.pause();
            peer.audioEl.srcObject = null;
            if (peer.audioEl.parentElement) {
              peer.audioEl.parentElement.removeChild(peer.audioEl);
            }
          }
        } catch (error) {
          console.error('Error while cleaning up audio element:', error);
        }

        console.log(`Peer connection for user ${userId} fully cleaned up`);
      }, 0);
    }, 0);
  }

  async resumeAudio() {
    if (!this.audioContext) {
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctx) this.audioContext = new Ctx();
      } catch {}
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try { await this.audioContext.resume(); } catch {}
    }
    this.peers.forEach((peer) => {
      try {
        peer.audioEl.muted = false;
        const p = peer.audioEl.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      } catch {}
    });
  }
}

export const voiceService = new VoiceService();
