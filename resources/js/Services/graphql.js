function csrfHeaders(headers = {}) {
    const cookieToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.slice('XSRF-TOKEN='.length);

    if (cookieToken) return { ...headers, 'X-XSRF-TOKEN': decodeURIComponent(cookieToken) };

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token ? { ...headers, 'X-CSRF-TOKEN': token } : headers;
}

export async function graphqlRequest(query, variables = {}) {
    const response = await fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: csrfHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ query, variables }),
    });

    if (response.status === 401) {
        window.location.assign(route('login'));
        throw new Error('Your session has expired. Please sign in again.');
    }

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.errors?.length) {
        throw new Error(result?.errors?.[0]?.message || result?.message || 'The request could not be completed.');
    }

    return result.data;
}
