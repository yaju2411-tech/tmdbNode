export const getAdminEmails = () => {
    const raw = process.env.ADMIN_EMAILS || "yaju2411@gmail.com,jbpsky@gmail.com";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
};

export const checkIsAdminEmail = (email) => {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const adminList = getAdminEmails();
    return adminList.includes(normalized);
};

export default checkIsAdminEmail;
