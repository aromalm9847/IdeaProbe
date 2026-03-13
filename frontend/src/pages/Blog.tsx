import React from 'react'
import { Link, useParams } from 'react-router-dom'

const POSTS = [
  {
    slug: 'validate-startup-idea-60-seconds',
    title: 'How to Validate a Startup Idea in 60 Seconds (With Real Data)',
    date: 'March 3, 2025',
    readTime: '5 min read',
    excerpt: 'The old way of validating a startup idea took months of surveys, customer interviews, and guesswork. The new way takes 60 seconds and uses live data.',
    content: `
The old way of validating a startup idea took months of surveys, customer interviews, and guesswork. You'd spend weeks building a landing page, run a small ad campaign, and hope that signups translated to real demand. The problem? By the time you got feedback, you'd already invested too much to pivot cleanly.

The new way takes 60 seconds and uses live data.

**What the Viability Score Actually Means**

IdeaProbe generates a 0–100 viability score based on four weighted factors: search trend momentum (are people actively searching for this?), market size (is the SAM large enough to build a business?), competitor weakness opportunity (can you exploit gaps in existing solutions?), and community demand signals (are people complaining about this problem on Reddit?).

A score of 80–100 means **VALIDATED** — strong signals across all dimensions. 60–79 is **PROMISING** — good fundamentals with addressable risks. 40–59 is **RISKY** — proceed with caution and fix the identified gaps. Below 40 is **AVOID** — the data suggests this idea needs significant rethinking.

**Why Reddit Surfaces Real Pain Points Better Than Surveys**

Surveys are biased. People tell you what they think you want to hear, or what sounds reasonable in the moment. Reddit is different — people post when they're frustrated, confused, or genuinely seeking help. A thread titled "I've tried every invoicing tool and they all suck for freelancers" is a more honest signal than 100 survey responses saying "yes, I'd pay for better invoicing software."

IdeaProbe searches startup, entrepreneur, SaaS, and indie hacker communities to find real conversations about your problem space. The signal count and sample quotes in your report come from actual posts, not AI-generated summaries.

**How to Act on a Low Score**

A low score isn't a death sentence — it's a map. If your score is low because of weak search trends, the problem may not be urgent enough for people to actively seek solutions. Try repositioning around a more acute pain point. If competitors are strong with no clear weaknesses, you need a sharper differentiation angle. If Reddit signals are low, the problem may be too niche or not discussed in mainstream communities.

Fix the issues, re-scan with a refined idea description, and watch your score improve. Many founders iterate 2–3 times before finding the positioning that scores above 70.
    `,
  },
  {
    slug: 'why-startups-fail-market-need',
    title: 'Why 35% of Startups Fail — And How to Avoid Being One of Them',
    date: 'February 18, 2025',
    readTime: '6 min read',
    excerpt: 'CB Insights analyzed 111 startup post-mortems and found the #1 reason startups fail: no market need. Here\'s how to catch this early.',
    content: `
CB Insights analyzed 111 startup post-mortems and found the single biggest reason startups fail: **no market need**, cited by 35% of failed founders. Not running out of money. Not the wrong team. Not bad timing. Simply building something nobody wanted badly enough to pay for.

**The "No Market Need" Failure Mode Explained**

This failure mode is insidious because it's invisible during building. You're heads-down coding, designing, and shipping. Your friends think it's cool. Your beta users are polite. And then you launch and... nothing. No organic word of mouth. No retention. No one coming back.

The root cause is almost always the same: the problem wasn't painful enough, or the existing solutions were "good enough." People have a threshold for switching tools or paying for new ones. If your solution doesn't clear that threshold by a significant margin, you'll get polite interest but not paying customers.

**Early Warning Signs**

There are two data signals that predict this failure mode before you build anything. First: no Reddit threads complaining about the problem. If people aren't venting about this frustration online, it's either not painful enough or too niche to surface in mainstream communities. Second: flat or declining Google Trends data. If search volume for your core problem keywords has been flat for two years, the market isn't growing — you'd be fighting for a fixed pie.

**How Competitor Analysis Catches This Early**

If you find no direct competitors, that's not automatically good news. It could mean a blue ocean opportunity — or it could mean others tried and failed, or that the market is too small to sustain a business. IdeaProbe's competitor discovery uses GPT to find real, existing products. If it returns zero competitors for a seemingly obvious idea, that's a signal worth investigating before you build.

The founders who avoid the "no market need" trap are the ones who validate demand with real data before writing a single line of code. Sixty seconds of validation is worth six months of wasted development.
    `,
  },
  {
    slug: 'competitor-analysis-founders',
    title: 'Competitor Analysis for Founders: What Most People Get Wrong',
    date: 'February 5, 2025',
    readTime: '7 min read',
    excerpt: '"I have no competitors" is almost always a red flag. Here\'s how to do competitor analysis that actually helps you win.',
    content: `
"I have no competitors" is one of the most dangerous things a founder can say. It's almost always wrong — and when it's right, it's often a warning sign rather than a competitive advantage.

**Direct vs. Indirect Competitors**

Most founders only look for direct competitors: products that do exactly what theirs does. But users have alternatives even when no direct competitor exists. If you're building a tool to help freelancers track their time, your competitors aren't just other time-tracking apps — they're also spreadsheets, calendar apps, and the habit of not tracking time at all. Understanding indirect competition tells you what you're actually asking users to give up.

**Why "I Have No Competitors" Is a Red Flag**

When founders claim no competitors exist, one of three things is usually true: they haven't looked hard enough, the market is too small to attract competition (which means it may be too small to build a business), or the problem isn't painful enough for anyone to have tried solving it yet. None of these are good signs. The existence of competitors validates that a market exists and that people are willing to pay for solutions.

**How to Identify Competitor Weaknesses**

The best sources for competitor weaknesses aren't the competitors' own websites — they're review sites and Reddit. G2, Trustpilot, and Capterra reviews are gold mines of specific complaints. Search "[competitor name] alternatives" on Reddit and you'll find threads full of users explaining exactly why they're leaving and what they wish existed instead. These are your positioning opportunities.

**Turning Competitor Gaps Into Positioning**

Once you've identified a consistent weakness across multiple competitors — say, "too complex for non-technical users" — you have a positioning anchor. Your entire go-to-market can be built around that gap. "The [category] tool that non-technical teams can actually use" is a more compelling message than "the best [category] tool." Specificity wins.

IdeaProbe's competitor table shows you not just who the competitors are and what they charge, but their specific weaknesses and how you can exploit each one. That's the foundation of a differentiation strategy.
    `,
  },
  {
    slug: 'tam-sam-som-guide',
    title: 'TAM vs SAM vs SOM: A Founder\'s Practical Guide',
    date: 'January 22, 2025',
    readTime: '6 min read',
    excerpt: 'Most founders either ignore market sizing or get it completely wrong. Here\'s how to calculate TAM, SAM, and SOM for your startup idea.',
    content: `
Market sizing is one of the most misunderstood parts of startup validation. Most founders either skip it entirely ("the market is huge, trust me") or present a top-down TAM number that impresses no one who knows what they're looking at. Here's how to do it right.

**Plain-English Definitions**

**TAM (Total Addressable Market)** is the total revenue opportunity if you captured 100% of the market. For a freelancer invoicing tool, TAM might be "all freelancers globally who need invoicing software" — which could be $12B. This number is useful for showing the ceiling, but it's not what you'll actually capture.

**SAM (Serviceable Addressable Market)** is the portion of TAM you can realistically reach with your current business model and distribution. For the same freelancer tool, SAM might be "US-based freelancers earning over $50K/year who currently use a manual or inadequate solution" — perhaps $1.2B. This is the market you're actually competing for.

**SOM (Serviceable Obtainable Market)** is your realistic first-year revenue target. This is where most founders get it wrong — they present TAM as if it's SOM. A realistic SOM for a new freelancer tool might be $15M — capturing 0.1% of SAM in year one through focused marketing and word of mouth.

**Why Investors Care About All Three**

Investors want to see TAM to confirm the ceiling is high enough to justify venture returns. They want SAM to understand your actual competitive landscape. And they want SOM to evaluate whether your go-to-market plan is realistic. A $12B TAM with a $15M SOM and a credible path to get there is a compelling story. A "$12B market, we just need 1%" is not.

**The Mistake of Showing TAM Without SOM**

The "1% of a $1B market" pitch is a cliché for a reason — it signals that the founder hasn't thought carefully about how they'll actually acquire customers. Investors have heard it thousands of times. Instead, build your SOM from the bottom up: "We're targeting 200 agencies in year one, at $5K ARR each, which equals $1M ARR." That's a story grounded in real distribution assumptions, not wishful math.
    `,
  },
]

