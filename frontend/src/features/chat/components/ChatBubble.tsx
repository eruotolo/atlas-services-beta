'use client';

interface ChatBubbleProps {
    text: string;
    date: Date;
    isOwn: boolean;
    read: boolean;
}

export default function ChatBubble({ text, date, isOwn, read }: ChatBubbleProps) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                        ? 'rounded-br-md bg-brand text-white'
                        : 'rounded-bl-md bg-tint text-ink'
                }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                <div
                    className={`mt-1 flex items-center gap-1 text-[10px] ${
                        isOwn
                            ? 'justify-end text-white/60'
                            : 'text-muted'
                    }`}
                >
                    <span>
                        {date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && (
                        <span>{read ? '✓✓' : '✓'}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
