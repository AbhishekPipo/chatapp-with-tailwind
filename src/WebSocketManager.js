// WebSocketManager.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useWebSocket(url) {
  const socket = ref(null);
  const isConnected = ref(false);
  const error = ref(null);

  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      error.value = null;
    };

    socket.value.onclose = () => {
      isConnected.value = false;
    };

    socket.value.onerror = (e) => {
      error.value = e;
      console.error('WebSocket error:', e);
    };
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
    }
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect
  };
}