export const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">The IdeaProbe Blog</h1>
          <p className="text-slate-400">Practical guides for founders who validate before they build.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {POSTS.map((post) => (
            <div key={post.slug} className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-colors flex flex-col">
              <div className="flex items-center gap-3 text-slate-500 text-xs mb-3">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-white font-bold text-lg mb-3 flex-1">{post.title}</h2>
              <p className="text-slate-400 text-sm mb-4">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="text-accent text-sm font-medium hover:text-accent/80 transition-colors">
                Read more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
          <Link to="/blog" className="text-accent hover:text-accent/80">← Back to blog</Link>
        </div>
      </div>
    )
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-3" />
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} className="text-white font-bold text-lg mt-6 mb-3">{line.slice(2, -2)}</h3>
      }
      // Inline bold
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="text-slate-300 text-sm leading-relaxed mb-2">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/blog" className="text-slate-500 hover:text-slate-300 text-sm mb-6 inline-block">← Back to blog</Link>
        <div className="flex items-center gap-3 text-slate-500 text-xs mb-4">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-8">{post.title}</h1>
        <div className="prose-sm">{renderContent(post.content)}</div>
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-slate-400 text-sm mb-4">Ready to validate your own idea?</p>
          <Link to="/app" className="text-accent font-medium hover:text-accent/80">Scan my idea free →</Link>
        </div>
      </div>
    </div>
  )
}
