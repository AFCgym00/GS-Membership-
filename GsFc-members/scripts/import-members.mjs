// Imports GSFC members from data/members.csv into the `members` collection.
//
// Design choices, spelled out so nothing here is a silent surprise:
//  - Every raw sheet value is stored as written. Nothing is defaulted or
//    invented for a blank cell (blank stays null, not "600" or "OWNER").
//  - The CSV has NO "plan" column. Every fee in the sheet is 700, which is
//    Regular Plan (600) + a 100 admission fee, so plan is set to
//    "Regular Plan" for every imported row as a documented ASSUMPTION, not
//    something read from the sheet. Override with --plan "Other Plan Name"
//    if that assumption is wrong for this batch.
//  - Dates are "D-Mon-YY" (e.g. "28-Jun-26"), which is NOT safely parsed by
//    `new Date(str)` (engine-dependent, can silently produce Invalid Date
//    or the wrong day). This script parses them explicitly.
//  - duration is derived from the actual start/end date gap (not guessed).
//  - status is derived from end_date vs. today, with a 7-day
//    "Expiring Soon" window, matching the statuses already used elsewhere
//    in this app.
//  - member_id (the sheet's "Unique ID", e.g. GSFC01) must be unique.
//    A duplicate member_id WITHIN the CSV aborts the import — that's a
//    data problem to go fix at the source, not paper over.
//    A duplicate phone number across different member_ids is NOT an error
//    (family members in the same flat legitimately share a number) — it's
//    only logged as an FYI.
//  - Rows already present in MongoDB (matched by member_id) are skipped,
//    not overwritten, so re-running this script is safe.
//
// Usage:
//   npm install csv-parser   (one-time, if not already installed)
//   MONGODB_URI="mongodb+srv://..." node scripts/import-members.mjs
//   MONGODB_URI="..." node scripts/import-members.mjs --dry-run
//   MONGODB_URI="..." node scripts/import-members.mjs --csv data/other.csv
//   MONGODB_URI="..." node scripts/import-members.mjs --plan "Semi Advance Plan"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from 'mongodb';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvArgIndex = args.indexOf('--csv');
const csvPath = csvArgIndex !== -1
  ? path.resolve(process.cwd(), args[csvArgIndex + 1])
  : path.join(__dirname, '../data/members.csv');
const planArgIndex = args.indexOf('--plan');
const assumedPlan = planArgIndex !== -1 ? args[planArgIndex + 1] : 'Regular Plan';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'afc_gym';

if (!uri) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Parses "D-Mon-YY" / "DD-Mon-YY" (e.g. "28-Jun-26") into a UTC Date, or null if unparseable. */
function parseSheetDate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (!match) return null;
  const [, dayStr, monStr, yearStr] = match;
  const month = MONTHS[monStr.toLowerCase()];
  if (month === undefined) return null;
  const day = Number(dayStr);
  const year = yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Derives a plan-duration label from the actual day gap between two dates — not guessed. */
function deriveDuration(start, end) {
  if (!start || !end) return null;
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (days <= 35) return '1 Month';
  if (days <= 100) return '3 Months';
  if (days <= 200) return '6 Months';
  return '12 Months';
}

function deriveStatus(end) {
  if (!end) return 'Active';
  const now = new Date();
  const daysLeft = Math.round((end.getTime() - now.getTime()) / 86_400_000);
  if (daysLeft < 0) return 'Expired';
  if (daysLeft <= 7) return 'Expiring Soon';
  return 'Active';
}

