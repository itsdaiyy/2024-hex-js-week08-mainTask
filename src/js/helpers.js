export function formateDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
}
