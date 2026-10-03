/**
 * Save The Kitten - Animation Helpers & Accessibility
 * Respects 'prefers-reduced-motion' and triggers visual particle/celebration effects.
 */

export class AnimationController {
    /**
     * Checks if user prefers reduced motion
     * @returns {boolean}
     */
    static prefersReducedMotion() {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Triggers victory confetti particle burst on victory
     * @param {HTMLElement} container
     */
    static spawnVictoryBurst(container) {
        if (this.prefersReducedMotion() || !container) return;

        const count = 24;
        const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'victory-particle';
            particle.style.backgroundColor = colors[i % colors.length];
            particle.style.left = `${50 + (Math.random() - 0.5) * 60}%`;
            particle.style.top = `${50 + (Math.random() - 0.5) * 40}%`;
            particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
            particle.style.setProperty('--dy', `${(Math.random() - 0.7) * 200}px`);

            container.appendChild(particle);
            setTimeout(() => particle.remove(), 1200);
        }
    }
}
