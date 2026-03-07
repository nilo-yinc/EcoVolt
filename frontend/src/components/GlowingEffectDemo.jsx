import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "./ui/glowing-effect";

export default function GlowingEffectDemo() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Box className="h-4 w-4 text-[var(--ww-accent)]" />}
                title="Real-Time Monitoring"
                description="AI-powered CCTV occupancy detection running 24/7 across all campus rooms."
            />
            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                icon={<Settings className="h-4 w-4 text-[var(--ww-accent)]" />}
                title="Smart Automation"
                description="Automatic device control based on occupancy patterns and energy rules."
            />
            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                icon={<Lock className="h-4 w-4 text-[var(--ww-accent)]" />}
                title="Privacy-First Design"
                description="No video recording. Only metadata processing for complete privacy compliance."
            />
            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                icon={<Sparkles className="h-4 w-4 text-[var(--ww-accent)]" />}
                title="Energy Intelligence"
                description="Predictive analytics to identify waste patterns and optimize consumption."
            />
            <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                icon={<Search className="h-4 w-4 text-[var(--ww-accent)]" />}
                title="Ghost Room Detection"
                description="Instantly identifies rooms with lights/AC on but no occupants detected."
            />
        </ul>
    );
}

const GridItem = ({ area, icon, title, description }) => {
    return (
        <li className={`min-h-[14rem] list-none ${area}`}>
            <div className="relative h-full rounded-2xl border border-[var(--ww-border)] p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 bg-[var(--ww-card)] backdrop-blur-sm shadow-[var(--ww-shadow)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border border-[var(--ww-border)] p-2 bg-[var(--ww-accent-dim)]">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 font-display text-xl/[1.375rem] font-semibold text-balance text-[var(--ww-text-1)] md:text-2xl/[1.875rem] tracking-wide">
                                {title}
                            </h3>
                            <p className="font-sans text-sm/[1.125rem] text-[var(--ww-text-3)] md:text-base/[1.375rem]">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
