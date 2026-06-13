'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import Link from 'next/link';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';
import type { Service } from '@/shared/types/common';
import { HeroSearchBar } from './HeroSearchBar';
import { HeroCountrySelector } from './HeroCountrySelector';
import { HomeCategories } from './HomeCategories';

interface HeroHireeoSectionProps {
    country: string;
    dict: Dictionary;
    previewServices: readonly Service[];
}

function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const canvas: HTMLCanvasElement = canvasEl;

        const ctx2d = canvas.getContext('2d');
        if (!ctx2d) return;
        const ctx: CanvasRenderingContext2D = ctx2d;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const mouse = {
            x: -1000,
            y: -1000,
            radius: 120,
        };

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            initParticles();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            isBlue: boolean;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = (Math.random() - 0.5) * 1.2;
                this.size = Math.random() * 2 + 0.5;
                this.isBlue = Math.random() > 0.7;
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * 3;
                    this.y -= forceDirectionY * force * 3;
                }

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.isBlue ? 'rgba(37, 99, 235, 0.5)' : 'rgba(150, 150, 150, 0.4)';
                ctx.fill();
            }
        }

        const initParticles = () => {
            if (!canvas) return;
            particles = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 10000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);
        resize();

        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Canvas animation loop with particle connections
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        const alpha = 0.15 - distance / 800;
                        const isLineBlue = particles[i].isBlue || particles[j].isBlue;
                        ctx.strokeStyle = isLineBlue
                            ? `rgba(37, 99, 235, ${alpha + 0.05})`
                            : `rgba(150, 150, 150, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                const dxMouse = mouse.x - particles[i].x;
                const dyMouse = mouse.y - particles[i].y;
                const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distanceMouse < 150) {
                    ctx.beginPath();
                    const alpha = 0.2 - distanceMouse / 750;
                    ctx.strokeStyle = `rgba(37, 99, 235, ${alpha + 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-1 h-full w-full opacity-60 mix-blend-multiply dark:mix-blend-screen"
        />
    );
}

export function HeroHireeoSection({
    country,
    dict,
    previewServices,
}: HeroHireeoSectionProps): ReactElement {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
            }}
        >
            <ParticleBackground />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-2 opacity-75 bg-[linear-gradient(rgba(10,10,10,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.02)_1px,transparent_1px)] bg-[length:40px_40px] [mask-image:linear-gradient(180deg,black_30%,transparent_90%)] [-webkit-mask-image:linear-gradient(180deg,black_30%,transparent_90%)]"
            />

            <div className="max-w-site relative z-5 mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 pt-16 pb-16 text-center sm:px-10 lg:px-14">
                <h1
                    className="m-0 mb-4 w-[16ch] text-[clamp(40px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.05em]"
                >
                    <AnimatedRotatingText
                        delay={300}
                        speed={40}
                        segments={[
                            { text: `${dict.home.hero2.titleBefore} ` },
                            { text: dict.home.hero2.titleAccent, style: { color: 'var(--accent)' } },
                            { text: dict.home.hero2.titleAfter },
                        ]}
                    />
                </h1>

                <p
                    className="mb-10 w-full max-w-2xl text-[16px] leading-[1.6] sm:text-[18px]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.home.hero2.subtitle}
                </p>

                <HeroSearchBar country={country} />

                <HomeCategories categoriesTabs={dict.home.categoriesTabs} />

                <div className="mt-8 flex items-center justify-center">
                    <Link
                        href={`/${country}/publish`}
                        className="group flex items-center gap-3 rounded-full border px-6 py-3.5 text-[15px] font-semibold transition-all hover:-translate-y-1 hover:shadow-md"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)', background: 'var(--bg)' }}
                    >
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ background: 'var(--accent)' }}
                        >
                            <Icon name="briefcase" size={16} color="white" />
                        </span>
                        {dict.home.hero2.ctaProfessional}
                        <Icon
                            name="arrowUR"
                            size={16}
                            className="opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                        />
                    </Link>
                </div>

                <HeroCountrySelector currentCountry={country} label={dict.home.hero2.trustedLabel} />
            </div>
        </section>
    );
}
