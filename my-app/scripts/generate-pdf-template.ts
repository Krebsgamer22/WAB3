import { createSwimmingProofTemplate } from '../src/lib/generate-template.js';
import { writeFileSync } from 'fs';

async function generate() {
  const pdfBytes = await createSwimmingProofTemplate();
  writeFileSync(
    'public/swimming-proof-templates/official-template.pdf', 
    pdfBytes
  );
  console.log('Template generated successfully');
}

generate().catch(console.error);
