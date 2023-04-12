export const fetcher = (url: string) =>
  fetch(url).then((res) =>
    res.ok ? res.json() : res.text().then((text) => Promise.reject(text))
  );
