type SentryNodeModule = {
  init: (options: { dsn: string; environment: string; tracesSampleRate: number }) => void;
  captureException: (err: unknown) => void;
};

const SENTRY_DSN = process.env.SENTRY_DSN || '';
let sentryNode: SentryNodeModule | null = null;

function loadSentryNode() {
  if (sentryNode) return sentryNode;
  try {
    // Optional dependency: keep the app running if Sentry packages are not installed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sentryNode = require('@sentry/node') as SentryNodeModule;
    return sentryNode;
  } catch {
    return null;
  }
}

export function initSentry() {
  if (!SENTRY_DSN) return;
  if ((global as unknown as { __sentryInitialized?: boolean }).__sentryInitialized) return;

  const node = loadSentryNode();
  if (!node) return;

  node.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.0,
  });
  (global as unknown as { __sentryInitialized?: boolean }).__sentryInitialized = true;
}

export const captureException = (err: unknown) => {
  try {
    if (!SENTRY_DSN) return;
    const node = loadSentryNode();
    if (!node) return;
    node.captureException(err);
  } catch {}
};

export { initSentry, captureException };
