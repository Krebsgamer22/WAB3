import CertificatePDFViewer from './CertificatePDFViewer';

type AthleteProps = {
  athlete: {
    id: number;
    firstName: string;
    lastName: string;
    birthdate: Date;
    gender: string;
    discipline: string;
    email: string;
  };
};

const CertificateTemplate = ({ athlete }: AthleteProps) => (
  <CertificatePDFViewer athlete={athlete} />
);

export default CertificateTemplate;
