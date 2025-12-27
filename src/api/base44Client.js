import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client without requiring authentication
export const base44 = createClient({
  appId: "694be63e20435b3bb56af00d", 
  requiresAuth: false, // Changed to false to prevent automatic redirects
  autoInitAuth: false // Explicitly disable auto-init auth
});