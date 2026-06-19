import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hireeo.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Permitir todos los user-agents por defecto
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            // Permisos explícitos para AI crawlers (GEO - Generative Engine Optimization)
            {
                userAgent: 'GPTBot', // OpenAI ChatGPT
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'ChatGPT-User', // ChatGPT web browsing
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'Google-Extended', // Google Gemini/Bard training
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'ClaudeBot', // Anthropic Claude
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'PerplexityBot', // Perplexity AI
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'Applebot-Extended', // Apple Intelligence
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'CCBot', // Common Crawl (usado por varios LLMs)
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'Omgilibot', // Omgili (usado por Perplexity)
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
            {
                userAgent: 'FacebookBot', // Meta AI
                allow: '/',
                disallow: ['/admin/', '/profile/', '/api/'],
            },
        ],
        sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/llms.txt`],
    };
}
