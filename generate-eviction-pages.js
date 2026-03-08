const fs = require('fs');
const path = require('path');

// State eviction data - key legal details per state
const states = [
  { name: "Alabama", slug: "alabama", abbr: "AL", noticePayRent: "7 days", noticeLease: "14 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Alabama is considered landlord-friendly. No rent control laws. Landlords can file for eviction after the notice period expires without tenant response." },
  { name: "Alaska", slug: "alaska", abbr: "AK", noticePayRent: "7 days", noticeLease: "10 days (if curable)", noticeNoLease: "30 days", courtType: "District Court", timeline: "3-6 weeks", landlordFriendly: false, notes: "Alaska requires specific notice formats. Tenants have the right to cure lease violations within 10 days. Court hearings typically scheduled within 10-20 days." },
  { name: "Arizona", slug: "arizona", abbr: "AZ", noticePayRent: "5 days", noticeLease: "10 days", noticeNoLease: "30 days", courtType: "Justice Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Arizona has a fast eviction process. The 5-day pay-or-quit notice is one of the shortest in the nation. No rent control allowed by state law." },
  { name: "Arkansas", slug: "arkansas", abbr: "AR", noticePayRent: "3 days (or per lease)", noticeLease: "14 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "Arkansas is very landlord-friendly. Criminal penalties exist for tenants who fail to pay rent after receiving notice. One of the fastest eviction processes." },
  { name: "California", slug: "california", abbr: "CA", noticePayRent: "3 days", noticeLease: "3 days (curable)", noticeNoLease: "30-60 days", courtType: "Superior Court", timeline: "5-12 weeks", landlordFriendly: false, notes: "California has extensive tenant protections including rent control (AB 1482), just cause eviction requirements, and COVID-era protections. The process is longer and more complex." },
  { name: "Colorado", slug: "colorado", abbr: "CO", noticePayRent: "10 days", noticeLease: "10 days", noticeNoLease: "21 days", courtType: "County Court", timeline: "2-5 weeks", landlordFriendly: false, notes: "Colorado recently expanded tenant protections. Notice periods increased in 2023. Some localities have additional protections." },
  { name: "Connecticut", slug: "connecticut", abbr: "CT", noticePayRent: "3 days (lapse of time)", noticeLease: "15 days", noticeNoLease: "3 days", courtType: "Superior Court", timeline: "4-8 weeks", landlordFriendly: false, notes: "Connecticut requires a Notice to Quit before filing. Tenants over 62 have additional protections. The court process can be lengthy." },
  { name: "Delaware", slug: "delaware", abbr: "DE", noticePayRent: "5 days", noticeLease: "7 days", noticeNoLease: "60 days", courtType: "Justice of the Peace Court", timeline: "3-6 weeks", landlordFriendly: false, notes: "Delaware requires landlords to file a summary possession action. The 60-day notice for no-lease situations is longer than most states." },
  { name: "Florida", slug: "florida", abbr: "FL", noticePayRent: "3 days", noticeLease: "7 days (curable)", noticeNoLease: "15 days", courtType: "County Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Florida is landlord-friendly with a relatively fast process. The 3-day notice excludes weekends and holidays. No rent control allowed statewide." },
  { name: "Georgia", slug: "georgia", abbr: "GA", noticePayRent: "Demand for possession (immediate)", noticeLease: "Immediate demand", noticeNoLease: "60 days", courtType: "Magistrate Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Georgia has no mandatory waiting period for nonpayment — landlords can demand possession immediately. Very landlord-friendly state." },
  { name: "Hawaii", slug: "hawaii", abbr: "HI", noticePayRent: "5 days", noticeLease: "10 days", noticeNoLease: "45 days", courtType: "District Court", timeline: "4-8 weeks", landlordFriendly: false, notes: "Hawaii has moderate tenant protections. The process includes mandatory mediation in some cases. Higher court costs than mainland states." },
  { name: "Idaho", slug: "idaho", abbr: "ID", noticePayRent: "3 days", noticeLease: "3 days", noticeNoLease: "30 days", courtType: "Magistrate Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Idaho has a fast, landlord-friendly eviction process with short notice periods. No rent control laws." },
  { name: "Illinois", slug: "illinois", abbr: "IL", noticePayRent: "5 days", noticeLease: "10 days", noticeNoLease: "30 days", courtType: "Circuit Court", timeline: "3-8 weeks", landlordFriendly: false, notes: "Illinois varies significantly by locality. Chicago has its own RLTO with additional tenant protections. Cook County has a right-to-counsel program." },
  { name: "Indiana", slug: "indiana", abbr: "IN", noticePayRent: "10 days", noticeLease: "Reasonable notice", noticeNoLease: "30 days", courtType: "Small Claims Court", timeline: "3-6 weeks", landlordFriendly: true, notes: "Indiana is generally landlord-friendly. The 10-day notice for nonpayment is moderate. No rent control laws." },
  { name: "Iowa", slug: "iowa", abbr: "IA", noticePayRent: "3 days", noticeLease: "7 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Iowa has a straightforward eviction process. The 3-day notice for nonpayment is one of the shortest. Forcible entry and detainer actions move quickly." },
  { name: "Kansas", slug: "kansas", abbr: "KS", noticePayRent: "3 days (10 for 2nd offense)", noticeLease: "14 days (30 for 2nd)", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Kansas allows shorter notice periods for repeat offenses. Generally landlord-friendly with no rent control." },
  { name: "Kentucky", slug: "kentucky", abbr: "KY", noticePayRent: "7 days", noticeLease: "15 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Kentucky has a moderate eviction process. The forcible detainer action is straightforward. No rent control laws." },
  { name: "Louisiana", slug: "louisiana", abbr: "LA", noticePayRent: "5 days", noticeLease: "5 days", noticeNoLease: "10 days", courtType: "Justice of the Peace or City Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "Louisiana has one of the fastest eviction processes in the US. Short notice periods and quick court scheduling make it very landlord-friendly." },
  { name: "Maine", slug: "maine", abbr: "ME", noticePayRent: "7 days", noticeLease: "7 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "4-8 weeks", landlordFriendly: false, notes: "Maine has moderate tenant protections. Portland has additional local protections. The court process can take several weeks." },
  { name: "Maryland", slug: "maryland", abbr: "MD", noticePayRent: "Immediate (file in court)", noticeLease: "30 days", noticeNoLease: "30-60 days", courtType: "District Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Maryland allows immediate filing for nonpayment of rent. Baltimore has additional tenant protections. The process varies by county." },
  { name: "Massachusetts", slug: "massachusetts", abbr: "MA", noticePayRent: "14 days", noticeLease: "30 days (or per lease)", noticeNoLease: "30 days", courtType: "Housing Court", timeline: "6-12 weeks", landlordFriendly: false, notes: "Massachusetts has strong tenant protections. Boston has rent stabilization. The Housing Court process is thorough but slower. Right to counsel available." },
  { name: "Michigan", slug: "michigan", abbr: "MI", noticePayRent: "7 days", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "3-6 weeks", landlordFriendly: true, notes: "Michigan has a moderate process. Detroit has some additional tenant protections. The demand for possession must be properly served." },
  { name: "Minnesota", slug: "minnesota", abbr: "MN", noticePayRent: "14 days", noticeLease: "Reasonable notice", noticeNoLease: "30 days", courtType: "District Court", timeline: "3-6 weeks", landlordFriendly: false, notes: "Minnesota has expanded tenant protections. St. Paul passed rent control. The eviction expungement process allows tenants to seal records." },
  { name: "Mississippi", slug: "mississippi", abbr: "MS", noticePayRent: "3 days", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "Justice Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "Mississippi has one of the fastest eviction processes. Very landlord-friendly with minimal tenant protections. No rent control." },
  { name: "Missouri", slug: "missouri", abbr: "MO", noticePayRent: "Immediate (per lease)", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "Circuit Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Missouri is landlord-friendly. Kansas City and St. Louis have some additional protections. The rent and possession action moves relatively quickly." },
  { name: "Montana", slug: "montana", abbr: "MT", noticePayRent: "3 days", noticeLease: "14 days", noticeNoLease: "30 days", courtType: "Justice Court or District Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Montana has a straightforward process. Short notice period for nonpayment. No rent control laws." },
  { name: "Nebraska", slug: "nebraska", abbr: "NE", noticePayRent: "3 days (7 for 2nd offense)", noticeLease: "14-30 days", noticeNoLease: "30 days", courtType: "County Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Nebraska is landlord-friendly with short notice periods. Omaha has a landlord-tenant mediation program." },
  { name: "Nevada", slug: "nevada", abbr: "NV", noticePayRent: "7 days", noticeLease: "5 days", noticeNoLease: "30 days", courtType: "Justice Court", timeline: "2-5 weeks", landlordFriendly: false, notes: "Nevada updated eviction laws in 2021 with additional tenant protections. Las Vegas Justice Court handles most evictions. Summary eviction process available." },
  { name: "New Hampshire", slug: "new-hampshire", abbr: "NH", noticePayRent: "7 days", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "3-6 weeks", landlordFriendly: false, notes: "New Hampshire requires a written demand for rent before filing. The possessory action process includes mandatory court hearing." },
  { name: "New Jersey", slug: "new-jersey", abbr: "NJ", noticePayRent: "30 days (or immediate for habitual)", noticeLease: "30 days", noticeNoLease: "No removal for at-will tenants without cause", courtType: "Superior Court", timeline: "4-10 weeks", landlordFriendly: false, notes: "New Jersey has very strong tenant protections. Anti-eviction Act requires good cause. Rent control in many municipalities. Can be a lengthy process." },
  { name: "New Mexico", slug: "new-mexico", abbr: "NM", noticePayRent: "3 days", noticeLease: "7 days", noticeNoLease: "30 days", courtType: "Magistrate or Metropolitan Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "New Mexico has a moderate process. The 3-day notice for nonpayment keeps things moving. Albuquerque Metropolitan Court handles many cases." },
  { name: "New York", slug: "new-york", abbr: "NY", noticePayRent: "14 days", noticeLease: "30 days (cure notice)", noticeNoLease: "30-90 days", courtType: "Housing Court (NYC) / City/Town Court", timeline: "6-16+ weeks", landlordFriendly: false, notes: "New York has among the strongest tenant protections in the US. NYC Housing Court is notoriously slow. ERAP and other programs can delay proceedings. Right to counsel in NYC." },
  { name: "North Carolina", slug: "north-carolina", abbr: "NC", noticePayRent: "10 days", noticeLease: "Immediate (per lease terms)", noticeNoLease: "7 days", courtType: "Small Claims / District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "North Carolina has a relatively fast process. Summary ejectment is straightforward. No rent control. Magistrate handles most initial hearings." },
  { name: "North Dakota", slug: "north-dakota", abbr: "ND", noticePayRent: "3 days (written demand)", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "North Dakota has a quick, landlord-friendly process. Eviction for nonpayment can proceed rapidly after the 3-day notice." },
  { name: "Ohio", slug: "ohio", abbr: "OH", noticePayRent: "3 days", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "Municipal Court", timeline: "3-6 weeks", landlordFriendly: true, notes: "Ohio has a moderate process. The 3-day notice is standard. Cleveland and Columbus have some additional local protections." },
  { name: "Oklahoma", slug: "oklahoma", abbr: "OK", noticePayRent: "5 days", noticeLease: "10-15 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Oklahoma is landlord-friendly with a straightforward forcible entry and detainer process. No rent control." },
  { name: "Oregon", slug: "oregon", abbr: "OR", noticePayRent: "13 days (10 for repeat)", noticeLease: "14 days (curable) / 30 days", noticeNoLease: "30-90 days", courtType: "Circuit Court", timeline: "4-8 weeks", landlordFriendly: false, notes: "Oregon has strong tenant protections including statewide rent control (SB 608). Portland has additional protections. Longer notice periods than most states." },
  { name: "Pennsylvania", slug: "pennsylvania", abbr: "PA", noticePayRent: "10 days", noticeLease: "15-30 days", noticeNoLease: "15-30 days", courtType: "Magisterial District Court", timeline: "3-6 weeks", landlordFriendly: true, notes: "Pennsylvania has a moderate process. Philadelphia has its own municipal court and additional tenant protections including a diversion program." },
  { name: "Rhode Island", slug: "rhode-island", abbr: "RI", noticePayRent: "5 days (demand for rent)", noticeLease: "20 days", noticeNoLease: "30 days", courtType: "District Court", timeline: "3-6 weeks", landlordFriendly: false, notes: "Rhode Island has moderate tenant protections. The process is straightforward but court scheduling can cause delays." },
  { name: "South Carolina", slug: "south-carolina", abbr: "SC", noticePayRent: "5 days", noticeLease: "14 days", noticeNoLease: "30 days", courtType: "Magistrate Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "South Carolina has a fast, landlord-friendly process. The Rule to Vacate/Show Cause can be issued quickly. No rent control." },
  { name: "South Dakota", slug: "south-dakota", abbr: "SD", noticePayRent: "3 days", noticeLease: "30 days", noticeNoLease: "30 days", courtType: "Circuit Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "South Dakota has a fast eviction process. The 3-day notice for nonpayment and forcible entry and detainer action moves quickly." },
  { name: "Tennessee", slug: "tennessee", abbr: "TN", noticePayRent: "14 days (30 for 2nd)", noticeLease: "14 days", noticeNoLease: "30 days", courtType: "General Sessions Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Tennessee has a moderate process. The detainer warrant can be issued after notice expires. Nashville/Memphis may have longer timelines." },
  { name: "Texas", slug: "texas", abbr: "TX", noticePayRent: "3 days", noticeLease: "3 days", noticeNoLease: "30 days", courtType: "Justice Court", timeline: "1-4 weeks", landlordFriendly: true, notes: "Texas has one of the fastest eviction processes. The 3-day notice to vacate and quick court scheduling make it very landlord-friendly. No rent control (banned statewide)." },
  { name: "Utah", slug: "utah", abbr: "UT", noticePayRent: "3 days", noticeLease: "3 days", noticeNoLease: "15 days", courtType: "District Court", timeline: "2-4 weeks", landlordFriendly: true, notes: "Utah has a fast eviction process. The unlawful detainer action proceeds quickly after the notice period. No rent control." },
  { name: "Vermont", slug: "vermont", abbr: "VT", noticePayRent: "14 days", noticeLease: "30 days", noticeNoLease: "60 days", courtType: "Superior Court", timeline: "6-12 weeks", landlordFriendly: false, notes: "Vermont has strong tenant protections. Burlington has additional protections. The ejectment process can be lengthy." },
  { name: "Virginia", slug: "virginia", abbr: "VA", noticePayRent: "5 days", noticeLease: "21-30 days", noticeNoLease: "30 days", courtType: "General District Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Virginia updated its landlord-tenant laws in 2020. The unlawful detainer action is straightforward. Northern Virginia courts may be busier." },
  { name: "Washington", slug: "washington", abbr: "WA", noticePayRent: "14 days", noticeLease: "10 days", noticeNoLease: "20 days", courtType: "Superior Court", timeline: "4-8 weeks", landlordFriendly: false, notes: "Washington has strong tenant protections. Seattle has additional ordinances including just cause eviction and relocation assistance requirements." },
  { name: "West Virginia", slug: "west-virginia", abbr: "WV", noticePayRent: "Immediate (no notice required)", noticeLease: "Immediate for cause", noticeNoLease: "30 days", courtType: "Magistrate Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "West Virginia is very landlord-friendly. No mandatory notice for nonpayment — landlords can file immediately. One of the fastest processes in the US." },
  { name: "Wisconsin", slug: "wisconsin", abbr: "WI", noticePayRent: "5 days", noticeLease: "14 days", noticeNoLease: "28 days", courtType: "Small Claims Court", timeline: "2-5 weeks", landlordFriendly: true, notes: "Wisconsin has a moderate process. Milwaukee may have longer timelines. The small claims eviction action is straightforward." },
  { name: "Wyoming", slug: "wyoming", abbr: "WY", noticePayRent: "3 days", noticeLease: "3 days", noticeNoLease: "30 days", courtType: "Circuit Court", timeline: "1-3 weeks", landlordFriendly: true, notes: "Wyoming has a fast, landlord-friendly process. Short notice periods and quick court scheduling. No rent control." },
  { name: "Washington DC", slug: "washington-dc", abbr: "DC", noticePayRent: "30 days", noticeLease: "30 days", noticeNoLease: "90 days", courtType: "DC Superior Court", timeline: "8-16+ weeks", landlordFriendly: false, notes: "DC has among the strongest tenant protections in the US. Rent control, right to counsel, and extensive procedural requirements make the process lengthy." }
];

const dir = path.join(__dirname, 'eviction');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function generatePage(state) {
  const friendlyLabel = state.landlordFriendly ? '🟢 Landlord-Friendly' : '🔴 Tenant-Friendly';
  
  const nearbyStates = states
    .filter(s => s.slug !== state.slug && s.slug !== 'washington-dc')
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.name} Eviction Process: Laws, Timeline & Notice Requirements (2026) | PropertyCEO</title>
    <meta name="description" content="Complete guide to the ${state.name} eviction process. Notice periods, court filing, timeline, costs, and tenant rights for ${state.abbr} landlords and property managers.">
    <meta name="keywords" content="eviction process ${state.name.toLowerCase()}, ${state.name.toLowerCase()} eviction laws, ${state.name.toLowerCase()} eviction notice, how to evict tenant ${state.name.toLowerCase()}, ${state.abbr.toLowerCase()} eviction timeline">
    <link rel="canonical" href="https://propertyceo.vercel.app/eviction/${state.slug}">
    <meta property="og:title" content="${state.name} Eviction Process: Complete Guide (2026)">
    <meta property="og:description" content="Everything landlords need to know about evicting a tenant in ${state.name} — notice periods, court process, costs, and timeline.">
    <meta property="og:type" content="article">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${state.name} Eviction Process: Laws, Timeline & Notice Requirements",
        "description": "Complete guide to the eviction process in ${state.name} for landlords and property managers.",
        "author": {"@type": "Organization", "name": "PropertyCEO"},
        "publisher": {"@type": "Organization", "name": "PropertyCEO"},
        "datePublished": "2026-03-08",
        "dateModified": "2026-03-08"
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long does the eviction process take in ${state.name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The typical eviction timeline in ${state.name} is ${state.timeline}, depending on the reason for eviction and whether the tenant contests. Nonpayment cases are generally faster than lease violation cases."
                }
            },
            {
                "@type": "Question",
                "name": "How much notice do I need to give before evicting a tenant in ${state.name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In ${state.name}, the notice period depends on the reason: ${state.noticePayRent} for nonpayment of rent, ${state.noticeLease} for lease violations, and ${state.noticeNoLease} for no-cause terminations."
                }
            },
            {
                "@type": "Question",
                "name": "Is ${state.name} a landlord-friendly state for evictions?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${state.landlordFriendly ? state.name + ' is generally considered landlord-friendly with relatively short notice periods and a streamlined eviction process.' : state.name + ' has stronger tenant protections, which can make the eviction process longer and more complex for landlords.'}"
                }
            },
            {
                "@type": "Question",
                "name": "What court handles evictions in ${state.name}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Eviction cases in ${state.name} are filed in ${state.courtType}. Filing fees vary by county."
                }
            }
        ]
    }
    </script>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--primary:#1a1a2e;--accent:#e94560;--accent-hover:#d63851;--bg:#0f0f1a;--card-bg:#16213e;--text:#eaeaea;--text-muted:#a0a0b0}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.8}
        nav{padding:20px 40px;display:flex;justify-content:space-between;align-items:center;max-width:900px;margin:0 auto}
        .logo{font-size:24px;font-weight:800;text-decoration:none;color:var(--text)}
        .logo span{color:var(--accent)}
        .back-link{color:var(--accent);text-decoration:none;font-size:14px;font-weight:600}
        article{max-width:720px;margin:0 auto;padding:40px 24px 80px}
        .article-badge{display:inline-block;background:rgba(233,69,96,0.15);color:var(--accent);padding:6px 16px;border-radius:100px;font-size:13px;font-weight:600;margin-bottom:20px}
        h1{font-size:clamp(28px,5vw,42px);font-weight:900;line-height:1.15;margin-bottom:20px;letter-spacing:-1.5px}
        .article-meta{color:var(--text-muted);font-size:14px;margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.08)}
        h2{font-size:26px;font-weight:800;margin:48px 0 16px;letter-spacing:-0.5px}
        h3{font-size:20px;font-weight:700;margin:32px 0 12px}
        p{margin-bottom:20px;color:var(--text-muted);font-size:17px}
        strong{color:var(--text)}
        ul,ol{margin:0 0 24px 24px;color:var(--text-muted)}
        li{margin-bottom:8px;font-size:17px}
        .highlight-box{background:var(--card-bg);border-left:4px solid var(--accent);padding:20px 24px;border-radius:0 12px 12px 0;margin:32px 0}
        .highlight-box p{margin:0;color:var(--text);font-weight:500}
        .info-table{width:100%;border-collapse:collapse;margin:24px 0}
        .info-table th,.info-table td{padding:14px 18px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)}
        .info-table th{background:var(--card-bg);color:var(--text);font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.5px}
        .info-table td{color:var(--text-muted);font-size:16px}
        .info-table tr:hover td{background:rgba(233,69,96,0.04)}
        .badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:600}
        .badge-green{background:rgba(46,204,113,0.15);color:#2ecc71}
        .badge-red{background:rgba(233,69,96,0.15);color:#e94560}
        .step-number{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:var(--accent);color:white;border-radius:50%;font-weight:700;font-size:14px;margin-right:12px;flex-shrink:0}
        .step{display:flex;align-items:flex-start;margin-bottom:24px}
        .step-content h3{margin:0 0 8px;font-size:18px}
        .step-content p{margin:0;font-size:15px}
        .cta-inline{background:linear-gradient(135deg,rgba(233,69,96,0.12),rgba(22,33,62,0.8));border:1px solid rgba(233,69,96,0.2);border-radius:16px;padding:32px;text-align:center;margin:48px 0}
        .cta-inline h3{margin-top:0;color:var(--text)}
        .cta-inline p{color:var(--text-muted)}
        .btn-primary{display:inline-block;padding:14px 28px;background:var(--accent);color:white;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none}
        .btn-primary:hover{background:var(--accent-hover)}
        .related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:24px 0}
        .related-link{display:block;padding:14px 18px;background:var(--card-bg);border-radius:10px;color:var(--text-muted);text-decoration:none;font-size:14px;font-weight:500;transition:all 0.2s}
        .related-link:hover{color:var(--accent);transform:translateY(-2px)}
        footer{text-align:center;padding:40px;color:var(--text-muted);font-size:14px;border-top:1px solid rgba(255,255,255,0.05)}
        footer a{color:var(--accent);text-decoration:none}
        @media(max-width:600px){nav,article{padding-left:20px;padding-right:20px}.info-table th,.info-table td{padding:10px 12px;font-size:14px}.related-grid{grid-template-columns:1fr 1fr}}
    </style>
</head>
<body>
    <nav>
        <a href="/" class="logo">Property<span>CEO</span></a>
        <a href="/eviction/" class="back-link">← All States</a>
    </nav>
    <article>
        <div class="article-badge">Eviction Guide — ${state.abbr}</div>
        <h1>${state.name} Eviction Process: Laws, Timeline & Notice Requirements</h1>
        <div class="article-meta">Updated March 2026 · ${friendlyLabel}</div>

        <p>Understanding the <strong>eviction process in ${state.name}</strong> is critical for landlords and property managers who need to legally remove a tenant. This guide covers <strong>${state.name} eviction laws</strong>, required notice periods, court procedures, costs, and timeline — everything you need to handle an eviction correctly in ${state.abbr}.</p>

        <div class="highlight-box">
            <p>⚡ Quick Summary: ${state.name} requires <strong>${state.noticePayRent}</strong> notice for nonpayment of rent. Evictions are filed in <strong>${state.courtType}</strong> and typically take <strong>${state.timeline}</strong> from start to finish.</p>
        </div>

        <h2>${state.name} Eviction Notice Requirements</h2>
        <p>Before filing an eviction in ${state.name}, landlords must provide the tenant with proper written notice. The type and length of notice depends on the reason for eviction:</p>

        <table class="info-table">
            <thead>
                <tr><th>Reason for Eviction</th><th>Notice Period</th><th>Curable?</th></tr>
            </thead>
            <tbody>
                <tr><td><strong>Nonpayment of Rent</strong></td><td>${state.noticePayRent}</td><td>Yes — tenant can pay to stop eviction</td></tr>
                <tr><td><strong>Lease Violation</strong></td><td>${state.noticeLease}</td><td>Usually — depends on violation type</td></tr>
                <tr><td><strong>No Lease / End of Tenancy</strong></td><td>${state.noticeNoLease}</td><td>No — termination notice only</td></tr>
                <tr><td><strong>Illegal Activity</strong></td><td>Immediate to 3 days</td><td>No</td></tr>
            </tbody>
        </table>

        <h2>Step-by-Step: How to Evict a Tenant in ${state.name}</h2>

        <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
                <h3>Serve Written Notice</h3>
                <p>Deliver the appropriate notice (pay or quit, cure or quit, or unconditional quit) to the tenant. In ${state.name}, notice must typically be delivered in person, posted on the door, or sent via certified mail. Keep proof of service — you'll need it in court.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
                <h3>Wait for Notice Period to Expire</h3>
                <p>The tenant has <strong>${state.noticePayRent}</strong> (for nonpayment) to either comply or vacate. If they pay the rent or fix the violation within this period, the eviction stops. If not, proceed to step 3.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
                <h3>File Eviction in ${state.courtType}</h3>
                <p>File the eviction complaint (also called unlawful detainer, forcible entry and detainer, or summary possession depending on ${state.name} terminology) with the ${state.courtType}. You'll need to pay a filing fee (typically $50-$200) and provide copies of the lease, notice, and proof of service.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">4</span>
            <div class="step-content">
                <h3>Serve the Tenant with Court Papers</h3>
                <p>The tenant must be formally served with the court summons and complaint. In ${state.name}, this is usually done by a sheriff, constable, or process server. The tenant typically has 5-10 days to respond.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">5</span>
            <div class="step-content">
                <h3>Attend Court Hearing</h3>
                <p>Both parties present their case before the judge. Bring all documentation: the lease, notice with proof of service, rent ledger, photos, and any communication records. If the tenant doesn't appear, you'll likely win a default judgment.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">6</span>
            <div class="step-content">
                <h3>Obtain Writ of Possession</h3>
                <p>If you win, the court issues a writ of possession (or similar order). This authorizes law enforcement to physically remove the tenant. The tenant usually gets a final 24-72 hours to leave voluntarily.</p>
            </div>
        </div>
        <div class="step">
            <span class="step-number">7</span>
            <div class="step-content">
                <h3>Sheriff Enforces Removal</h3>
                <p>If the tenant still hasn't left, the sheriff or constable will forcibly remove them and their belongings. <strong>Never attempt a self-help eviction</strong> (changing locks, removing belongings, shutting off utilities) — this is illegal in ${state.name} and can result in the tenant suing you.</p>
            </div>
        </div>

        <h2>${state.name} Eviction Timeline</h2>
        <p>The total eviction process in ${state.name} typically takes <strong>${state.timeline}</strong> from serving the initial notice to the tenant being removed. Here's the typical breakdown:</p>
        <ul>
            <li><strong>Notice period:</strong> ${state.noticePayRent} (nonpayment) to ${state.noticeNoLease} (no cause)</li>
            <li><strong>Court filing to hearing:</strong> 5-14 days in most ${state.name} courts</li>
            <li><strong>Judgment to writ of possession:</strong> 1-7 days</li>
            <li><strong>Writ execution:</strong> 1-7 days</li>
        </ul>
        <p>${state.notes}</p>

        <div class="highlight-box">
            <p>💡 Pro Tip: Contested evictions take significantly longer. If the tenant hires an attorney and raises defenses, add 2-8 weeks to the timeline. Proper documentation from day one is your best protection.</p>
        </div>

        <h2>Is ${state.name} Landlord-Friendly?</h2>
        <p>${state.landlordFriendly 
          ? `<strong>Yes, ${state.name} is generally considered a landlord-friendly state.</strong> The eviction process is relatively straightforward with shorter notice periods and fewer procedural hurdles compared to tenant-friendly states. Landlords can typically move through the process in ${state.timeline}. ${state.name} does not have statewide rent control, giving property managers more flexibility in setting rental rates.`
          : `<strong>${state.name} is generally considered a tenant-friendly state.</strong> The eviction process includes stronger tenant protections, potentially longer notice periods, and more procedural requirements. The process typically takes ${state.timeline}, and may take longer if the tenant contests or raises defenses. Some ${state.name} localities have additional protections beyond state law.`
        }</p>

        <h2>${state.name} Eviction Costs</h2>
        <p>Budget for these typical costs when evicting a tenant in ${state.name}:</p>
        <table class="info-table">
            <thead><tr><th>Cost Item</th><th>Typical Range</th></tr></thead>
            <tbody>
                <tr><td>Court filing fee</td><td>$50 - $200</td></tr>
                <tr><td>Process server / sheriff service</td><td>$30 - $100</td></tr>
                <tr><td>Attorney fees (if used)</td><td>$500 - $2,500</td></tr>
                <tr><td>Lost rent during process</td><td>1-3 months of rent</td></tr>
                <tr><td>Property cleanup / repairs</td><td>$200 - $5,000+</td></tr>
                <tr><td><strong>Total estimated cost</strong></td><td><strong>$1,000 - $10,000+</strong></td></tr>
            </tbody>
        </table>
        <p>The biggest cost is usually <strong>lost rent</strong> during the eviction process. That's why acting quickly and following the correct procedure is critical — delays cost real money.</p>

        <h2>Common Mistakes to Avoid</h2>
        <ol>
            <li><strong>Self-help eviction:</strong> Changing locks, removing belongings, or shutting off utilities is illegal in ${state.name}. Always go through the court process.</li>
            <li><strong>Improper notice:</strong> Using the wrong notice type, wrong timeframe, or wrong delivery method can reset the entire process.</li>
            <li><strong>Retaliatory eviction:</strong> You cannot evict a tenant for reporting code violations, requesting repairs, or exercising their legal rights.</li>
            <li><strong>Discriminatory eviction:</strong> Fair housing laws (federal and ${state.name} state) prohibit eviction based on race, religion, sex, familial status, disability, or other protected classes.</li>
            <li><strong>Accepting rent after notice:</strong> If you accept rent after serving an eviction notice, you may waive your right to proceed with that eviction.</li>
        </ol>

        <div class="cta-inline">
            <h3>Managing Evictions Is Expensive. Growing Your Business Doesn't Have To Be.</h3>
            <p>Learn proven strategies to screen better tenants, reduce turnover, and grow your property management company — even in ${state.name}'s market.</p>
            <a href="/courses" class="btn-primary">Get the Growth Playbook →</a>
        </div>

        <h2>Alternatives to Eviction in ${state.name}</h2>
        <p>Before going through the formal eviction process, consider these alternatives that can save time and money:</p>
        <ul>
            <li><strong>Cash for keys:</strong> Offer the tenant a payment to leave voluntarily. Often cheaper and faster than formal eviction.</li>
            <li><strong>Payment plan:</strong> If the tenant is behind on rent but has a job, a structured payment plan may recover the debt without court costs.</li>
            <li><strong>Mediation:</strong> Many ${state.name} courts offer free or low-cost mediation services for landlord-tenant disputes.</li>
            <li><strong>Lease non-renewal:</strong> If the lease is expiring soon, simply don't renew (with proper ${state.noticeNoLease} notice).</li>
        </ul>

        <h2>When to Hire an Attorney</h2>
        <p>While many landlords handle straightforward evictions themselves, consider hiring a ${state.name} eviction attorney if:</p>
        <ul>
            <li>The tenant has an attorney or legal aid representation</li>
            <li>The tenant raises habitability, discrimination, or retaliation defenses</li>
            <li>You own multiple properties and evict regularly</li>
            <li>Local ${state.name} laws add complexity beyond state requirements</li>
            <li>The tenant threatens to countersue</li>
        </ul>

        <h2>Related Resources</h2>
        <ul>
            <li><a href="/blog/eviction-process" style="color:var(--accent)">Complete Eviction Process Guide (All States)</a></li>
            <li><a href="/blog/eviction-notice-template" style="color:var(--accent)">Free Eviction Notice Template</a></li>
            <li><a href="/blog/30-day-notice-to-vacate" style="color:var(--accent)">30-Day Notice to Vacate Guide</a></li>
            <li><a href="/blog/how-to-evict-a-tenant" style="color:var(--accent)">How to Evict a Tenant: Step-by-Step</a></li>
            <li><a href="/blog/how-to-screen-tenants" style="color:var(--accent)">How to Screen Tenants (Prevent Future Evictions)</a></li>
            <li><a href="/blog/security-deposit-laws-guide" style="color:var(--accent)">Security Deposit Laws by State</a></li>
            <li><a href="/blog/lease-agreement-template" style="color:var(--accent)">Free Lease Agreement Template</a></li>
        </ul>

        <h2>Eviction Process in Other States</h2>
        <div class="related-grid">
            ${nearbyStates.map(s => `<a href="/eviction/${s.slug}" class="related-link">${s.name} Eviction →</a>`).join('\n            ')}
            <a href="/eviction/" class="related-link">All 50 States →</a>
        </div>
    </article>

    <footer>
        <p>&copy; 2026 <a href="/">PropertyCEO</a> · <a href="/blog">Blog</a> · <a href="/courses">Courses</a> · <a href="/eviction/">Eviction Guides</a></p>
        <p style="margin-top:8px;font-size:12px">This is general information, not legal advice. Consult a ${state.name} attorney for your specific situation.</p>
    </footer>
</body>
</html>`;
}

// Generate all state pages
let count = 0;
for (const state of states) {
  const html = generatePage(state);
  fs.writeFileSync(path.join(dir, `${state.slug}.html`), html);
  count++;
}
console.log(`Generated ${count} state eviction pages`);

// Generate index page
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eviction Process by State: Laws, Notice Periods & Timelines (2026) | PropertyCEO</title>
    <meta name="description" content="Complete guide to eviction laws in all 50 states. Notice periods, timelines, court procedures, and whether each state is landlord or tenant-friendly.">
    <link rel="canonical" href="https://propertyceo.vercel.app/eviction/">
    <meta property="og:title" content="Eviction Process by State (2026)">
    <meta property="og:description" content="Eviction laws, notice periods, and timelines for all 50 US states.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--primary:#1a1a2e;--accent:#e94560;--accent-hover:#d63851;--bg:#0f0f1a;--card-bg:#16213e;--text:#eaeaea;--text-muted:#a0a0b0}
        body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.7}
        nav{padding:20px 40px;display:flex;justify-content:space-between;align-items:center;max-width:1100px;margin:0 auto}
        .logo{font-size:24px;font-weight:800;text-decoration:none;color:var(--text)}
        .logo span{color:var(--accent)}
        .nav-links a{color:var(--accent);text-decoration:none;font-size:14px;font-weight:600;margin-left:20px}
        main{max-width:1100px;margin:0 auto;padding:40px 40px 80px}
        h1{font-size:clamp(28px,5vw,42px);font-weight:900;letter-spacing:-1.5px;margin-bottom:16px}
        .subtitle{color:var(--text-muted);font-size:18px;margin-bottom:40px}
        .state-table{width:100%;border-collapse:collapse;margin:32px 0}
        .state-table th,.state-table td{padding:12px 16px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)}
        .state-table th{background:var(--card-bg);color:var(--text);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;position:sticky;top:0}
        .state-table td{color:var(--text-muted);font-size:15px}
        .state-table tr:hover td{background:rgba(233,69,96,0.04)}
        .state-table a{color:var(--accent);text-decoration:none;font-weight:600}
        .state-table a:hover{text-decoration:underline}
        .badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:12px;font-weight:600}
        .badge-green{background:rgba(46,204,113,0.15);color:#2ecc71}
        .badge-red{background:rgba(233,69,96,0.15);color:#e94560}
        .intro{max-width:720px;margin-bottom:32px}
        .intro p{color:var(--text-muted);font-size:17px;margin-bottom:16px}
        footer{text-align:center;padding:40px;color:var(--text-muted);font-size:14px;border-top:1px solid rgba(255,255,255,0.05)}
        footer a{color:var(--accent);text-decoration:none}
        @media(max-width:768px){.state-table{display:block;overflow-x:auto}nav,main{padding-left:20px;padding-right:20px}.hide-mobile{display:none}}
    </style>
</head>
<body>
    <nav>
        <a href="/" class="logo">Property<span>CEO</span></a>
        <div class="nav-links">
            <a href="/blog">Blog</a>
            <a href="/courses">Courses</a>
            <a href="/compare/">Reviews</a>
        </div>
    </nav>
    <main>
        <h1>Eviction Process by State</h1>
        <p class="subtitle">Complete eviction laws, notice periods, and timelines for all 50 states + DC.</p>
        
        <div class="intro">
            <p>Every state has different <strong>eviction laws and procedures</strong>. The notice period, court process, and timeline can vary dramatically — from as fast as 1 week in landlord-friendly states to 4+ months in tenant-friendly jurisdictions.</p>
            <p>Use this guide to find the exact eviction requirements for your state. Click any state for a detailed breakdown including step-by-step instructions, costs, and common mistakes to avoid.</p>
        </div>

        <table class="state-table">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Nonpayment Notice</th>
                    <th>Lease Violation</th>
                    <th class="hide-mobile">No-Cause Notice</th>
                    <th>Timeline</th>
                    <th>Rating</th>
                </tr>
            </thead>
            <tbody>
${states.map(s => `                <tr>
                    <td><a href="/eviction/${s.slug}">${s.name}</a></td>
                    <td>${s.noticePayRent}</td>
                    <td>${s.noticeLease}</td>
                    <td class="hide-mobile">${s.noticeNoLease}</td>
                    <td>${s.timeline}</td>
                    <td><span class="badge ${s.landlordFriendly ? 'badge-green' : 'badge-red'}">${s.landlordFriendly ? 'Landlord' : 'Tenant'}</span></td>
                </tr>`).join('\n')}
            </tbody>
        </table>

        <div style="background:linear-gradient(135deg,rgba(233,69,96,0.12),rgba(22,33,62,0.8));border:1px solid rgba(233,69,96,0.2);border-radius:16px;padding:32px;text-align:center;margin:48px 0">
            <h3 style="margin-bottom:12px">Better Tenants = Fewer Evictions</h3>
            <p style="color:var(--text-muted);margin-bottom:20px">Learn how to screen tenants effectively, reduce turnover, and grow your property management business.</p>
            <a href="/courses" class="btn-primary" style="display:inline-block;padding:14px 28px;background:var(--accent);color:white;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Get the Growth Playbook →</a>
        </div>
    </main>
    <footer>
        <p>&copy; 2026 <a href="/">PropertyCEO</a> · <a href="/blog">Blog</a> · <a href="/courses">Courses</a></p>
        <p style="margin-top:8px;font-size:12px">This is general information, not legal advice. Consult an attorney in your state for specific guidance.</p>
    </footer>
</body>
</html>`;

fs.writeFileSync(path.join(dir, 'index.html'), indexHtml);
console.log('Generated eviction index page');
console.log(`Total files: ${count + 1}`);
