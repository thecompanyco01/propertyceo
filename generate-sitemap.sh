#!/bin/bash
BASE="https://propertyceo.vercel.app"
DATE="2026-03-06"

cd /home/openclaw/.openclaw/workspaces/agent5/propertyceo

cat > sitemap.xml << XMLHEAD
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><lastmod>${DATE}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE}/blog/</loc><lastmod>${DATE}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE}/courses/</loc><lastmod>${DATE}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE}/free-checklist/</loc><lastmod>${DATE}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE}/cities/</loc><lastmod>${DATE}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE}/services/</loc><lastmod>${DATE}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE}/states/</loc><lastmod>${DATE}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
XMLHEAD

for f in blog/*.html; do
  slug=$(basename "$f" .html)
  [ "$slug" = "index" ] && continue
  echo "  <url><loc>${BASE}/blog/${slug}</loc><lastmod>${DATE}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>" >> sitemap.xml
done

for f in cities/*.html; do
  slug=$(basename "$f" .html)
  [ "$slug" = "index" ] && continue
  echo "  <url><loc>${BASE}/cities/${slug}</loc><lastmod>${DATE}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>" >> sitemap.xml
done

for f in services/*.html; do
  slug=$(basename "$f" .html)
  [ "$slug" = "index" ] && continue
  echo "  <url><loc>${BASE}/services/${slug}</loc><lastmod>${DATE}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>" >> sitemap.xml
done

for f in states/*.html; do
  slug=$(basename "$f" .html)
  [ "$slug" = "index" ] && continue
  echo "  <url><loc>${BASE}/states/${slug}</loc><lastmod>${DATE}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>" >> sitemap.xml
done

echo "</urlset>" >> sitemap.xml
echo "Sitemap generated with $(grep -c '<loc>' sitemap.xml) URLs"
