const WorkbenchFiles = (() => {
  const storeName = 'files';

  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('trademark-workbench-files', 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('材料存储正在被其他页面使用'));
    });
  }

  async function operate(mode, operation) {
    const database = await open();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));
        transaction.oncomplete = () => resolve(request.result);
        transaction.onabort = () => reject(transaction.error || request.error || new Error('材料存储操作未完成'));
      });
    } finally {
      database.close();
    }
  }

  const put = (id, file) => operate('readwrite', store => store.put(file, id));
  const remove = id => operate('readwrite', store => store.delete(id));

  async function download(id, name) {
    const file = await operate('readonly', store => store.get(id));
    if (!(file instanceof Blob)) throw new Error('此浏览器没有该材料的文件副本');
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { put, remove, download };
})();
