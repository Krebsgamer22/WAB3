'use client';

import { 
  Document as PdfDocument,
  Page as PdfPage,
  Text as PdfText,  // Ensure PascalCase alias
  View as PdfView,
  StyleSheet 
} from '@react-pdf/renderer';
import QRCode from 'react-qr-code';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 20, marginBottom: 30, textAlign: 'center' },
  details: { marginBottom: 20, lineHeight: 1.5 },
  qrCode: { marginTop: 30, alignItems: 'center' }
});

export default function CertificatePDFViewer({ athlete }: {
  athlete: {
    id: number;
    firstName: string;
    lastName: string;
    birthdate: Date;
    gender: string;
    discipline: string;
    email: string;
  }
}) {
  return (
    <PdfDocument title="Athlete Certificate">
      <PdfPage style={styles.page}>
        <PdfView style={styles.section}>
          <PdfText style={styles.title}>Athlete Certificate</PdfText>
          <PdfText style={styles.subtitle}>{athlete.firstName} {athlete.lastName}</PdfText>
          
          <PdfView style={styles.details}>
            <PdfText>Date: {new Date().toLocaleDateString()}</PdfText>
            <PdfText>Birthdate: {athlete.birthdate.toLocaleDateString()}</PdfText>
            <PdfText>Gender: {athlete.gender}</PdfText>
            <PdfText>Discipline: {athlete.discipline}</PdfText>
            <PdfText>Email: {athlete.email}</PdfText>
          </PdfView>

          <PdfView style={styles.qrCode}>
            <QRCode 
              value={`https://example.com/athletes/${athlete.id}`}
              size={128}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
            />
          </PdfView>
        </PdfView>
      </PdfPage>
    </PdfDocument>
  );
}
