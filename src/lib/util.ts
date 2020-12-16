const testFileUrl: string = '/test/test-file.xlsx';

export const fetchTestFile: (url?: string) => Promise<Blob | null> = async function (url: string = testFileUrl) {
  try {
    const res = await window.fetch(url);
    let blob = await res.blob();
    // blob = new Blob([blob], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    // });
    return blob;
  } catch {
    return null;
  }
};