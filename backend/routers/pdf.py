"""
PDF Report Router — Generates a premium PDF report for a completed scan.
GET /api/pdf/{scan_id} → returns a downloadable PDF file.
"""

import json
import logging
import io
import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from database import AsyncSessionLocal

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pdf", tags=["pdf"])


def _score_color(score: int) -> tuple:
    """Return RGB color tuple based on score."""
    if score >= 75:
        return (16, 185, 129)   # Green
    elif score >= 50:
        return (245, 158, 11)   # Amber
    else:
        return (239, 68, 68)    # Red


def _verdict_emoji(verdict: str) -> str:
    mapping = {
        "Promising": "✅",
        "Needs Work": "⚠️",
        "Avoid": "❌",
        "Strong Buy": "🚀",
    }
    return mapping.get(verdict, "📊")


async def generate_pdf_bytes(scan_id: int) -> bytes:
    """Generate a premium PDF report using ReportLab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm, mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.graphics.shapes import Drawing, Rect, String
    from reportlab.graphics import renderPDF

    # ── Fetch scan data ────────────────────────────────────────────────────────
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT * FROM scans WHERE id = :id"), {"id": scan_id}
        )
        row = result.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")

    if row.status not in ("complete", "completed"):
        raise HTTPException(status_code=400, detail="Report is not ready yet")

    report = json.loads(row.report_json)
    idea_text = row.idea_text
    # Fall back to report_json values if DB columns are null (older scans)
    score = row.score if row.score is not None else report.get("score", 0)
    verdict = row.verdict if row.verdict is not None else report.get("verdict", "Pending")
    # Handle created_at as either datetime or string
    created_at = row.created_at
    if isinstance(created_at, str):
        try:
            import datetime as dt_module
            created_at = dt_module.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        except Exception:
            created_at = None

    # ── Color palette ──────────────────────────────────────────────────────────
    DARK_BG = colors.HexColor("#0a0a0f")
    ACCENT = colors.HexColor("#6366f1")       # Indigo
    ACCENT2 = colors.HexColor("#8b5cf6")      # Purple
    GOLD = colors.HexColor("#f59e0b")         # Amber/Gold
    SUCCESS = colors.HexColor("#10b981")      # Green
    DANGER = colors.HexColor("#ef4444")       # Red
    TEXT_PRIMARY = colors.HexColor("#1e293b")
    TEXT_SECONDARY = colors.HexColor("#64748b")
    CARD_BG = colors.HexColor("#f8fafc")
    BORDER = colors.HexColor("#e2e8f0")
    WHITE = colors.white

    score_color = colors.Color(*[c/255 for c in _score_color(score)])

    # ── Document setup ─────────────────────────────────────────────────────────
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.8*cm,
        leftMargin=1.8*cm,
        topMargin=1.5*cm,
        bottomMargin=2*cm,
        title=f"IdeaProbe Report — {idea_text[:50]}",
        author="IdeaProbe AI",
    )

    styles = getSampleStyleSheet()
    W = A4[0] - 3.6*cm  # usable width

    # Custom styles
    def S(name, **kwargs):
        return ParagraphStyle(name, **kwargs)

    style_h1 = S("H1", fontSize=22, textColor=TEXT_PRIMARY, fontName="Helvetica-Bold",
                 spaceAfter=4, leading=28)
    style_h2 = S("H2", fontSize=14, textColor=ACCENT, fontName="Helvetica-Bold",
                 spaceAfter=4, spaceBefore=14, leading=18)
    style_h3 = S("H3", fontSize=11, textColor=TEXT_PRIMARY, fontName="Helvetica-Bold",
                 spaceAfter=3, spaceBefore=8, leading=14)
    style_body = S("Body", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                   spaceAfter=4, leading=14)
    style_small = S("Small", fontSize=8, textColor=TEXT_SECONDARY, fontName="Helvetica",
                    spaceAfter=2, leading=11)
    style_center = S("Center", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                     alignment=TA_CENTER, leading=14)
    style_label = S("Label", fontSize=7.5, textColor=TEXT_SECONDARY, fontName="Helvetica",
                    alignment=TA_CENTER, leading=10)
    style_score = S("Score", fontSize=36, textColor=score_color, fontName="Helvetica-Bold",
                    alignment=TA_CENTER, leading=42)
    style_verdict = S("Verdict", fontSize=16, textColor=score_color, fontName="Helvetica-Bold",
                      alignment=TA_CENTER, leading=20)
    style_idea = S("Idea", fontSize=11, textColor=TEXT_SECONDARY, fontName="Helvetica",
                   alignment=TA_CENTER, leading=15, spaceAfter=6)

    story = []

    # ── HEADER BANNER ─────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("<b>IdeaProbe</b>", S("Brand", fontSize=18, textColor=ACCENT,
                  fontName="Helvetica-Bold", leading=22)),
        Paragraph(f"AI Startup Analysis Report<br/>"
                  f"<font size='8' color='#94a3b8'>Generated {created_at.strftime('%B %d, %Y') if created_at else 'Today'}</font>",
                  S("HeaderRight", fontSize=10, textColor=TEXT_SECONDARY,
                    fontName="Helvetica", alignment=TA_RIGHT, leading=14)),
    ]]
    header_table = Table(header_data, colWidths=[W*0.5, W*0.5])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LINEBELOW", (0,0), (-1,-1), 1.5, ACCENT),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # ── SCORE CARD ────────────────────────────────────────────────────────────
    score_data = [[
        Paragraph(str(score), style_score),
        Paragraph("/100", S("ScoreSub", fontSize=14, textColor=TEXT_SECONDARY,
                  fontName="Helvetica", leading=18, alignment=TA_LEFT)),
        Spacer(1, 1),
        Paragraph(f"{_verdict_emoji(verdict)} {verdict}", style_verdict),
    ]]
    score_card = Table([[
        Paragraph(str(score), style_score),
        Paragraph(f"<font color='#94a3b8'>/100</font>", S("X", fontSize=14,
                  fontName="Helvetica", leading=42, textColor=TEXT_SECONDARY)),
        Paragraph(f"{verdict}", S("V", fontSize=18, fontName="Helvetica-Bold",
                  textColor=score_color, leading=42, alignment=TA_RIGHT)),
    ]], colWidths=[W*0.2, W*0.2, W*0.6])
    score_card.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BACKGROUND", (0,0), (-1,-1), CARD_BG),
        ("ROUNDEDCORNERS", [8]),
        ("BOX", (0,0), (-1,-1), 1, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("RIGHTPADDING", (0,0), (-1,-1), 16),
    ]))
    story.append(score_card)
    story.append(Spacer(1, 6))

    # Idea text
    story.append(Paragraph(f'"{idea_text}"', style_idea))
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 8))

    # ── MARKET SIZING (TAM/SAM/SOM) ───────────────────────────────────────────
    market = report.get("market", {})
    tam = market.get("tam_usd", "N/A")
    sam = market.get("sam_usd", "N/A")
    som = market.get("som_usd", "N/A")

    story.append(Paragraph("Market Opportunity", style_h2))
    market_data = [
        [Paragraph("<b>TAM</b><br/><font size='7' color='#64748b'>Total Addressable Market</font>", style_center),
         Paragraph("<b>SAM</b><br/><font size='7' color='#64748b'>Serviceable Addressable Market</font>", style_center),
         Paragraph("<b>SOM</b><br/><font size='7' color='#64748b'>Serviceable Obtainable Market</font>", style_center)],
        [Paragraph(f"<b>{tam}</b>", S("MV", fontSize=13, fontName="Helvetica-Bold",
                   textColor=ACCENT, alignment=TA_CENTER, leading=16)),
         Paragraph(f"<b>{sam}</b>", S("MV2", fontSize=13, fontName="Helvetica-Bold",
                   textColor=ACCENT2, alignment=TA_CENTER, leading=16)),
         Paragraph(f"<b>{som}</b>", S("MV3", fontSize=13, fontName="Helvetica-Bold",
                   textColor=SUCCESS, alignment=TA_CENTER, leading=16))],
    ]
    market_table = Table(market_data, colWidths=[W/3, W/3, W/3])
    market_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), CARD_BG),
        ("BOX", (0,0), (-1,-1), 1, BORDER),
        ("INNERGRID", (0,0), (-1,-1), 0.5, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(market_table)
    story.append(Spacer(1, 10))

    # ── BIGGEST RISK ──────────────────────────────────────────────────────────
    biggest_risk = report.get("biggest_risk", "")
    risk_score = report.get("biggest_risk_score", 5.0)
    if biggest_risk:
        story.append(Paragraph("⚠️ Biggest Risk", style_h2))
        risk_data = [[
            Paragraph(f"<b>Risk Score: {risk_score}/10</b><br/>{biggest_risk}",
                     S("Risk", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                       leading=14, leftIndent=4)),
        ]]
        risk_table = Table(risk_data, colWidths=[W])
        risk_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#fff7ed")),
            ("BOX", (0,0), (-1,-1), 1.5, GOLD),
            ("LEFTPADDING", (0,0), (-1,-1), 12),
            ("RIGHTPADDING", (0,0), (-1,-1), 12),
            ("TOPPADDING", (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 10))

    # ── WHAT'S WORKING ────────────────────────────────────────────────────────
    whats_working = report.get("whats_working", [])
    if whats_working:
        story.append(Paragraph("✅ What's Working", style_h2))
        for item in whats_working:
            story.append(Paragraph(f"• {item}", style_body))
        story.append(Spacer(1, 8))

    # ── FIX PLAYBOOK ──────────────────────────────────────────────────────────
    fix_playbook = report.get("fix_playbook", [])
    if fix_playbook:
        story.append(Paragraph("🎯 Action Playbook", style_h2))
        for i, step in enumerate(fix_playbook, 1):
            step_data = [[
                Paragraph(f"<b>{i}</b>", S("StepNum", fontSize=11, fontName="Helvetica-Bold",
                          textColor=WHITE, alignment=TA_CENTER, leading=14)),
                Paragraph(step, S("StepText", fontSize=9.5, fontName="Helvetica",
                          textColor=TEXT_PRIMARY, leading=14)),
            ]]
            step_table = Table(step_data, colWidths=[0.7*cm, W - 0.7*cm])
            step_table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (0,0), ACCENT),
                ("BACKGROUND", (1,0), (1,0), CARD_BG),
                ("BOX", (0,0), (-1,-1), 0.5, BORDER),
                ("TOPPADDING", (0,0), (-1,-1), 7),
                ("BOTTOMPADDING", (0,0), (-1,-1), 7),
                ("LEFTPADDING", (0,0), (0,0), 4),
                ("LEFTPADDING", (1,0), (1,0), 10),
                ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ]))
            story.append(step_table)
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 8))

    # ── COMPETITORS ───────────────────────────────────────────────────────────
    competitors_deep = report.get("agents", {}).get("competitors", {}).get("competitors", [])
    competitors_compact = report.get("competitors", [])
    competitors = competitors_deep if competitors_deep else competitors_compact

    if competitors:
        story.append(Paragraph("🏆 Competitor Analysis", style_h2))
        comp_header = [
            Paragraph("<b>Competitor</b>", S("CH", fontSize=8, fontName="Helvetica-Bold",
                      textColor=WHITE, leading=11)),
            Paragraph("<b>Pricing (₹)</b>", S("CH2", fontSize=8, fontName="Helvetica-Bold",
                      textColor=WHITE, alignment=TA_CENTER, leading=11)),
            Paragraph("<b>Key Weakness</b>", S("CH3", fontSize=8, fontName="Helvetica-Bold",
                      textColor=WHITE, leading=11)),
            Paragraph("<b>Your Edge</b>", S("CH4", fontSize=8, fontName="Helvetica-Bold",
                      textColor=WHITE, leading=11)),
        ]
        comp_rows = [comp_header]
        for c in competitors[:7]:
            if isinstance(c, dict):
                name = c.get("name", "")
                pricing = c.get("pricing", c.get("pricing", ""))
                weakness = c.get("weaknesses", [c.get("weakness", "")])[0] if isinstance(c.get("weaknesses"), list) else c.get("weakness", "")
                fix = c.get("your_fix", "")
            else:
                name = getattr(c, "name", "")
                pricing = getattr(c, "pricing", "")
                weakness = getattr(c, "weakness", "")
                fix = getattr(c, "your_fix", "")

            comp_rows.append([
                Paragraph(name[:30], S("CT", fontSize=8, fontName="Helvetica-Bold",
                          textColor=TEXT_PRIMARY, leading=11)),
                Paragraph(str(pricing)[:25], S("CT2", fontSize=8, fontName="Helvetica",
                          textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=11)),
                Paragraph(str(weakness)[:60], S("CT3", fontSize=8, fontName="Helvetica",
                          textColor=TEXT_PRIMARY, leading=11)),
                Paragraph(str(fix)[:70], S("CT4", fontSize=8, fontName="Helvetica",
                          textColor=SUCCESS, leading=11)),
            ])

        comp_table = Table(comp_rows, colWidths=[W*0.22, W*0.18, W*0.3, W*0.3])
        comp_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), ACCENT),
            ("BACKGROUND", (0,1), (-1,-1), CARD_BG),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [CARD_BG, WHITE]),
            ("BOX", (0,0), (-1,-1), 1, BORDER),
            ("INNERGRID", (0,0), (-1,-1), 0.3, BORDER),
            ("TOPPADDING", (0,0), (-1,-1), 6),
            ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ("LEFTPADDING", (0,0), (-1,-1), 6),
            ("RIGHTPADDING", (0,0), (-1,-1), 6),
            ("VALIGN", (0,0), (-1,-1), "TOP"),
        ]))
        story.append(comp_table)
        story.append(Spacer(1, 10))

    # ── REFINING AGENT OUTPUT ─────────────────────────────────────────────────
    refining = report.get("agents", {}).get("refining", {})
    if refining:
        story.append(Paragraph("🔬 Refined Idea Analysis", style_h2))
        if refining.get("idea_statement"):
            story.append(Paragraph(f"<b>Polished Statement:</b> {refining['idea_statement']}", style_body))
        if refining.get("value_proposition"):
            story.append(Paragraph(f"<b>Value Proposition:</b> {refining['value_proposition']}", style_body))
        if refining.get("target_market"):
            story.append(Paragraph(f"<b>Target Market:</b> {refining['target_market']}", style_body))
        story.append(Spacer(1, 8))

    # ── INNOVATION IDEAS ──────────────────────────────────────────────────────
    innovation = report.get("agents", {}).get("innovation", {})
    ideas = innovation.get("ideas", [])
    if ideas:
        story.append(Paragraph("💡 Innovation & Differentiation", style_h2))
        if innovation.get("differentiation_strategy"):
            story.append(Paragraph(innovation["differentiation_strategy"], style_body))
            story.append(Spacer(1, 6))

        for idea in ideas[:5]:
            feat = idea.get("feature", "")
            desc = idea.get("description", "")
            feas = idea.get("feasibility", 0)
            imp = idea.get("impact", 0)
            cost = idea.get("estimated_cost_inr", "")
            story.append(Paragraph(
                f"<b>{feat}</b> — Feasibility: {feas}/10 | Impact: {imp}/10"
                + (f" | Cost: {cost}" if cost else ""),
                S("IdeaTitle", fontSize=9.5, fontName="Helvetica-Bold",
                  textColor=ACCENT2, leading=13)
            ))
            story.append(Paragraph(desc, style_small))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

    # ── DEEP RESEARCH SUMMARY ─────────────────────────────────────────────────
    deep = report.get("agents", {}).get("deep_research", {})
    if deep:
        story.append(Paragraph("📊 Deep Market Research", style_h2))
        if deep.get("executive_summary"):
            story.append(Paragraph(deep["executive_summary"], style_body))
            story.append(Spacer(1, 6))

        sections = deep.get("sections", [])
        for sec in sections[:4]:
            story.append(Paragraph(sec.get("heading", ""), style_h3))
            content = sec.get("content", "")
            if len(content) > 400:
                content = content[:400] + "..."
            story.append(Paragraph(content, style_body))
            if sec.get("key_insight"):
                story.append(Paragraph(
                    f"💡 <b>Key Insight:</b> {sec['key_insight']}",
                    S("Insight", fontSize=9, fontName="Helvetica-Bold",
                      textColor=ACCENT, leading=12, leftIndent=8)
                ))
            story.append(Spacer(1, 6))

    # ── SOURCES ───────────────────────────────────────────────────────────────
    sources = report.get("sources", [])
    if sources:
        story.append(HRFlowable(width=W, thickness=0.5, color=BORDER))
        story.append(Spacer(1, 6))
        story.append(Paragraph("📚 Data Sources", style_h2))
        for src in sources[:10]:
            platform = src.get("platform", "") if isinstance(src, dict) else getattr(src, "platform", "")
            count = src.get("count", 0) if isinstance(src, dict) else getattr(src, "count", 0)
            signal = src.get("sample_signal", "") if isinstance(src, dict) else getattr(src, "sample_signal", "")
            story.append(Paragraph(
                f"<b>{platform}</b> ({count} signals) — {str(signal)[:80]}",
                style_small
            ))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width=W, thickness=1, color=ACCENT))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"Generated by <b>IdeaProbe AI</b> • ideaprobe.app • "
        f"Scan ID: #{scan_id} • {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        S("Footer", fontSize=7.5, textColor=TEXT_SECONDARY, fontName="Helvetica",
          alignment=TA_CENTER, leading=10)
    ))
    story.append(Paragraph(
        "⚠️ This report is AI-generated for informational purposes only. Verify all data independently before making business decisions.",
        S("Disclaimer", fontSize=7, textColor=TEXT_SECONDARY, fontName="Helvetica",
          alignment=TA_CENTER, leading=10)
    ))

    # ── Build PDF ─────────────────────────────────────────────────────────────
    doc.build(story)
    buffer.seek(0)
    return buffer.read()


@router.get("/{scan_id}")
async def download_pdf(scan_id: int):
    """Download a premium PDF report for a completed scan."""
    try:
        pdf_bytes = await generate_pdf_bytes(scan_id)
        filename = f"ideaprobe-report-{scan_id}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation failed for scan {scan_id}: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
