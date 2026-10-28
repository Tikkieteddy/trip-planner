from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "HANDOVER_SUMMARY.pdf"
FONT = Path(r"C:\Windows\Fonts\tahoma.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\tahomabd.ttf")

pdfmetrics.registerFont(TTFont("Thai", str(FONT)))
pdfmetrics.registerFont(TTFont("Thai-Bold", str(FONT_BOLD)))

GREEN = colors.HexColor("#174b3e")
INK = colors.HexColor("#20332d")
MUTED = colors.HexColor("#687a73")
PALE = colors.HexColor("#eaf3ed")
GRID = colors.HexColor("#d6e0d9")


class Report(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
                         topMargin=19 * mm, bottomMargin=18 * mm, title="Tikkie Trip Handover")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates(PageTemplate(id="report", frames=frame, onPage=self.draw_page))
        self.heading_count = 0

    def draw_page(self, canvas, doc):
        canvas.saveState()
        if doc.page > 1:
            canvas.setStrokeColor(GRID)
            canvas.line(18 * mm, 14 * mm, A4[0] - 18 * mm, 14 * mm)
            canvas.setFont("Thai", 8)
            canvas.setFillColor(MUTED)
            canvas.drawString(18 * mm, 9 * mm, "Tikkie Trip - Project Handover | 28 ตุลาคม 2026")
            canvas.drawRightString(A4[0] - 18 * mm, 9 * mm, f"หน้า {doc.page}")
        canvas.restoreState()

    def beforeDocument(self):
        self.heading_count = 0

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name in ("H1", "H2"):
            level = 0 if flowable.style.name == "H1" else 1
            text = flowable.getPlainText()
            key = f"h{self.heading_count}"
            self.heading_count += 1
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=False)
            self.notify("TOCEntry", (level, text, self.page, key))


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontName="Thai-Bold", fontSize=25, leading=36,
                          textColor=GREEN, alignment=TA_CENTER, spaceAfter=10 * mm))
styles.add(ParagraphStyle(name="CoverSub", fontName="Thai", fontSize=12, leading=20,
                          textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1", fontName="Thai-Bold", fontSize=17, leading=23,
                          textColor=GREEN, spaceBefore=5 * mm, spaceAfter=3 * mm, keepWithNext=True))
styles.add(ParagraphStyle(name="H2", fontName="Thai-Bold", fontSize=12, leading=18,
                          textColor=INK, spaceBefore=3 * mm, spaceAfter=2 * mm, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyTH", fontName="Thai", fontSize=9, leading=15,
                          textColor=INK, spaceAfter=2 * mm, splitLongWords=1))
styles.add(ParagraphStyle(name="SmallTH", fontName="Thai", fontSize=7.5, leading=11,
                          textColor=INK, splitLongWords=1))
styles.add(ParagraphStyle(name="BulletTH", parent=styles["BodyTH"], leftIndent=5 * mm,
                          firstLineIndent=-3 * mm, bulletIndent=0))
styles.add(ParagraphStyle(name="TOCTitle", fontName="Thai-Bold", fontSize=19, leading=26,
                          textColor=GREEN, spaceAfter=6 * mm))


def P(text, style="BodyTH"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph("&#8226; " + text, styles["BulletTH"])


def table(rows, widths):
    converted = []
    for row_index, row in enumerate(rows):
        converted.append([P(escape(str(value)).replace("\n", "<br/>"), "SmallTH") for value in row])
    result = Table(converted, colWidths=widths, repeatRows=1, hAlign="LEFT")
    result.setStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PALE),
        ("TEXTCOLOR", (0, 0), (-1, 0), GREEN),
        ("GRID", (0, 0), (-1, -1), 0.4, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ])
    return result


story = [Spacer(1, 35 * mm), P("ชุดเอกสารส่งมอบโปรเจกต์", "CoverTitle"),
         P("Tikkie Trip - EV Travel Planner", "CoverSub"), Spacer(1, 8 * mm),
         P("สำหรับผู้ดูแลและ Claude Code", "CoverSub"), Spacer(1, 10 * mm),
         P("Version 1.2.2 | Build 20261028.1 | 28 ตุลาคม 2026", "CoverSub"),
         Spacer(1, 45 * mm), P("Repository: Tikkieteddy/trip-planner", "CoverSub"),
         P("รายงานนี้อ้างอิง source code และเอกสารที่อยู่ใน repository ณ วันที่ระบุ", "CoverSub"),
         PageBreak(), P("สารบัญ", "TOCTitle")]
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name="TOC0", fontName="Thai-Bold", fontSize=10, leading=16, textColor=GREEN, leftIndent=0),
    ParagraphStyle(name="TOC1", fontName="Thai", fontSize=8.5, leading=13, textColor=INK, leftIndent=8 * mm),
]
story.extend([toc, PageBreak()])

