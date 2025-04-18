export type EventLinkEnvironment =
  | "production"
  | "development"
  | "localhost"
  | "sandbox";

const redirectUri = {
  production: "https://app.event.dev/connections/oauth/callback",
  development: "https://development.event.dev/connections/oauth/callback",
  sandbox: "https://sandbox.event.dev/connections/oauth/callback",
  localhost: "http://localhost:4202/connections/oauth/callback",
};

export const getEnvFromHost = () => {
  try {
    console.log('🔍 getEnvFromHost: Determining environment from host...');
    
    if (window?.location) {
      console.log('🔍 Current location:', window.location.toString());
      console.log('🔍 Hostname:', window.location.hostname);
      
      if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
        console.log('✅ Environment detected: localhost');
        return "localhost";
      }

      const subdomain = window.location.host.split(".")[0];
      console.log('🔍 Detected subdomain:', subdomain);
      
      switch (subdomain) {
        case "authkit":
          console.log('✅ Environment detected: production');
          return "production";
        case "sandbox-authkit":
          console.log('✅ Environment detected: sandbox');
          return "sandbox";
        case "development-authkit":
          console.log('✅ Environment detected: development');
          return "development";
        default:
          console.log(`✅ Environment detected: using subdomain ${subdomain}`);
          return subdomain as EventLinkEnvironment;
      }
    } else {
      console.log('⚠️ No window.location available, defaulting to production');
      return "production";
    }
  } catch (error) {
    console.error('❌ Error detecting environment:', error);
    console.log('⚠️ Defaulting to localhost environment');
    return "localhost";
  }
};

export const EVENT_INC_DOMAIN = "picaos.com";

export const hostList = {
  localhost: `development-authkit.${EVENT_INC_DOMAIN}`,
  development: `development-authkit.${EVENT_INC_DOMAIN}`,
  sandbox: `sandbox-authkit.${EVENT_INC_DOMAIN}`,
  production: `authkit.${EVENT_INC_DOMAIN}`,
  //This is for typescript on the server and this arm will never be reached on the browser
  "": `development-authkit.${EVENT_INC_DOMAIN}`,
};

export const getRedirectUriFromHost = () => {
  try {
    if (window?.location) {
      if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
        return redirectUri.localhost;
      }
    }

    const subdomain = window.location.host.split(".")[0];

    switch (subdomain) {
      case "authkit":
        return redirectUri.production;
      case "sandbox-authkit":
        return redirectUri.sandbox;
      case "development-authkit":
        return redirectUri.development;
      default:
        return redirectUri.development;
    }
  } catch (error) {
    return redirectUri.development;
  }
};
