import { useEffect } from "react";

const Auth = ({}) => {
  const onVerify = (code: string) => verifyLink(code);
  const onCode = (code: string) => createAccessToken(code);

  const updateURL = (location: URL) =>
    window.history.pushState(null, "", location.toString());

  useEffect(() => {
    const location = new URL(window.location.href);
    const { searchParams: search } = location;

    if (search.has("magic")) {
      const magic = search.get("magic");
      if (magic) {
        onVerify(magic);
      }

      search.delete("magic");

      updateURL(location);
    }

    if (search.has("code")) {
      const code = search.get("code");
      if (code) {
        onCode(code);
      }

      search.delete("code");

      updateURL(location);
    }

    if (search.has("state")) {
      search.delete("state");

      updateURL(location);
    }
  }, [window.location]);

  return <></>;
};

export default Auth;

export const provider =
  process.env.VITE_AUTH_PROVIDER || "http://localhost:8081/v1/private";

let listeners: any[] = [];

export async function createLink(email: string, link?: string) {
  const query = new URLSearchParams();
  query.set("email", email);
  query.set("link", link || window.location.href);

  const response = await fetch(provider + "/magic/create?" + query.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `failed to create magic link: ${response.status} ${await response.text()}`
    );
  }
}

export async function verifyLink(code: string) {
  const query = new URLSearchParams();
  query.set("code", code);

  const input = document.createElement("input");
  input.type = "submit";

  const form = document.createElement("form");
  form.action = provider + "/magic/verify?" + query.toString();
  form.method = "POST";

  form.appendChild(input);
  document.body.appendChild(form);

  input.click();
}

function setCookie(name: string, value: string) {
  let domain;

  if (
    window.location.hostname.endsWith(".joltz.app") ||
    window.location.hostname === "joltz.app"
  ) {
    domain = ".joltz.app";
  }

  let secure = true;

  if (window.location.protocol === "http:") {
    secure = false;
  }

  document.cookie = `${name} = ${value};${
    domain ? `domain = ${domain}; ` : ""
  }path = /; ${secure ? "samesite = none" : ""}; max-age = ${
    60 * 60 * 24 * 365
  }${secure ? "; secure" : ""}`;
}

function removeCookie(name: string) {
  let domain;

  if (
    window.location.hostname.endsWith(".joltz.app") ||
    window.location.hostname == "joltz.app"
  ) {
    domain = ".joltz.app";
  }

  document.cookie = `${name}=; ${
    domain ? `domain = ${domain}; ` : ""
  }path = /; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${name}=; domain = joltz.app; path = /; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const cookie = document.cookie.split("; ").find((x) => x.startsWith(prefix));

  if (!cookie) {
    return undefined;
  }

  return cookie.slice(prefix.length);
}

export async function createAccessToken(code: string, domain?: string) {
  const query = new URLSearchParams();
  query.set("grant_type", "authorization_code");
  query.set("code", code);

  const response = await fetch(provider + "/oauth2/token?" + query.toString(), {
    method: "POST",
    headers: {
      authorization: "Basic am9sdHo6am9sdHo=",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      `failed to get access token: ${response.status} ${await response.text()}`
    );
  }

  const { access_token: access, refresh_token: refresh } =
    await response.json();

  setCookie("oauth2:access", access);
  setCookie("oauth2:refresh", refresh);

  listeners.forEach((listener) => {
    listener(true);
  });
}

export function getAccessToken(): string | undefined {
  return getCookie("oauth2:access");
}

export function getRefreshToken(): string | undefined {
  return getCookie("oauth2:refresh");
}

export function onStateChange(listener: any) {
  listeners.push(listener);

  if (getCookie("oauth2:access")) {
    listener(true);
  }
}

export function decodeJWT(raw: string): null | string {
  if (!raw || raw == "") {
    return null;
  }

  return atob(raw.split(".")[1]);
}

// equivalent to `nhost.auth.isAuthenticated()`
export function isAuthenticated(): boolean {
  return getCookie("oauth2:access") != null;
}

export function logout() {
  removeCookie("oauth2:access");
  removeCookie("oauth2:refresh");
}
