import {Vault} from "./vault.js";
import {useAppStore} from "../stores/app.js";
const { APP_AUTH0_DOMAIN, APP_CLIENT_ID, APP_REDIRECT_URI } = import.meta.env;

export const AuthClient = {
    handleAuth: async () => {
        useAppStore.setState({ loading: true })

        const key = "rftk"
        // await Vault.delete(key)
        try {
            const code = AuthClient.getAuthResponseFromCallbackUrl()
            const refreshToken = await Vault.read(key)
            let tokens = null;
            console.log(code, refreshToken, tokens)
            if (code) {
                tokens = await AuthClient.exchangeCodeForToken(code)
            } else  if (refreshToken) {
                tokens = await AuthClient.renewAccessToken(refreshToken)
            } else {
                await AuthClient.loginWithRedirect()
            }

            if (isOnRedirectUri()) window.location.href = window.location.origin

            if (tokens) {
                await Vault.save(key, tokens.refresh_token)
                useAppStore.setState({ user: await AuthClient.getUserInfo(tokens.id_token), loading: false })

            }
        } catch (e) {
            console.error(e)
        }
    },
    loginWithRedirect: async (requiresOffline = true) => {
        const auth0Domain = APP_AUTH0_DOMAIN;
        const clientId = APP_CLIENT_ID;
        const redirectUri = encodeURIComponent(APP_REDIRECT_URI);
        const scope = encodeURIComponent(`openid profile email ${ requiresOffline ? "offline_access" : "" }`);

        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        sessionStorage.setItem('code_verifier', codeVerifier);

        window.location.href = `https://${auth0Domain}/authorize?` +
            `client_id=${clientId}&` +
            `response_type=code&` +
            `redirect_uri=${redirectUri}&` +
            `scope=${scope}&` +
            `code_challenge=${codeChallenge}&` +
            `code_challenge_method=S256`;
    },

    getAuthResponseFromCallbackUrl: () => {
        if (!isOnRedirectUri()) return null
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get('code');
    },

    exchangeCodeForToken: async (code) => {
        const codeVerifier = sessionStorage.getItem("code_verifier")
        if (!codeVerifier) return null

        const body = {
            grant_type: 'authorization_code',
            client_id: APP_CLIENT_ID,
            code_verifier: codeVerifier,
            code: code,
            redirect_uri: APP_REDIRECT_URI,
        };

        try {
            const response = await fetch(`https://${APP_AUTH0_DOMAIN}/oauth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.error) {
                console.error('Error exchanging code for tokens:', data.error_description);
                return null;
            }

            // Store tokens securely
            sessionStorage.setItem('access_token', data.access_token);
            // ID token and refresh token (if requested) can also be stored similarly
            // Handle the tokens (e.g., to maintain user session or make authenticated API requests)
            return data;
        } catch (error) {
            console.error('Failed to exchange code:', error);
            return null;
        }
    },
    renewAccessToken: async (refreshToken) => {
        const url = `https://${APP_AUTH0_DOMAIN}/oauth/token`;

        const payload = {
            client_id: APP_CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: Object.keys(payload)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
                .join('&'),
        });

        return await response.json();

    },
    getSilentlyToken: async () => {
        try  {
            const tokens = await Vault.read("rftk")
            return AuthClient.renewAccessToken(tokens)
        } catch {
            return null
        }
    },
    getUserInfo: (idToken) => {
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const user = JSON.parse(jsonPayload)
        return {
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            picture: user.picture
        };
    }
}

const base64UrlEncode = (arrayBuffer) => {
    return btoa(String.fromCharCode.apply(null, arrayBuffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const isOnRedirectUri = ()  => {
    return  window.location.origin + window.location.pathname === APP_REDIRECT_URI;
}

const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64UrlEncode(array)
}

const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(hash));
}
