import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RETRIEVAL_DATE = '2026-08-31';
const categories = [
  { key: 'strollers', query: 'stroller' },
  { key: 'toddler-products', query: 'Toddler' },
];

function normalizeDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function isUsableUpc(value) {
  return [8, 12, 13, 14].includes(normalizeDigits(value).length);
}

function flattenText(items, field) {
  return (items ?? []).map((item) => item?.[field]).filter(Boolean).join(' ');
}

function freeTextIdentifierSignals(record) {
  const text = [
    record.Description,
    ...(record.Products ?? []).flatMap((product) => [product.Name, product.Description]),
  ]
    .filter(Boolean)
    .join(' ');

  return {
    model: /\bmodel(?:s|\s+(?:name|number)s?)?\b[^.!?\n]{0,160}\b[A-Z0-9][A-Z0-9./-]{2,}\b/i.test(text),
    upc: /\bUPC(?:s|\s+(?:code|number)s?)?\b[^.!?\n]{0,100}\b\d[\d -]{6,}\d\b/i.test(text),
  };
}

function analyze(records) {
  const perRecord = records.map((record) => {
    const models = (record.Products ?? [])
      .map((product) => String(product.Model ?? '').trim())
      .filter(Boolean);
    const upcs = (record.ProductUPCs ?? [])
      .map((entry) => String(entry.UPC ?? '').trim())
      .filter(Boolean);
    const signals = freeTextIdentifierSignals(record);

    return {
      record,
      models,
      upcs,
      usableUpcs: upcs.filter(isUsableUpc),
      malformedUpcs: upcs.filter((value) => !isUsableUpc(value)),
      signals,
    };
  });

  const count = (predicate) => perRecord.filter(predicate).length;
  const total = records.length;
  const modelPopulated = count((item) => item.models.length > 0);
  const upcPopulated = count((item) => item.usableUpcs.length > 0);

  return {
    totalRecords: total,
    usableProductModelRecords: modelPopulated,
    usableProductModelPercent: Number(((modelPopulated / total) * 100).toFixed(1)),
    usableUpcRecords: upcPopulated,
    usableUpcPercent: Number(((upcPopulated / total) * 100).toFixed(1)),
    missingProductModelRecords: count((item) => item.models.length === 0),
    missingUpcRecords: count((item) => item.upcs.length === 0),
    malformedUpcRecords: count((item) => item.malformedUpcs.length > 0),
    ambiguousRecallLevelUpcRecords: count(
      (item) => item.usableUpcs.length > 0 && ((item.record.Products ?? []).length > 1 || item.usableUpcs.length > 1),
    ),
    multipleStructuredModelRecords: count((item) => new Set(item.models).size > 1),
    multipleProductEntryRecords: count((item) => (item.record.Products ?? []).length > 1),
    modelOnlyInFreeTextRecords: count((item) => item.models.length === 0 && item.signals.model),
    upcOnlyInFreeTextRecords: count((item) => item.upcs.length === 0 && item.signals.upc),
    structuredModelValues: [...new Set(perRecord.flatMap((item) => item.models))],
    structuredUpcValues: [...new Set(perRecord.flatMap((item) => item.upcs))],
    malformedUpcValues: [...new Set(perRecord.flatMap((item) => item.malformedUpcs))],
    modelFreeTextRecallNumbers: perRecord
      .filter((item) => item.models.length === 0 && item.signals.model)
      .map((item) => item.record.RecallNumber),
    upcFreeTextRecallNumbers: perRecord
      .filter((item) => item.upcs.length === 0 && item.signals.upc)
      .map((item) => item.record.RecallNumber),
    upcRecallNumbers: perRecord
      .filter((item) => item.usableUpcs.length > 0)
      .map((item) => item.record.RecallNumber),
  };
}

function normalizeRecord(record, category) {
  return {
    category,
    recallNumber: record.RecallNumber,
    recallDate: record.RecallDate,
    title: record.Title,
    products: (record.Products ?? []).map((product) => ({
      name: product.Name,
      description: product.Description,
      model: product.Model,
    })),
    upcs: (record.ProductUPCs ?? []).map((entry) => entry.UPC),
    hazard: flattenText(record.Hazards, 'Name'),
    remedy: flattenText(record.Remedies, 'Name'),
    officialUrl: record.URL,
    retrievalDate: RETRIEVAL_DATE,
  };
}

async function fetchOfficialJson(query) {
  const officialUrl = `http://www.saferproducts.gov/RestWebServices/Recall?ProductName=${encodeURIComponent(query)}&format=json`;
  // Encode the inner query delimiter so the fetch proxy forwards both CPSC parameters.
  const proxyUrl = `https://r.jina.ai/${officialUrl.replace('&format=', '%26format=')}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Fetch failed for ${query}: HTTP ${response.status}`);
  }

  const body = await response.text();
  const marker = 'Markdown Content:\n';
  const markerIndex = body.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error(`Remote fetch response for ${query} did not contain the expected payload marker`);
  }

  const rawJson = body.slice(markerIndex + marker.length).trim();
  const records = JSON.parse(rawJson);
  if (!Array.isArray(records)) {
    throw new Error(`Official response for ${query} was not an array`);
  }

  return { officialUrl, rawJson, records };
}

await mkdir(resolve(ROOT, 'fixtures/raw'), { recursive: true });
await mkdir(resolve(ROOT, 'fixtures/normalized'), { recursive: true });

const report = {
  retrievalDate: RETRIEVAL_DATE,
  method: 'Official CPSC Recall API response fetched through r.jina.ai because direct access returned the SaferProducts.gov maintenance page.',
  categories: {},
};

const normalized = [];
for (const category of categories) {
  const result = await fetchOfficialJson(category.query);
  await writeFile(
    resolve(ROOT, `fixtures/raw/cpsc-${category.key}.json`),
    `${result.rawJson}\n`,
    'utf8',
  );
  report.categories[category.key] = {
    query: category.query,
    officialUrl: result.officialUrl,
    ...analyze(result.records),
  };
  normalized.push(...result.records.map((record) => normalizeRecord(record, category.key)));
}

await writeFile(
  resolve(ROOT, 'fixtures/normalized/cpsc-sample.json'),
  `${JSON.stringify(normalized, null, 2)}\n`,
  'utf8',
);
await writeFile(
  resolve(ROOT, 'fixtures/analysis.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify(report, null, 2));
