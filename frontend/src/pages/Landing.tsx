import React from 'react'
import { Link } from 'react-router-dom'
import { Hero } from '../components/landing/Hero'
import { DemoReport } from '../components/landing/DemoReport'
import { Leaderboard } from '../components/landing/Leaderboard'
import { FeatureGrid } from '../components/landing/FeatureGrid'
import { Testimonials } from '../components/landing/Testimonials'
import { FAQ } from '../components/landing/FAQ'
import { Button } from '../components/ui/Button'

export const Landing: React.FC = () => {
  return (
    <div className="bg-bg min-h-screen">
      <Hero />
      <DemoReport />
      <Leaderboard />
      <FeatureGrid />
      <Testimonials />
      <FAQ />

      {/* Final CTA */}
      <section className="py-20 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            You already know what you want to build.
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Find out if it'll work — before you spend 6 months finding out the hard way.
          </p>
          <Link to="/app">
            <Button variant="primary" size="lg" className="shadow-glow">
              Scan My Idea Free →
            </Button>
          </Link>
          <p className="text-slate-600 text-sm mt-4">No credit card. No account. 60 seconds.</p>
        </div>
      </section>
    </div>
  )
}
