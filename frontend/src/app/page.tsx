"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Home, Users, MapPin, Shield, Sparkles, ArrowRight, Sun, Moon } from "lucide-react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Back Home</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn-ghost p-2 rounded-xl"
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 dark:hidden" />
            </button>
            <Link href="/login" className="btn-ghost text-sm">Log In</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-brand px-4 py-1.5 mb-6 text-sm">
            <Sparkles className="h-4 w-4" />
            Built for the global diaspora
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Find your people
            <br />
            <span className="text-brand-500">far from home</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-surface-900/60 dark:text-surface-50/60 max-w-2xl mx-auto leading-relaxed">
            Connect with people from your hometown living in your new city.
            Housing leads, job referrals, cultural events, and trusted community — instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Join Your Community
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              I Already Have an Account
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-surface-900/40 dark:text-surface-50/40">
            Hyderabad → SF &nbsp;&bull;&nbsp; Mumbai → NYC &nbsp;&bull;&nbsp; Delhi → Toronto &nbsp;&bull;&nbsp; Shanghai → LA &nbsp;&bull;&nbsp; Lagos → London
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface-100/50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Set Your Roots",
                desc: "Tell us your hometown and where you live now. We find your community instantly.",
              },
              {
                icon: Users,
                title: "Smart Matching",
                desc: "Our engine scores connections by hometown, university, profession, languages, and interests.",
              },
              {
                icon: Shield,
                title: "Trust Layer",
                desc: "Verified badges, mutual connections, and endorsements so you know who you're connecting with.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-surface-900/60 dark:text-surface-50/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Your hometown, your network, your strength.</h2>
          <p className="text-surface-900/60 dark:text-surface-50/60 mb-8">
            Whether you need a roommate, a job referral, or just someone who gets your culture — we've got you.
          </p>
          <Link href="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-surface-900/40 dark:text-surface-50/40">
          <span>Back Home &copy; {new Date().getFullYear()}</span>
          <span>Built with community in mind.</span>
        </div>
      </footer>
    </div>
  );
}
