type ChatWidgetEvent = 'open_chat' | 'close_chat';

type EventHandler = (data?: any) => void;

class ChatWidgetBus {
    private listeners: Record<string, EventHandler[]> = {};

    on(event: ChatWidgetEvent, handler: EventHandler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    off(event: ChatWidgetEvent, handler: EventHandler) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }

    emit(event: ChatWidgetEvent, data?: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(handler => handler(data));
    }
}

export const chatWidgetBus = new ChatWidgetBus();
