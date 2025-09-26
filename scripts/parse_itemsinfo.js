#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { load } from 'cheerio';

const SRC = 'data/itemsinfo.html';
const DEST = 'data/indexed.json';

function extract() {
  const html = readFileSync(SRC, 'utf8');
  const $ = load(html, { decodeEntities: false });
  const rows = $('tbody > tr');
  const items = [];
  rows.each((i, tr) => {
    const $tr = $(tr);
    const tds = $tr.find('> td');
    if (tds.length < 3) return;
    const toolCell = $(tds[0]);
    const locationTextCell = $(tds[1]);
    const locationImageCell = $(tds[2]);

    // Name & icon (first img in tool cell inside the span with class display-card-hyperlink)
    const nameSpan = toolCell.find('.display-card-hyperlink').first();
    let name = nameSpan.text().trim();
    if (!name) {
      // fallback: maybe plain text
      name = toolCell.text().trim().split('\n')[0].trim();
    }
    const iconImg = nameSpan.find('img').first();
    const icon = iconImg.attr('src') || null;

    // Location text (first <p> full text in second cell)
    const locationTextP = locationTextCell.find('p').first();
    const location_text = (locationTextP.text() || '').trim();

    // Location image (first gallery thumbnail img OR first img in that cell)
    let location_image = null;
    const galleryThumb = locationImageCell.find('img').first();
    if (galleryThumb && galleryThumb.attr('src')) {
      location_image = galleryThumb.attr('src');
    }

    if (!name || !icon || !location_text || !location_image) {
      // Skip incomplete rows (or could log)
      return;
    }

    items.push({ name, icon, location_text, location_image });
  });

  writeFileSync(DEST, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Extracted ${items.length} items to ${DEST}`);
}

extract();
