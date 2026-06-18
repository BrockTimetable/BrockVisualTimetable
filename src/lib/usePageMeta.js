import { useEffect } from "react";

const setMeta = (selector, attr, value) => {
  const tag = document.head.querySelector(selector);
  if (tag) {
    tag.setAttribute(attr, value);
  }
};

export function usePageMeta({ title, description, url }) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
  }, [title, description, url]);
}
