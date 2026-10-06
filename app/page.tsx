import { Hero } from '@/components/landing/hero'
import { CardMarquee } from '@/components/landing/card-marquee'
import { HeadToHead } from '@/components/landing/head-to-head'
import { ChampionshipTeaser, HowItWorks, Manifesto, RarityShowcase } from '@/components/landing/sections'
import { WorldMap } from '@/components/world/world-map'
import { Eyebrow } from '@/components/ui-kit/primitives'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CardMarquee />
      <Manifesto />
      <HowItWorks />
      <RarityShowcase />
      <HeadToHead />
      <section className="defer-render py-16 md:py-24">
        <Eyebrow>Cult World</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-4xl">
          Choose your destination
        </h2>
        <div className="mt-10">
          <WorldMap />
        </div>
      </section>
      <ChampionshipTeaser />
    </>
  )
}
