import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import type { ReportData } from "../types"

const VERDICT_COLOR: Record<string, string> = {
  VALIDATED: "#16A34A",
  PROMISING: "#2563EB",
  RISKY: "#D97706",
  AVOID: "#DC2626",
}

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function downloadReportPDF(ideaText: string, report: ReportData): Promise<void> {
  const vColor = VERDICT_COLOR[report.verdict] || "#475569"

  const competitors = (report.competitors || [])
    .map(
      (c) => `
      <div class="comp-card">
        <div class="comp-header">
          <span class="comp-name">${escapeHtml(c.name)}</span>
          <span class="comp-price">${escapeHtml(c.pricing)}</span>
        </div>
        <p class="field-label">Weakness</p>
        <p class="field-text">${escapeHtml(c.weakness)}</p>
        <div class="edge-box">
          <p class="edge-label">⚡ Your Edge</p>
          <p class="edge-text">${escapeHtml(c.your_fix)}</p>
        </div>
      </div>`
    )
    .join("")

  const trends = (report.search_trends || [])
    .map(
      (t) =>
        `<div class="trend-row">
          <span class="trend-icon">${t.is_rising ? "📈" : "📉"}</span>
          <span class="trend-kw">${escapeHtml(t.keyword)}</span>
          <span class="trend-dir" style="color:${t.is_rising ? "#16A34A" : "#DC2626"}">${escapeHtml(t.trend_direction)}</span>
        </div>`
    )
    .join("")

  const playbook = (report.fix_playbook || [])
    .map(
      (step, i) =>
        `<div class="step-row">
          <span class="step-num">${i + 1}</span>
          <span class="step-text">${escapeHtml(step)}</span>
        </div>`
    )
    .join("")

  const innovations = (report.innovation?.ideas || [])
    .slice(0, 4)
    .map(
      (idea) =>
        `<div class="idea-card">
          <div class="idea-top">
            <span class="idea-feature">${escapeHtml(idea.feature)}</span>
            <div class="idea-badges">
              <span class="badge-f">F:${idea.feasibility}</span>
              <span class="badge-i">I:${idea.impact}</span>
            </div>
          </div>
          <p class="idea-desc">${escapeHtml(idea.description)}</p>
        </div>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #0F172A; padding: 40px; font-size: 13px; }
  .header { background: linear-gradient(135deg, #2563EB, #4F46E5); border-radius: 16px; padding: 28px; color: white; margin-bottom: 28px; }
  .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .header p { opacity: 0.8; font-size: 12px; }
  .score-row { display: flex; align-items: center; gap: 24px; margin: 20px 0; }
  .score-circle { width: 90px; height: 90px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; flex-direction: column; }
  .score-num { font-size: 36px; font-weight: 800; color: white; line-height: 1; }
  .score-max { font-size: 11px; color: rgba(255,255,255,0.7); }
  .verdict-pill { background: rgba(255,255,255,0.2); border-radius: 20px; padding: 6px 16px; display: inline-block; }
  .verdict-text { font-size: 15px; font-weight: 700; color: white; }
  .idea-preview { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px; margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.6; }
  .section { margin-bottom: 24px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #94A3B8; text-transform: uppercase; margin-bottom: 10px; }
  .card { background: #F8FAFC; border-radius: 12px; padding: 16px; border: 1px solid #E2E8F0; }
  .market-row { display: flex; gap: 12px; }
  .market-cell { flex: 1; background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center; }
  .market-label { font-size: 10px; font-weight: 700; color: #64748B; margin-bottom: 4px; }
  .market-value { font-size: 14px; font-weight: 800; color: #0F172A; }
  .check-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start; }
  .check-icon { width: 18px; height: 18px; background: #F0FDF4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; margin-top: 1px; }
  .check-text { font-size: 13px; color: #475569; line-height: 1.5; }
  .comp-card { background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
  .comp-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .comp-name { font-weight: 700; font-size: 14px; }
  .comp-price { color: #94A3B8; font-size: 12px; }
  .field-label { font-size: 10px; font-weight: 600; color: #94A3B8; margin-bottom: 3px; }
  .field-text { font-size: 12px; color: #475569; margin-bottom: 8px; line-height: 1.5; }
  .edge-box { background: #EFF6FF; border-radius: 8px; padding: 10px; }
  .edge-label { font-size: 11px; font-weight: 700; color: #2563EB; margin-bottom: 3px; }
  .edge-text { font-size: 12px; color: #1E40AF; line-height: 1.5; }
  .trend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .trend-kw { font-size: 13px; color: #0F172A; flex: 1; }
  .trend-dir { font-size: 11px; font-weight: 600; }
  .step-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start; }
  .step-num { width: 22px; height: 22px; background: linear-gradient(135deg, #2563EB, #4F46E5); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 700; flex-shrink: 0; }
  .step-text { font-size: 13px; color: #475569; line-height: 1.5; }
  .idea-card { background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
  .idea-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .idea-feature { font-weight: 700; font-size: 14px; }
  .idea-badges { display: flex; gap: 4px; }
  .badge-f { background: #F0FDF4; color: #16A34A; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
  .badge-i { background: #EFF6FF; color: #2563EB; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
  .idea-desc { font-size: 12px; color: #475569; line-height: 1.5; }
  .risk-box { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px; }
  .risk-title { font-weight: 700; color: #D97706; font-size: 13px; margin-bottom: 4px; }
  .risk-text { font-size: 12px; color: #78350F; line-height: 1.5; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 11px; }
  .wa-box { background: linear-gradient(135deg, #F0FDF4, #DCFCE7); border: 1px solid #86EFAC; border-radius: 12px; padding: 16px; margin-top: 20px; text-align: center; }
  .wa-title { font-weight: 700; color: #15803D; font-size: 14px; margin-bottom: 4px; }
  .wa-sub { color: #166534; font-size: 12px; }
  .wa-link { color: #16A34A; font-weight: 700; }
</style>
</head>
<body>
<div class="header">
  <h1>IdeaProbe Validation Report</h1>
  <p>Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
  <div class="score-row">
    <div class="score-circle">
      <span class="score-num">${report.score}</span>
      <span class="score-max">/100</span>
    </div>
    <div>
      <div class="verdict-pill"><span class="verdict-text">${report.verdict}</span></div>
      ${report.industry ? `<p style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:6px">${escapeHtml(report.industry)}</p>` : ""}
    </div>
  </div>
  <div class="idea-preview">${escapeHtml(ideaText)}</div>
</div>

${report.biggest_risk ? `
<div class="section">
  <p class="section-label">Biggest Risk</p>
  <div class="risk-box">
    <p class="risk-title">⚠️ ${escapeHtml(report.biggest_risk)}</p>
  </div>
</div>` : ""}

${report.market ? `
<div class="section">
  <p class="section-label">Market Opportunity</p>
  <div class="market-row">
    <div class="market-cell"><p class="market-label">TAM</p><p class="market-value">${escapeHtml(report.market.tam_usd || "—")}</p></div>
    <div class="market-cell"><p class="market-label">SAM</p><p class="market-value">${escapeHtml(report.market.sam_usd || "—")}</p></div>
    <div class="market-cell"><p class="market-label">SOM</p><p class="market-value">${escapeHtml(report.market.som_usd || "—")}</p></div>
  </div>
</div>` : ""}

${(report.whats_working || []).length > 0 ? `
<div class="section">
  <p class="section-label">What's Working</p>
  <div class="card">
    ${report.whats_working.map(w => `<div class="check-row"><div class="check-icon">✓</div><span class="check-text">${escapeHtml(w)}</span></div>`).join("")}
  </div>
</div>` : ""}

${competitors ? `<div class="section"><p class="section-label">Competitors (${(report.competitors || []).length})</p>${competitors}</div>` : ""}

${trends ? `<div class="section"><p class="section-label">Search Trends</p><div class="card">${trends}</div></div>` : ""}

${playbook ? `<div class="section"><p class="section-label">Action Playbook</p><div class="card">${playbook}</div></div>` : ""}

${innovations ? `<div class="section"><p class="section-label">Innovation Opportunities</p>${innovations}</div>` : ""}

${report.deep_research?.executive_summary ? `
<div class="section">
  <p class="section-label">Market Research Summary</p>
  <div class="card"><p style="font-size:13px;color:#475569;line-height:1.6">${escapeHtml(report.deep_research.executive_summary)}</p></div>
</div>` : ""}

<div class="wa-box">
  <p class="wa-title">💬 Get Expert Consultation</p>
  <p class="wa-sub">Talk to our team on WhatsApp: <span class="wa-link">+91 90355 14817</span></p>
</div>

<div class="footer">
  <p>Generated by IdeaProbe · ideaprobe.iamhashir.com · Powered by AI</p>
</div>
</body>
</html>`

  const { uri } = await Print.printToFileAsync({ html, base64: false })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Save IdeaProbe Report",
      UTI: "com.adobe.pdf",
    })
  } else {
    await Print.printAsync({ html })
  }
}
