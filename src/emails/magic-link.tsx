import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components';
import { render } from '@react-email/components';

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Ton lien pour continuer sur Buildr</Preview>
      <Body style={{ backgroundColor: '#F4F6F8', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <Container style={{ backgroundColor: '#FFFFFF', borderRadius: 16, margin: '40px auto', maxWidth: 480, padding: 32 }}>
          <Text style={{ color: '#101828', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
            Ton business. Construis-le.
          </Text>
          <Text style={{ color: '#667085', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
            Clique pour reprendre ton parcours là où tu l’as laissé. Ce lien expire dans 24 heures.
          </Text>
          <Section>
            <Button
              href={url}
              style={{
                backgroundColor: '#FF7A1A',
                borderRadius: 12,
                color: '#FFFFFF',
                display: 'inline-block',
                fontSize: 14,
                fontWeight: 500,
                padding: '12px 24px',
                textDecoration: 'none',
              }}
            >
              Continuer
            </Button>
          </Section>
          <Text style={{ color: '#667085', fontSize: 12, lineHeight: 1.6, margin: '24px 0 0' }}>
            Si tu n’as pas demandé ce lien, ignore cet e-mail.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderMagicLinkEmail(url: string): Promise<string> {
  return render(<MagicLinkEmail url={url} />);
}
