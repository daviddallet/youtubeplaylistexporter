// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, Container, Paper, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { Footer } from '../components/layout';
import { usePolicyContent } from '../hooks';
import { isPolicyEnabled, type PolicyType } from '../services/policy';

interface PolicyPageProps {
  type: PolicyType;
}

export function PolicyPage({ type }: PolicyPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { content, loading, error } = usePolicyContent(type);
  const enabled = isPolicyEnabled(type);

  // If policy is disabled, show a message
  if (!enabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3 }}>
            {t('terms.backToApp')}
          </Button>

          <Paper sx={{ p: 4 }}>
            <Alert severity="warning">{t('footer.demoWarning')}</Alert>
          </Paper>
        </Container>

        <Footer />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3 }}>
          {t('terms.backToApp')}
        </Button>

        <Paper sx={{ p: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}

          {content && (
            <Box
              sx={{
                '& h1': {
                  typography: 'h4',
                  mb: 1,
                },
                '& h2': {
                  typography: 'h6',
                  mt: 3,
                  mb: 1,
                },
                '& p': {
                  typography: 'body1',
                  mb: 2,
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& strong': {
                  fontWeight: 'bold',
                },
                '& hr': {
                  my: 3,
                  borderColor: 'divider',
                },
                '& ul, & ol': {
                  mb: 2,
                  pl: 3,
                },
                '& li': {
                  typography: 'body1',
                  mb: 0.5,
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'none',
                  },
                },
                '& code': {
                  fontFamily: 'monospace',
                  bgcolor: 'action.hover',
                  px: 0.5,
                  borderRadius: 0.5,
                },
              }}
            >
              <Markdown>{content}</Markdown>
            </Box>
          )}
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}

// Convenience exports for routing
export function TermsPage() {
  return <PolicyPage type="terms" />;
}

export function PrivacyPage() {
  return <PolicyPage type="privacy" />;
}
