import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from database import get_db
from schemas import MRRRequest, MRRResponse
from services import gpt_service

router = APIRouter()


@router.post("/mrr-estimate", response_model=MRRResponse)
async def mrr_estimate(body: MRRRequest, db: AsyncSession = Depends(get_db)):
    result = await gpt_service.estimate_mrr(
        body.idea_text,
        body.business_model or "subscription",
        body.target_market or "B2B",
    )

    mrr_low = int(result.get("mrr_low", 1000))
    mrr_high = int(result.get("mrr_high", 10000))
    reasoning = result.get("reasoning", "Estimate based on comparable startups.")
    comparable_examples = result.get("comparable_examples", [])
    if not comparable_examples:
        comparable_examples = ["Similar SaaS tool", "Comparable marketplace", "Related B2B product"]

    # Save to DB
    await db.execute(
        text(
            "INSERT INTO mrr_estimates (idea_text, business_model, target_market, mrr_low, mrr_high, reasoning, created_at) "
            "VALUES (:idea_text, :business_model, :target_market, :mrr_low, :mrr_high, :reasoning, :created_at)"
        ),
        {
            "idea_text": body.idea_text,
            "business_model": body.business_model,
            "target_market": body.target_market,
            "mrr_low": mrr_low,
            "mrr_high": mrr_high,
            "reasoning": reasoning,
            "created_at": datetime.datetime.utcnow(),
        },
    )
    await db.commit()

    return MRRResponse(
        mrr_low=mrr_low,
        mrr_high=mrr_high,
        currency="USD",
        reasoning=reasoning,
        comparable_examples=comparable_examples[:3],
    )
