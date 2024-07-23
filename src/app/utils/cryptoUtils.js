export const encode = (data) => {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (e) {
    console.error('Base64 encoding failed:', e);
    return null;
  }
};

// Base64 Decode
export const decode = (encodedData) => {
  try {
    return decodeURIComponent(escape(atob(encodedData)));
  } catch (e) {
    console.error('Base64 decoding failed:', e);
    return null;
  }
};
