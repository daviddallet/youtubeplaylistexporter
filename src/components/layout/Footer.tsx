// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { Box, Typography, Link } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { isPolicyEnabled, isAnyPolicyEnabled } from '../../services/policy';

export function Footer() {
  const { t } = useTranslation();
  const termsEnabled = isPolicyEnabled('terms');
  const privacyEnabled = isPolicyEnabled('privacy');
  const anyPolicyEnabled = isAnyPolicyEnabled();
  const isOfficialDomain = window.location.hostname.endsWith('.pwasuite.com');

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        opacity: 0.7,
        '&:hover': {
          opacity: 1,
        },
        transition: 'opacity 0.2s ease',
      }}
    >
      {!isOfficialDomain && (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, color: 'error.main' }}>
          {t('footer.unofficialDeployment')}
        </Typography>
      )}
      {anyPolicyEnabled ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
          {t('footer.privacyFirst')}{' '}
          {termsEnabled && (
            <Link href="#/terms" color="inherit" sx={{ textDecoration: 'underline' }}>
              {t('footer.termsLink')}
            </Link>
          )}
          {termsEnabled && privacyEnabled && ' & '}
          {privacyEnabled && (
            <Link href="#/privacy" color="inherit" sx={{ textDecoration: 'underline' }}>
              {t('footer.privacyLink')}
            </Link>
          )}
          .
        </Typography>
      ) : (
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            mb: 0.5,
            color: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: '1rem' }} />
          {t('footer.demoWarning')}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        {t('footer.seeOur')}{' '}
        <Link
          href="https://github.com/pwasuite/youtubeplaylistexporter"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ textDecoration: 'underline' }}
        >
          {t('footer.githubRepo')}
        </Link>{' '}
        {t('footer.forSource')} -{' '}
        <Link
          href="https://youtubeplaylistexporter.pwasuite.com/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ textDecoration: 'underline' }}
        >
          {t('app.title')}
        </Link>{' '}
        {t('footer.by')}{' '}
        <Link
          href="https://pwasuite.com/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{ textDecoration: 'underline' }}
        >
          PWA Suite
        </Link>
      </Typography>
    </Box>
  );
}
