import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketManager {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(onConnectCallback, onErrorCallback) {
    if (this.client && this.connected) {
      return;
    }

    // Configure STOMP over SockJS
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      if (onConnectCallback) {
        onConnectCallback(frame);
      }
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      if (onErrorCallback) {
        onErrorCallback(frame);
      }
    };

    this.client.onDisconnect = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  subscribe(topic, onMessageCallback) {
    if (!this.client || !this.connected) {
      console.warn('Cannot subscribe: STOMP client not connected.');
      return null;
    }

    return this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        onMessageCallback(payload);
      } catch (err) {
        console.error('Failed to parse websocket message body:', err);
      }
    });
  }

  send(destination, payload) {
    if (!this.client || !this.connected) {
      console.warn('Cannot send: STOMP client not connected.');
      return;
    }

    this.client.publish({
      destination: destination,
      body: JSON.stringify(payload),
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.client = null;
    }
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
