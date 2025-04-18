import Cookies from 'js-cookie';
import { getEnvFromHost, hostList } from '../helpers/getEnvFromHost';
import { v4 as uuidv4 } from 'uuid';
import localforage from "localforage";


export const getCookie = () => {
  try {
    const cookie = document?.cookie;
    const matchingCookie = cookie
      ?.split(';')
      .map((item) => item.trim()) // Remove leading/trailing spaces
      .find((item) => item.startsWith(`picaos-embed-token=`));

    const token = matchingCookie?.split('=')?.[1];

    if (token) {
      return token;
    }

    return undefined;
  } catch (ex) {
    // console.warn(ex);
    // This is most likely due to an attempt to run in SSR.
    // eat it for now, try to remove the call from ssr things
    return undefined;
  }
};

export const getLocalStorage = () => {
  try {
    const data = localStorage.getItem("picaos-embed-token");
    return data;
  } catch (ex) {
    console.error(ex);
    return undefined;
  }
};

const env = getEnvFromHost();
const domainWithoutProtocol = env === "localhost" ? "localhost" : hostList[env];

export const setCookieFromJSONAcrossSubdomain = (value: string, cookieName?: string) => {
  try {
    Cookies.set(cookieName ?? 'picaos-embed-token', value, {
      // expires: 30,
      domain: env === "localhost" ? "localhost" : ".picaos.com",
      secure: true,
      path: '/',
      sameSite: 'none',
    });
  } catch (ex) {
    // SSR!
  }
}

export const setCookieFromJSON = (value: string, cookieName?: string) => {
  try {
    Cookies.set(cookieName ?? "picaos-embed-token", value, {
      expires: 30,
      domain: domainWithoutProtocol,
      secure: true,
      path: "/",
      sameSite: "none",
    });
  } catch (ex) {
    // SSR!
    console.error(ex);
  }
};

export const setLocalStorage = (value: string, cookieName?: string) => {
  try {
    localStorage.setItem(cookieName ?? "picaos-embed-token", value);
  } catch (ex) {
    console.error(ex);
  }
};

export const clearCookies = (name = 'picaos-embed-token') => {
  try {
    Cookies.remove(name, {
      domain: env === "localhost" ? "localhost" : ".picaos.com",
      path: '/',
      secure: true,
      sameSite: 'none'
    });
  } catch (error) {
    console.error(error);
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem("picaos-embed-token");
  } catch (error) {
    console.error(error);
  }
};

export function generateRandomId() {
  const uuid = uuidv4();
  const last8Chars = uuid.substr(uuid.length - 8);
  return last8Chars;
}

export const safeJSON = {
  parse: (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  },

  stringify: (obj: string | string[] | object) => {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return "";
    }
  },
};

export const cacheValue = (
  key: string,
  value: any,
  ttl: number = 30 * 24 * 60 * 1000,
) => {
  localforage.setItem(
    key,
    safeJSON.stringify({
      value,
      ttl: Date.now() + (ttl || 30 * 1000),
    }),
  );
};

export const clearCache = (key: string) => {
  localforage.removeItem(key);
};

export const getValueFromCache = async (key: string) => {
  const value: string = (await localforage.getItem(key)) || "";

  if (!value) return;
  const { ttl, value: _value } = safeJSON.parse(value);

  if (Date.now() > ttl) {
    clearCache(key);

    return;
  }

  return _value;
};