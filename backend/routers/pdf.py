"""
PDF Report Router — Generates a clean PDF report for a completed scan.
GET /api/pdf/{scan_id} -> returns a downloadable PDF file.
"""

import json
import logging
import io
import re
import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from database import AsyncSessionLocal

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pdf", tags=["pdf"])


def _clean(text: str) -> str:
    """Remove emojis and non-latin characters that ReportLab cannot render."""
    if not text:
        return ""
    # Strip emoji and other non-ASCII symbols, keep standard punctuation
    cleaned = re.sub(
        r'[^\x00-\x7F\u00A0-\u024F\u20AC\u00B0\u2013\u2014\u2018\u2019\u201C\u201D\u2026]',
        '',
        str(text)
    )
    # Collapse multiple spaces
    cleaned = re.sub(r'  +', ' ', cleaned).strip()
    return cleaned


def _score_color(score: int) -> tuple:
    if score >= 75:
        return (16, 185, 129)
    elif score >= 50:
        return (245, 158, 11)
    else:
        return (239, 68, 68)


async def generate_pdf_bytes(scan_id: int) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

    # Fetch scan data
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
    idea_text = _clean(row.idea_text)
    score = row.score if row.score is not None else report.get("score", 0)
    verdict = _clean(row.verdict if row.verdict is not None else report.get("verdict", "Pending"))
    created_at = row.created_at
    if isinstance(created_at, str):
        try:
            import datetime as dt_module
            created_at = dt_module.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        except Exception:
            created_at = None

    # Colors
    ACCENT       = colors.HexColor("#6366f1")
    ACCENT2      = colors.HexColor("#8b5cf6")
    GOLD         = colors.HexColor("#f59e0b")
    SUCCESS      = colors.HexColor("#10b981")
    TEXT_PRIMARY = colors.HexColor("#1e293b")
    TEXT_SEC     = colors.HexColor("#64748b")
    CARD_BG      = colors.HexColor("#f8fafc")
    BORDER       = colors.HexColor("#e2e8f0")
    WHITE        = colors.white
    score_color  = colors.Color(*[c/255 for c in _score_color(score)])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.8*cm, leftMargin=1.8*cm,
        topMargin=1.5*cm, bottomMargin=2*cm,
        title=f"IdeaProbe Report - {idea_text[:50]}",
        author="IdeaProbe AI",
    )

    W = A4[0] - 3.6*cm

    def S(name, **kw):
        return ParagraphStyle(name, **kw)

    style_h2    = S("H2", fontSize=13, textColor=ACCENT, fontName="Helvetica-Bold",
                    spaceAfter=4, spaceBefore=14, leading=17)
    style_h3    = S("H3", fontSize=10, textColor=TEXT_PRIMARY, fontName="Helvetica-Bold",
                    spaceAfter=3, spaceBefore=8, leading=13)
    style_body  = S("Body", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                    spaceAfter=4, leading=14)
    style_small = S("Small", fontSize=8, textColor=TEXT_SEC, fontName="Helvetica",
                    spaceAfter=2, leading=11)
    style_center= S("Center", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                    alignment=TA_CENTER, leading=14)
    style_idea  = S("Idea", fontSize=11, textColor=TEXT_SEC, fontName="Helvetica",
                    alignment=TA_CENTER, leading=15, spaceAfter=6)

    story = []

    # HEADER
    header_data = [[
        Paragraph("<b>IdeaProbe</b>", S("Brand", fontSize=18, textColor=ACCENT,
                  fontName="Helvetica-Bold", leading=22)),
        Paragraph(
            f"AI Startup Analysis Report<br/>"
            f"<font size='8' color='#94a3b8'>Generated {created_at.strftime('%B %d, %Y') if created_at else 'Today'}</font>",
            S("HR", fontSize=10, textColor=TEXT_SEC, fontName="Helvetica",
              alignment=TA_RIGHT, leading=14)),
    ]]
    ht = Table(header_data, colWidths=[W*0.5, W*0.5])
    ht.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LINEBELOW", (0,0), (-1,-1), 1.5, ACCENT),
    ]))
    story.append(ht)
    story.append(Spacer(1, 10))

    # SCORE CARD
    score_card = Table([[
        Paragraph(str(score), S("SC", fontSize=36, textColor=score_color,
                  fontName="Helvetica-Bold", alignment=TA_CENTER, leading=42)),
        Paragraph("<font color='#94a3b8'>/100</font>",
                  S("Sub", fontSize=14, fontName="Helvetica", leading=42, textColor=TEXT_SEC)),
        Paragraph(verdict, S("V", fontSize=18, fontName="Helvetica-Bold",
                  textColor=score_color, leading=42, alignment=TA_RIGHT)),
    ]], colWidths=[W*0.2, W*0.2, W*0.6])
    score_card.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BACKGROUND", (0,0), (-1,-1), CARD_BG),
        ("BOX", (0,0), (-1,-1), 1, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("RIGHTPADDING", (0,0), (-1,-1), 16),
    ]))
    story.append(score_card)
    story.append(Spacer(1, 6))
    story.append(Paragraph(f'"{idea_text}"', style_idea))
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 8))

    # MARKET SIZING
    market = report.get("market", {})
    tam = _clean(str(market.get("tam_usd", "N/A")))
    sam = _clean(str(market.get("sam_usd", "N/A")))
    som = _clean(str(market.get("som_usd", "N/A")))

    story.append(Paragraph("Market Opportunity", style_h2))
    mdata = [
        [Paragraph("<b>TAM</b><br/><font size='7' color='#64748b'>Total Addressable Market</font>", style_center),
         Paragraph("<b>SAM</b><br/><font size='7' color='#64748b'>Serviceable Addressable Market</font>", style_center),
         Paragraph("<b>SOM</b><br/><font size='7' color='#64748b'>Serviceable Obtainable Market</font>", style_center)],
        [Paragraph(f"<b>{tam}</b>", S("MV", fontSize=12, fontName="Helvetica-Bold",
                   textColor=ACCENT, alignment=TA_CENTER, leading=16)),
         Paragraph(f"<b>{sam}</b>", S("MV2", fontSize=12, fontName="Helvetica-Bold",
                   textColor=ACCENT2, alignment=TA_CENTER, leading=16)),
         Paragraph(f"<b>{som}</b>", S("MV3", fontSize=12, fontName="Helvetica-Bold",
                   textColor=SUCCESS, alignment=TA_CENTER, leading=16))],
    ]
    mt = Table(mdata, colWidths=[W/3, W/3, W/3])
    mt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), CARD_BG),
        ("BOX", (0,0), (-1,-1), 1, BORDER),
        ("INNERGRID", (0,0), (-1,-1), 0.5, BORDER),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(mt)
    story.append(Spacer(1, 10))

    # BIGGEST RISK
    biggest_risk = _clean(report.get("biggest_risk", ""))
    risk_score = report.get("biggest_risk_score", 5.0)
    if biggest_risk:
        story.append(Paragraph("Biggest Risk", style_h2))
        risk_table = Table([[
            Paragraph(f"<b>Risk Score: {risk_score}/10</b><br/>{biggest_risk}",
                      S("Risk", fontSize=9.5, textColor=TEXT_PRIMARY, fontName="Helvetica",
                        leading=14, leftIndent=4)),
        ]], colWidths=[W])
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

    # WHAT'S WORKING
    whats_working = report.get("whats_working", [])
    if whats_working:
        story.append(Paragraph("What's Working", style_h2))
        for item in whats_working:
            story.append(Paragraph(f"- {_clean(item)}", style_body))
        story.append(Spacer(1, 8))

    # ACTION PLAYBOOK
    fix_playbook = report.get("fix_playbook", [])
    if fix_playbook:
        story.append(Paragraph("Action Playbook", style_h2))
        for i, step in enumerate(fix_playbook, 1):
            step_table = Table([[
                Paragraph(f"<b>{i}</b>", S("Num", fontSize=11, fontName="Helvetica-Bold",
                          textColor=WHITE, alignment=TA_CENTER, leading=14)),
                Paragraph(_clean(step), S("ST", fontSize=9.5, fontName="Helvetica",
                          textColor=TEXT_PRIMARY, leading=14)),
            ]], colWidths=[0.7*cm, W - 0.7*cm])
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

    # COMPETITOR ANALYSIS
    competitors = (
        report.get("agents", {}).get("competitors", {}).get("competitors", [])
        or report.get("competitors", [])
    )
    if competitors:
        story.append(Paragraph("Competitor Analysis", style_h2))
        comp_header = [
            Paragraph("<b>Competitor</b>", S("CH", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE, leading=11)),
            Paragraph("<b>Pricing</b>", S("CH2", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE, alignment=TA_CENTER, leading=11)),
            Paragraph("<b>Key Weakness</b>", S("CH3", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE, leading=11)),
            Paragraph("<b>Your Edge</b>", S("CH4", fontSize=8, fontName="Helvetica-Bold", textColor=WHITE, leading=11)),
        ]
        comp_rows = [comp_header]
        for c in competitors[:7]:
            if isinstance(c, dict):
                name     = _clean(c.get("name", ""))
                pricing  = _clean(str(c.get("pricing", "")))
                weakness = _clean(c.get("weaknesses", [c.get("weakness", "")])[0]
                           if isinstance(c.get("weaknesses"), list) else c.get("weakness", ""))
                fix      = _clean(c.get("your_fix", ""))
            else:
                name     = _clean(getattr(c, "name", ""))
                pricing  = _clean(str(getattr(c, "pricing", "")))
                weakness = _clean(getattr(c, "weakness", ""))
                fix      = _clean(getattr(c, "your_fix", ""))

            comp_rows.append([
                Paragraph(name, S("CT",  fontSize=8, fontName="Helvetica-Bold", textColor=TEXT_PRIMARY, leading=11)),
                Paragraph(pricing, S("CT2", fontSize=8, fontName="Helvetica", textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=11)),
                Paragraph(weakness, S("CT3", fontSize=8, fontName="Helvetica", textColor=TEXT_PRIMARY, leading=11)),
                Paragraph(fix,      S("CT4", fontSize=8, fontName="Helvetica", textColor=SUCCESS, leading=11)),
            ])

        comp_table = Table(comp_rows, colWidths=[W*0.22, W*0.18, W*0.3, W*0.3])
        comp_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), ACCENT),
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

    # REFINED IDEA ANALYSIS
    refining = report.get("agents", {}).get("refining", {})
    if refining:
        story.append(Paragraph("Refined Idea Analysis", style_h2))
        if refining.get("idea_statement"):
            story.append(Paragraph(f"<b>Polished Statement:</b> {_clean(refining['idea_statement'])}", style_body))
        if refining.get("value_proposition"):
            story.append(Paragraph(f"<b>Value Proposition:</b> {_clean(refining['value_proposition'])}", style_body))
        if refining.get("target_market"):
            story.append(Paragraph(f"<b>Target Market:</b> {_clean(refining['target_market'])}", style_body))
        story.append(Spacer(1, 8))

    # INNOVATION IDEAS
    innovation = report.get("agents", {}).get("innovation", {})
    ideas = innovation.get("ideas", [])
    if ideas:
        story.append(Paragraph("Innovation and Differentiation", style_h2))
        if innovation.get("differentiation_strategy"):
            story.append(Paragraph(_clean(innovation["differentiation_strategy"]), style_body))
            story.append(Spacer(1, 6))
        for idea in ideas[:5]:
            feat = _clean(idea.get("feature", ""))
            desc = _clean(idea.get("description", ""))
            feas = idea.get("feasibility", 0)
            imp  = idea.get("impact", 0)
            cost = _clean(str(idea.get("estimated_cost_inr", "")))
            story.append(Paragraph(
                f"<b>{feat}</b> - Feasibility: {feas}/10 | Impact: {imp}/10"
                + (f" | Cost: {cost}" if cost else ""),
                S("IT", fontSize=9.5, fontName="Helvetica-Bold", textColor=ACCENT2, leading=13)
            ))
            story.append(Paragraph(desc, style_small))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

    # DEEP RESEARCH
    deep = report.get("agents", {}).get("deep_research", {})
    if deep:
        story.append(Paragraph("Deep Market Research", style_h2))
        if deep.get("executive_summary"):
            story.append(Paragraph(_clean(deep["executive_summary"]), style_body))
            story.append(Spacer(1, 6))
        for sec in deep.get("sections", [])[:4]:
            story.append(Paragraph(_clean(sec.get("heading", "")), style_h3))
            content = _clean(sec.get("content", ""))
            story.append(Paragraph(content, style_body))
            if sec.get("key_insight"):
                story.append(Paragraph(
                    f"<b>Key Insight:</b> {_clean(sec['key_insight'])}",
                    S("KI", fontSize=9, fontName="Helvetica-Bold", textColor=ACCENT,
                      leading=12, leftIndent=8)
                ))
            story.append(Spacer(1, 6))

    # DATA SOURCES
    sources = report.get("sources", [])
    if sources:
        story.append(HRFlowable(width=W, thickness=0.5, color=BORDER))
        story.append(Spacer(1, 6))
        story.append(Paragraph("Data Sources", style_h2))
        for src in sources[:10]:
            platform = _clean(src.get("platform", "") if isinstance(src, dict) else getattr(src, "platform", ""))
            count    = src.get("count", 0) if isinstance(src, dict) else getattr(src, "count", 0)
            signal   = _clean(src.get("sample_signal", "") if isinstance(src, dict) else getattr(src, "sample_signal", ""))
            story.append(Paragraph(
                f"<b>{platform}</b> ({count} signals) - {signal}",
                style_small
            ))

    # FOOTER
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width=W, thickness=1, color=ACCENT))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"Generated by <b>IdeaProbe AI</b> | ideaprobe.app | "
        f"Scan ID: #{scan_id} | {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        S("Footer", fontSize=7.5, textColor=TEXT_SEC, fontName="Helvetica",
          alignment=TA_CENTER, leading=10)
    ))
    story.append(Paragraph(
        "This report is AI-generated for informational purposes only. "
        "Verify all data independently before making business decisions.",
        S("Disc", fontSize=7, textColor=TEXT_SEC, fontName="Helvetica",
          alignment=TA_CENTER, leading=10)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


@router.get("/{scan_id}")
async def download_pdf(scan_id: int):
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
