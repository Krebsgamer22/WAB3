import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
// @ts-ignore - react-qr-code doesn't have proper TS support
const QRCode = require('react-qr-code');

type AthleteProps = {
  athlete: {
    id: number;
    firstName: string;
    lastName: string;
    birthdate: Date;
    gender: string;
  };
};

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  details: {
    marginBottom: 20,
    lineHeight: 1.5,
  },
  qrCode: {
    marginTop: 30,
    alignItems: 'center',
  },
});

// Create PDF document component
const CertificateTemplate = ({ athlete }: AthleteProps) => (
    <Document title="Athlete Certificate">
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Athlete Certificate</Text>
          <Text style={styles.subtitle}>{athlete.firstName} {athlete.lastName}</Text>
          
          <View style={styles.details}>
            <Text>Date: {new Date().toLocaleDateString()}</Text>
            <Text>Birthdate: {athlete.birthdate.toLocaleDateString()}</Text>
            <Text>Gender: {athlete.gender}</Text>
          </View>

          <View style={styles.qrCode}>
            <QRCode 
              value={`https://example.com/athletes/${athlete.id}`} 
              size={128}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
            />
          </View>
        </View>
      </Page>
    </Document>
);

export default CertificateTemplate;
