export const reciptGenerator = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REC-${dateStr}-${randomChars}`;
};
