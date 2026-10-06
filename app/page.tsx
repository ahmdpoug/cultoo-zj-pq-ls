import { Hero } from '@/components/landing/hero'
import { ChampionshipTeaser, HowItWorks, Manifesto, RarityShowcase } from '@/components/landing/sections'
import { WorldMap } from '@/components/world/world-map'
import { Eyebrow } from '@/components/ui-kit/primitives'
import { DailyQuests } from '@/components/economy/daily-quests'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <HowItWorks />
      <RarityShowcase />
      <section className="py-20">
        <Eyebrow>Cult World</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-4xl">Choose your destination</h2>
        <div className="mt-10">
          <WorldMap />
        </div>
      </section>
      <DailyQuests />
      <ChampionshipTeaser />
    </>
  )
}
