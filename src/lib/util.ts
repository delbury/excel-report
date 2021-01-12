const testFileUrl: string = '/test/test-file.xlsx';

export const fetchTestFile: (url?: string) => Promise<Blob | null> = function (url: string = testFileUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await window.fetch(url);
      
      if (res.status >= 200 && res.status < 300) {
        let blob = await res.blob();
        resolve(blob);
      } else {
        reject(new Error('fetch file error !'));
      }
      // blob = new Blob([blob], {
      //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      // });
    } catch {
      reject(new Error('get file error !'));
    }
  });
};