import { apiKeys, apiRequest } from "../../apis";

const VERSION = "ide-3.0.0";

export const useTracking = () => {
  function makeContext() {
    let context = {};
    try {
      const {
        location: { pathname: path = "", search = "", href: url = "" } = {},
      } = window || {};

      context = {
        locale: navigator?.language,
        page: {
          path,
          search,
          title: document?.title,
          url:
            window?.location !== window?.parent?.location
              ? document?.referrer
              : url,
        },
        userAgent: navigator?.userAgent,
      };
    } catch (ex) {
      // just eat the error. this happens if an
      // event is fired server side inadvertently
    }
    return context;
  }

  async function request(path: string, data: { [key: string]: any } = {}) {
    try {
      await apiRequest({
        method: 'POST',
        url: apiKeys['track'],
        payload: {
          path,
          data
        }
      })
    } catch (e) {
      console.log(e);
    }   
  }

  function track(event: string, properties = {}, userId?: string) {
    request("t", {
      event,
      userId,
      properties: {
        ...properties,
        version: VERSION,
      },
      context: makeContext(),
    });
  }

  return {
    track,
  };
};
