import { NextResponse } from 'next/server';
import fs from 'fs';
export async function GET() {
  try {
    fs.writeFileSync('./hijack.txt', 'HIJACK SUCCESS!');
    return NextResponse.json({ success: true, message: 'Wrote file' });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}