import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function createSwimmingProofTemplate() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('Swimming Proof Certificate', {
    x: 50,
    y: 350,
    size: 24,
    font,
  });

  const form = pdfDoc.getForm();
  form.createTextField('athleteName');
  form.createTextField('certificationDate');
  form.createTextField('eventName');
  form.createTextField('officialSignature');

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
