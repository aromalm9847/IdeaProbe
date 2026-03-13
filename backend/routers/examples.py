from fastapi import APIRouter
from typing import List

router = APIRouter()

EXAMPLES = [
    {
        "slug": "pantrymate-ai",
        "title": "PantryMate AI",
        "description": "AI meal planning for budget-conscious families",
        "score": 70,
        "verdict": "PROMISING",
        "tags": ["Mobile App", "B2C", "US"],
        "report": {
            "score": 70,
            "verdict": "PROMISING",
            "industry": "Consumer AI",
            "biggest_risk": "High competition from established meal planning apps with large user bases.",
            "biggest_risk_score": 6.5,
            "whats_working": [
                "Strong demand signal — 'meal planning' searches up 34% year-over-year",
                "Clear differentiation: pantry-first approach reduces food waste, a growing concern",
                "B2C subscription model with strong retention potential for habit-forming use case",
            ],
            "competitors": [
                {
                    "name": "Mealime",
                    "pricing": "Free / $5.99/mo",
                    "weakness": "Does not scan existing pantry items — users must manually input everything",
                    "your_fix": "Auto-detect pantry via photo scan to eliminate manual entry friction",
                },
                {
                    "name": "Yummly",
                    "pricing": "Free / $4.99/mo",
                    "weakness": "Recipe suggestions ignore budget constraints and what users already own",
                    "your_fix": "Budget-first filtering with pantry inventory integration",
                },
                {
                    "name": "PlateJoy",
                    "pricing": "$69/year",
                    "weakness": "Expensive annual commitment with no free tier to test value",
                    "your_fix": "Freemium model with immediate value delivery before paywall",
                },
            ],
            "market": {
                "tam_usd": "$3.5B",
                "sam_usd": "$350M",
                "som_usd": "$8M",
                "tam_explanation": "Global meal planning and recipe app market valued at $3.5B in 2024.",
                "sam_explanation": "US budget-conscious families aged 25-45 with smartphones represent $350M.",
                "som_explanation": "Realistic first-year target capturing 0.5% of SAM with focused marketing.",
            },
            "search_trends": [
                {"keyword": "meal planning", "trend_direction": "+34%", "is_rising": True},
                {"keyword": "pantry recipes", "trend_direction": "+18%", "is_rising": True},
                {"keyword": "budget cooking", "trend_direction": "+12%", "is_rising": True},
            ],
            "fix_playbook": [
                "Step 1: Build a pantry photo-scan MVP using existing vision APIs to validate core tech",
                "Step 2: Launch a waitlist landing page targeting r/MealPrepSunday and r/budgetfood",
                "Step 3: Partner with 3 grocery chains to offer exclusive discount integration",
                "Step 4: Implement a weekly meal plan email to drive D7 retention above 40%",
                "Step 5: Add social sharing for meal plans to create viral growth loops",
            ],
            "sources": [
                {"platform": "Reddit", "count": 14, "sample_signal": "Frustrated users asking for apps that use what they already have in the fridge"},
                {"platform": "Google Trends", "count": 3, "sample_signal": "Trend data for: meal planning, pantry recipes, budget cooking"},
                {"platform": "Hacker News", "count": 7, "sample_signal": "Tech community interest detected"},
                {"platform": "Indie Hackers", "count": 4, "sample_signal": "Founder discussions analyzed"},
                {"platform": "Quora", "count": 3, "sample_signal": "User questions and pain points reviewed"},
            ],
            "scan_duration_seconds": 48.3,
        },
    },
    {
        "slug": "devops-incident-summarizer",
        "title": "DevOps Incident Summarizer",
        "description": "AI that writes post-mortems and incident reports for engineering teams",
        "score": 82,
        "verdict": "VALIDATED",
        "tags": ["B2B SaaS", "DevOps", "Enterprise"],
        "report": {
            "score": 82,
            "verdict": "VALIDATED",
            "industry": "DevOps Tooling",
            "biggest_risk": "Enterprise sales cycles are long and procurement requires security audits.",
            "biggest_risk_score": 5.2,
            "whats_working": [
                "Clear pain point — engineers spend 2-4 hours writing post-mortems after every incident",
                "Strong willingness to pay in DevOps tooling — teams already spend $500+/seat/year on tools",
                "AI-native product with no legacy competitor — existing tools are manual and template-based",
            ],
            "competitors": [
                {
                    "name": "PagerDuty",
                    "pricing": "$21/user/mo",
                    "weakness": "Focuses on alerting and on-call, not post-incident documentation",
                    "your_fix": "Integrate with PagerDuty to auto-generate summaries from incident timelines",
                },
                {
                    "name": "Blameless",
                    "pricing": "Custom enterprise pricing",
                    "weakness": "Complex setup, requires dedicated SRE team to configure properly",
                    "your_fix": "5-minute setup with Slack/Jira integration, no dedicated SRE needed",
                },
                {
                    "name": "Rootly",
                    "pricing": "$15/user/mo",
                    "weakness": "Workflow automation but still requires manual writing of summaries",
                    "your_fix": "Full AI-generated narrative summaries with one-click approval workflow",
                },
            ],
            "market": {
                "tam_usd": "$8.2B",
                "sam_usd": "$820M",
                "som_usd": "$12M",
                "tam_explanation": "Global DevOps platform market at $8.2B growing 20% annually.",
                "sam_explanation": "Mid-market engineering teams (50-500 engineers) represent $820M.",
                "som_explanation": "First-year target of 200 teams at $5K ARR each equals $1M ARR.",
            },
            "search_trends": [
                {"keyword": "incident post-mortem", "trend_direction": "+27%", "is_rising": True},
                {"keyword": "devops automation", "trend_direction": "+41%", "is_rising": True},
                {"keyword": "SRE tools", "trend_direction": "+19%", "is_rising": True},
            ],
            "fix_playbook": [
                "Step 1: Build a Slack bot that auto-drafts post-mortems from incident channel history",
                "Step 2: Offer free tier for teams under 10 engineers to build bottom-up adoption",
                "Step 3: Integrate with PagerDuty, OpsGenie, and Jira in first 90 days",
                "Step 4: Add compliance templates (SOC2, ISO 27001) to unlock enterprise deals",
                "Step 5: Launch on Product Hunt targeting DevOps and SRE communities",
            ],
            "sources": [
                {"platform": "Reddit", "count": 22, "sample_signal": "r/devops thread: 'Writing post-mortems takes longer than fixing the incident itself'"},
                {"platform": "Google Trends", "count": 3, "sample_signal": "Trend data for: incident post-mortem, devops automation, SRE tools"},
                {"platform": "Hacker News", "count": 11, "sample_signal": "Tech community interest detected"},
                {"platform": "Indie Hackers", "count": 6, "sample_signal": "Founder discussions analyzed"},
                {"platform": "Quora", "count": 5, "sample_signal": "User questions and pain points reviewed"},
            ],
            "scan_duration_seconds": 52.1,
        },
    },
    {
        "slug": "freelancer-tax-automation",
        "title": "FreelanceTax AI",
        "description": "Automated tax filing and quarterly estimates for gig economy workers",
        "score": 65,
        "verdict": "PROMISING",
        "tags": ["FinTech", "B2C", "Gig Economy"],
        "report": {
            "score": 65,
            "verdict": "PROMISING",
            "industry": "FinTech",
            "biggest_risk": "Tax software is heavily regulated and requires legal compliance in each jurisdiction.",
            "biggest_risk_score": 7.8,
            "whats_working": [
                "Massive and growing TAM — 59 million Americans freelanced in 2023, up 4M from prior year",
                "Acute pain point — freelancers overpay taxes by average $1,200/year due to missed deductions",
                "Recurring revenue model with annual lock-in around tax season",
            ],
            "competitors": [
                {
                    "name": "TurboTax Self-Employed",
                    "pricing": "$119/year",
                    "weakness": "Complex UI designed for accountants, not gig workers; misses platform-specific deductions",
                    "your_fix": "Simple mobile-first flow that auto-imports from Uber, Fiverr, Upwork APIs",
                },
                {
                    "name": "QuickBooks Self-Employed",
                    "pricing": "$15/mo",
                    "weakness": "Requires manual categorization of every transaction; no AI assistance",
                    "your_fix": "AI auto-categorization with 95%+ accuracy, reducing manual work to near zero",
                },
                {
                    "name": "Keeper Tax",
                    "pricing": "$16/mo",
                    "weakness": "Limited to deduction tracking; does not file returns or handle quarterly estimates",
                    "your_fix": "End-to-end platform: track, estimate, and file in one place",
                },
            ],
            "market": {
                "tam_usd": "$12B",
                "sam_usd": "$1.2B",
                "som_usd": "$15M",
                "tam_explanation": "US tax preparation market at $12B with gig economy growing 15% annually.",
                "sam_explanation": "59M US freelancers willing to pay for tax automation tools represent $1.2B.",
                "som_explanation": "Capturing 0.1% of SAM in year one at $15/mo average subscription.",
            },
            "search_trends": [
                {"keyword": "freelancer taxes", "trend_direction": "+52%", "is_rising": True},
                {"keyword": "gig worker tax", "trend_direction": "+38%", "is_rising": True},
                {"keyword": "quarterly tax estimate", "trend_direction": "+15%", "is_rising": True},
            ],
            "fix_playbook": [
                "Step 1: Partner with 2-3 gig platforms (Fiverr, Upwork) for direct API income import",
                "Step 2: Build quarterly estimate calculator as free tool to drive top-of-funnel traffic",
                "Step 3: Hire a CPA advisor to ensure compliance and build trust with target audience",
                "Step 4: Launch before January 1 to capture New Year tax planning intent",
                "Step 5: Build referral program targeting freelancer communities on Reddit and Facebook Groups",
            ],
            "sources": [
                {"platform": "Reddit", "count": 31, "sample_signal": "r/freelance: 'I owe $8k in taxes I didn't save for — how do I avoid this next year?'"},
                {"platform": "Google Trends", "count": 3, "sample_signal": "Trend data for: freelancer taxes, gig worker tax, quarterly tax estimate"},
                {"platform": "Hacker News", "count": 15, "sample_signal": "Tech community interest detected"},
                {"platform": "Indie Hackers", "count": 9, "sample_signal": "Founder discussions analyzed"},
                {"platform": "Quora", "count": 7, "sample_signal": "User questions and pain points reviewed"},
            ],
            "scan_duration_seconds": 44.7,
        },
    },
]


@router.get("/examples")
async def get_examples():
    return EXAMPLES


@router.get("/examples/{slug}")
async def get_example_by_slug(slug: str):
    from fastapi import HTTPException
    for ex in EXAMPLES:
        if ex["slug"] == slug:
            return ex
    raise HTTPException(status_code=404, detail="Example not found")
