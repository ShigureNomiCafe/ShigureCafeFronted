export const formatStatus = (status: string | undefined) => {
  if (!status) return '';
  const map: Record<string, string> = {
    ACTIVE: '正常',
    PENDING: '待审核',
    BANNED: '封禁'
  };
  return map[status] || status;
};

export const formatRole = (role: string | undefined) => {
  if (!role) return '';
  const map: Record<string, string> = {
    ADMIN: '管理员',
    USER: '普通用户'
  };
  return map[role] || role;
};