story += [P("1. Executive Summary", "H1"),
          P("เว็บแอป Next.js สำหรับวางแผนเดินทางด้วยรถ EV มีการค้นหาสถานที่และสถานีชาร์จ คำนวณเส้นทาง ประเมินแบตเตอรี่ และจัดเก็บ route แบบ local หรือ Cloud Sync ผ่านบัญชี Auth0", "BodyTH"),
          table([["หัวข้อ", "ตรวจพบ"], ["Frontend", "Next.js App Router, React 19, TypeScript, Tailwind CSS 4"],
                 ["Hosting", "Vercel project trip-planner; production settings NOT VERIFIED"],
                 ["Identity", "Auth0 Next.js SDK; cloud handler scopes by session.user.sub"],
                 ["Persistence", "Upstash Redis REST; no relational schema or migrations found"],
                 ["Map APIs", "Google Maps JavaScript, Places API (New), Routes API"]], [42 * mm, 132 * mm]),
          P("สถานะ: source implementation พบแล้วหลายส่วน แต่ login/Redis/Google live flows, physical mobile QA และ current deployment configuration ยังต้องตรวจแยกต่างหาก", "BodyTH"),
          P("2. Architecture and Data Flow", "H1"),
          P("Browser ส่ง JSON ไป Next.js Route Handlers; handlers validate ด้วย Zod และเรียก Google Places/Routes ด้วย server key. Maps JavaScript API โหลดใน browser ด้วย public restricted key. Auth0 session ปกป้อง cloud route API; Upstash Redis จัดเก็บ route ต่อ subject และ config โฆษณาแบบ global.", "BodyTH"),
          table([["From", "To", "Purpose"], ["Browser", "Next.js APIs", "Place search, route request, cloud route actions"],
                 ["Next.js", "Google Places", "Autocomplete, text/nearby/charger search and details"],
                 ["Next.js", "Google Routes", "Compute driving route and legs"],
                 ["Next.js", "Upstash Redis", "Cloud route library and Ads configuration"],
                 ["Browser", "Maps JS", "Render map, route geometry and markers"]], [35 * mm, 48 * mm, 91 * mm]),
          P("3. Screens and Navigation", "H1"),
          P("พบ 2 หน้าหลัก: / คือ Trip Planner; /cms คือ Ads CMS. /admin/ads redirect ไป /cms. Tutorial 27 ขั้น, tabs, menus และ dialogs เป็น states ในหน้า ไม่ใช่ routes แยก. Wireframes ใน dashboard เป็น schematic จาก components ไม่ใช่ภาพ pixel-perfect.", "BodyTH"),
          bullet("Planner: trip settings, vehicle profile, filters, map search, route panel, itinerary, chargers, nearby places, account/saved routes."),
          bullet("CMS: admin password login, mobile/desktop script fields, enabled toggle, save/logout and setup/storage error states."),
          P("4. Feature Inventory", "H1"),
          P("Implemented in source: trip setup, map and place search, Google route handler, charger along route and polyline segmentation, battery estimate, nearby categories, route serialization, tutorial and shared credit footer. Partial/service-dependent: Auth0, Redis, EV Station PluZ data coverage, app links, touch/phone behavior and Ads. NOT FOUND in repo scan: unit/e2e test suite, SQL schema/migrations and GitHub workflow files.", "BodyTH"),
          P("Audit count: 20 รายการ — Implemented 7, Partial 9, Deprecated 1 และ NOT FOUND 3. Implemented ยืนยันเฉพาะว่าพบโค้ด; ไม่ได้แปลว่า production integration ผ่านการตรวจแล้ว.", "BodyTH"),
          table([["Feature group", "Current status", "Evidence / next verification"],
                 ["Planner + route", "Implemented in source", "Run one-way and round-trip end-to-end"],
                 ["Charging suggestions", "Implemented / provider-dependent", "Verify real results, long routes, coverage"],
                 ["Cloud route sync", "Partial", "Auth0 + Redis test, isolation and second device"],
                 ["Ads CMS", "Partial; last priority", "Provider rules, consent, CSP, storage and login"],
                 ["Automated testing", "NOT FOUND", "npm test currently aliases build"]], [42 * mm, 44 * mm, 88 * mm]),
          P("5. API and Storage", "H1"),
          table([["Method / path", "Access", "Summary"],
                 ["POST /api/places", "Public", "Autocomplete, text, route charger and nearby search"],
                 ["POST /api/place-details", "Public", "Place ID to normalized details"],
                 ["POST /api/routes", "Public", "Driving route, legs, polyline, modifiers"],
                 ["GET/PUT /api/cloud-routes", "Auth0", "Read/write max 25 routes per user"],
                 ["GET /api/ads", "Public", "Only enabled scripts; no-store"],
                 ["POST /api/admin/login/logout", "Admin cookie", "HMAC session exchange / clear"],
                 ["GET/PUT /api/admin/ads", "Admin cookie", "Read/write enabled state and scripts"]], [48 * mm, 32 * mm, 94 * mm]),
          P("Redis key families: trip-planner:cloud-routes:v1:<auth0-sub> stores routes + updatedAt; trip-planner:ads:primary stores enabled, mobileScript, desktopScript and updatedAt. No SQL entities were found.", "BodyTH"),
          P("6. Setup and Verification Commands", "H1"),
          P("npm ci\nnpm run dev\nnpm run lint\nnpm run build\nnpm test  # currently runs build only", "BodyTH"),
          P("Environment names found include NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY, NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, GOOGLE_MAPS_SERVER_KEY, Auth0 SDK settings, UPSTASH_REDIS_REST_URL/TOKEN, ADS_ADMIN_PASSWORD, ADS_ADMIN_SESSION_SECRET and optional Clerk migration secret. Values are intentionally omitted. Verify exact Auth0 SDK variables from installed SDK docs and dashboard.", "BodyTH"),
          P("7. Risks and Limitations", "H1"),
          bullet("Google APIs can incur billing; results depend on data coverage, fields, restrictions and quota."),
          bullet("Never expose server key, Redis token, Auth0 secret or admin secrets; .env.local is excluded."),
          bullet("Cloud route data is keyed by Auth0 subject; legacy Clerk migration is not verified on real accounts."),
          bullet("Ads scripts execute in the browser and require trusted admin, provider policy, consent/privacy and CSP review."),
          bullet("Battery/range is an estimate based on user inputs; it is not a vehicle telemetry guarantee."),
          bullet("No unit/e2e tests found; `npm test` is only a build alias."),
          P("8. Priority Roadmap", "H1"),
          bullet("P0: verify Auth0 sign-in, Redis route save/read, user isolation, cross-device sync and redirect recovery."),
          bullet("P1: exercise real one-way/round-trip Routes + Places/chargers with a controlled small trip and observe quota."),
          bullet("P1: add automated tests for schemas, polyline segmentation, battery edge cases and auth/storage failures."),
          bullet("P2: physical phone QA for map controls, tutorial, result scrolling, share links and footer tooltip."),
          bullet("P3, last: review and test Ads provider, consent/security and CMS before enabling monetization."),
          P("9. Claude Code Takeover Checklist", "H1"),
          bullet("Read CLAUDE.md, HANDOVER.md, DOCUMENT_INDEX.md, DEVELOPMENT_ROADMAP.md and NEXT_STEPS.md."),
          bullet("Inspect git status and verify source before trusting any document."),
          bullet("Validate environment by presence only; never print secret values."),
          bullet("Run lint/build; separate source evidence from external production verification."),
          bullet("Do not deploy, push or alter production data without explicit authorization."),
          P("10. Validation Boundaries", "H1"),
          P("This handover records repository evidence only. Production login, Vercel configuration, Redis availability, Google quota/results, real-user migration, physical-device screenshots and current deployment were not tested as part of document authoring. See HANDOVER_VALIDATION.md for the checklist and per-item status.", "BodyTH"),
          Spacer(1, 4 * mm), P("Source of truth: repository source. When it conflicts with this report, inspect the source and update the handover.", "SmallTH")]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = Report(str(OUTPUT))
doc.multiBuild(story)
print(OUTPUT)
