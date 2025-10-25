export const config = {
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key',
  // Removed GOOGLE_CLIENT_ID as Google OAuth is no longer supported
};
