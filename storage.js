(function attachStorage(global) {
  const KEY = 'conjumaster_data';

  function load(defaults) {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    try {
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  global.AppStorage = { load, save, KEY };
})(window);