function clean(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function loadRows() {
  return new Promise((resolve, reject) => {
    const rows = [];
    let rowNum = 1; // header is row 1

    fs.createReadStream(csvPath)
      .pipe(csv({ separator: '\t' }))
      .on('data', (row) => {
        rowNum += 1;
        const member_id = clean(row['Unique ID']);
        const name = clean(row['Name']);

        // Skip fully blank trailing rows.
        if (!member_id && !name) return;

        if (!member_id || !name) {
          console.warn(`Row ${rowNum}: skipped — missing ${!member_id ? 'Unique ID' : 'Name'}.`);
          return;
        }

        const feesRaw = clean(row['Fees (Membership+Admission)']);
        const fees = feesRaw === null ? NaN : Number(feesRaw);
        if (Number.isNaN(fees)) {
          console.warn(`Row ${rowNum} (${member_id}): skipped — fees value "${feesRaw}" is not a number.`);
          return;
        }

        const start_date = parseSheetDate(row['Start date']);
        const end_date = parseSheetDate(row['End date']);
        const registered_on = parseSheetDate(row['Date']);

        if (row['Start date'] && !start_date) {
          console.warn(`Row ${rowNum} (${member_id}): could not parse Start date "${row['Start date']}" — stored as null.`);
        }
        if (row['End date'] && !end_date) {
          console.warn(`Row ${rowNum} (${member_id}): could not parse End date "${row['End date']}" — stored as null.`);
        }

        rows.push({
          member_id,
          name,
          gender: clean(row['Gender']),
          wing_flat: clean(row['Wing/Flat']),
          phone: clean(row['Contact no']),
          email: null,
          ownership: clean(row['Ownership']),
          preferred_timing: clean(row['Preferred timing']),
          plan: assumedPlan,
          duration: deriveDuration(start_date, end_date),
          start_date,
          end_date,
          status: deriveStatus(end_date),
          paid: fees,
          payment_type: clean(row['Payment type']),
          remark: clean(row['REMARK']),
          registered_on,
          created_at: new Date(),
        });
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  console.log(`Reading ${csvPath} ...`);
  const rows = await loadRows();
  console.log(`Parsed ${rows.length} valid member row(s).`);
  console.log(`Assuming plan = "${assumedPlan}" for all imported rows (not present in the sheet).`);

  // Duplicate member_id WITHIN the CSV — hard stop, this is a data integrity
  // problem in the source sheet that should be fixed there, not imported.
  const seenIds = new Map();
  for (const row of rows) {
    if (seenIds.has(row.member_id)) {
      console.error(
        `Duplicate Unique ID "${row.member_id}" found in the CSV (rows for "${seenIds.get(row.member_id)}" and "${row.name}"). Fix the sheet and re-run.`
      );
      process.exit(1);
    }
    seenIds.set(row.member_id, row.name);
  }

  // Duplicate phone numbers — informational only, not an error.
  const phoneMap = new Map();
  for (const row of rows) {
    if (!row.phone) continue;
    if (!phoneMap.has(row.phone)) phoneMap.set(row.phone, []);
    phoneMap.get(row.phone).push(`${row.member_id} (${row.name})`);
  }
  for (const [phone, owners] of phoneMap) {
    if (owners.length > 1) {
      console.log(`FYI: phone ${phone} is shared by ${owners.join(', ')}.`);
    }
  }

  if (dryRun) {
    console.log('--dry-run set: not connecting to MongoDB. Sample row:');
    console.log(rows[0]);
    return;
  }

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const members = db.collection('members');

    await members.createIndex(
      { member_id: 1 },
      { unique: true, partialFilterExpression: { member_id: { $type: 'string' } } }
    );

    const existingIds = new Set(
      (await members.find({ member_id: { $in: rows.map((r) => r.member_id) } })
        .project({ member_id: 1 })
        .toArray()).map((d) => d.member_id)
    );

    const toInsert = rows.filter((r) => !existingIds.has(r.member_id));
    const skipped = rows.length - toInsert.length;

    if (skipped > 0) {
      console.log(`Skipping ${skipped} member(s) already in the database.`);
    }

    if (toInsert.length === 0) {
      console.log('Nothing new to insert.');
      return;
    }

    const result = await members.insertMany(toInsert);
    console.log(`Inserted ${result.insertedCount} new member(s).`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
